#!/usr/bin/env python3
"""Import the supplied raw CSV into Neon after scoring it with the existing model."""

import csv
import hashlib
import math
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import psycopg
from dotenv import load_dotenv
from psycopg.types.json import Jsonb

PROJECT_DIR = Path(__file__).resolve().parents[1]
WORKSPACE_DIR = PROJECT_DIR.parent
DEFAULT_CSV = WORKSPACE_DIR / "ML_Model" / "astronaut_health_telemetry_full.csv"
BLE_PROJECT = WORKSPACE_DIR / "astronaut_health_ble"
MODEL_ARTIFACT = BLE_PROJECT / "model" / "astronaut_health_isolation_forest.joblib"
MIGRATION = PROJECT_DIR / "migrations" / "001_astronaut_monitoring.sql"
FEATURE_COLUMNS = (
    "heart_rate_bpm",
    "spo2_percent",
    "systolic_bp",
    "diastolic_bp",
    "body_temperature_c",
    "respiratory_rate",
    "ecg_heart_rate_bpm",
    "activity_level",
    "sleep_hours",
    "body_weight_kg",
    "radiation_exposure_msv",
)
DATASET_KEY = "astronaut_health_telemetry_scored.csv"


def load_model():
    if not MODEL_ARTIFACT.is_file():
        raise FileNotFoundError(f"Trained model artifact was not found: {MODEL_ARTIFACT}")
    model_source = BLE_PROJECT / "anomaly_model.py"
    if not model_source.is_file():
        raise FileNotFoundError(f"Model source was not found: {model_source}")
    sys.path.insert(0, str(BLE_PROJECT))
    from anomaly_model import HealthAnomalyModel

    return HealthAnomalyModel()


def prepare_rows(csv_path: Path, detector: Any) -> tuple[str, list[tuple[Any, ...]]]:
    if not csv_path.is_file():
        raise FileNotFoundError(f"Telemetry CSV was not found: {csv_path}")

    digest = hashlib.sha256(csv_path.read_bytes()).hexdigest()
    required = {"astronaut_id", "timestamp", "source", *FEATURE_COLUMNS}
    records: list[tuple[Any, ...]] = []
    with csv_path.open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        missing = required.difference(reader.fieldnames or [])
        if missing:
            raise ValueError(f"CSV is missing columns: {sorted(missing)}")

        for row_number, row in enumerate(reader, start=2):
            try:
                astronaut_id = row["astronaut_id"].strip()
                source = row["source"].strip()
                timestamp = datetime.fromisoformat(
                    row["timestamp"].strip().replace("Z", "+00:00")
                )
                if timestamp.tzinfo is None:
                    timestamp = timestamp.replace(tzinfo=timezone.utc)
                timestamp = timestamp.astimezone(timezone.utc)
                features = {key: float(row[key]) for key in FEATURE_COLUMNS}
                if not astronaut_id or not source or not all(
                    math.isfinite(value) for value in features.values()
                ):
                    raise ValueError("Astronaut, source, or feature value is invalid.")
                analysis = detector.analyze(features)
                prediction = int(analysis["anomaly_pred"])
                score = float(analysis["anomaly_score"])
                if prediction not in (-1, 1) or not math.isfinite(score):
                    raise ValueError("Model returned an invalid anomaly result.")
            except (KeyError, TypeError, ValueError, OverflowError) as error:
                raise ValueError(f"Invalid CSV row {row_number}: {error}") from error

            payload = {
                "astronaut_id": astronaut_id,
                "timestamp": timestamp.isoformat(),
                "source": source,
                **features,
                **analysis,
            }
            event_id = uuid.uuid5(
                uuid.NAMESPACE_URL,
                f"astro-telemetry:{DATASET_KEY}:{row_number}",
            )
            records.append(
                (
                    event_id,
                    astronaut_id,
                    timestamp,
                    source,
                    *(features[key] for key in FEATURE_COLUMNS),
                    prediction,
                    score,
                    analysis["overall_status"],
                    Jsonb(analysis["anomalous_features"]),
                    Jsonb(payload),
                )
            )

    if not records:
        raise ValueError("Telemetry CSV contains no readings.")
    return digest, records


def main() -> None:
    load_dotenv(PROJECT_DIR / ".env.local", override=False)
    database_url = os.environ.get("DATABASE_URL_UNPOOLED") or os.environ.get(
        "DATABASE_URL"
    )
    if not database_url:
        raise RuntimeError(
            "DATABASE_URL is missing. Add the server-only Neon connection string "
            "to Astronaut-Health-Problems/.env.local."
        )

    csv_path = Path(os.environ.get("ASTRONAUT_TELEMETRY_CSV", str(DEFAULT_CSV)))
    detector = load_model()
    digest, records = prepare_rows(csv_path, detector)
    statements = [
        part.strip()
        for part in MIGRATION.read_text(encoding="utf-8").split(";")
        if part.strip()
    ]

    insert_sql = """
        INSERT INTO astro_reference_telemetry (
            event_id, astronaut_id, recorded_at, source, heart_rate_bpm,
            spo2_percent, systolic_bp, diastolic_bp, body_temperature_c,
            respiratory_rate, ecg_heart_rate_bpm, activity_level, sleep_hours,
            body_weight_kg, radiation_exposure_msv, anomaly_pred, anomaly_score,
            overall_status, anomalous_features, raw_payload
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s
        )
        ON CONFLICT (event_id) DO UPDATE SET
            astronaut_id = EXCLUDED.astronaut_id,
            recorded_at = EXCLUDED.recorded_at,
            source = EXCLUDED.source,
            heart_rate_bpm = EXCLUDED.heart_rate_bpm,
            spo2_percent = EXCLUDED.spo2_percent,
            systolic_bp = EXCLUDED.systolic_bp,
            diastolic_bp = EXCLUDED.diastolic_bp,
            body_temperature_c = EXCLUDED.body_temperature_c,
            respiratory_rate = EXCLUDED.respiratory_rate,
            ecg_heart_rate_bpm = EXCLUDED.ecg_heart_rate_bpm,
            activity_level = EXCLUDED.activity_level,
            sleep_hours = EXCLUDED.sleep_hours,
            body_weight_kg = EXCLUDED.body_weight_kg,
            radiation_exposure_msv = EXCLUDED.radiation_exposure_msv,
            anomaly_pred = EXCLUDED.anomaly_pred,
            anomaly_score = EXCLUDED.anomaly_score,
            overall_status = EXCLUDED.overall_status,
            anomalous_features = EXCLUDED.anomalous_features,
            raw_payload = EXCLUDED.raw_payload
    """

    with psycopg.connect(database_url, connect_timeout=10) as connection:
        with connection.transaction():
            with connection.cursor() as cursor:
                for statement in statements:
                    cursor.execute(statement)
                cursor.executemany(insert_sql, records)

    print(
        f"Imported {len(records)} model-scored reference readings for "
        f"{len({record[1] for record in records})} astronauts "
        f"(SHA-256 {digest[:12]}...)."
    )


if __name__ == "__main__":
    main()
