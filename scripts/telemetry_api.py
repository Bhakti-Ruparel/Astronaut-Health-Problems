import hmac
import logging
import os
import time
from datetime import datetime, timezone
from typing import Optional

import psycopg
import uvicorn
from fastapi import FastAPI, Header, HTTPException, Request, Response
from pydantic import BaseModel

from neon_data import connect


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("astromind.telemetry")
app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
LIVE_STALE_SECONDS = 180


@app.api_route("/", methods=["GET", "HEAD"], include_in_schema=False)
def healthcheck(request: Request):
    if request.method == "HEAD":
        return Response(status_code=200)
    return {"status": "ok"}


class MonitoringRequest(BaseModel):
    userId: str


def require_internal_token(authorization: Optional[str]):
    expected_token = os.getenv("ASTROMIND_INTERNAL_TOKEN", "").strip()
    if not expected_token or not authorization:
        raise HTTPException(status_code=401, detail="Internal authorization is required.")
    scheme, separator, supplied_token = authorization.partition(" ")
    if (
        not separator
        or scheme.lower() != "bearer"
        or not hmac.compare_digest(supplied_token, expected_token)
    ):
        raise HTTPException(status_code=401, detail="Internal authorization is invalid.")


@app.post("/internal/monitoring")
def read_monitoring(
    payload: MonitoringRequest,
    authorization: Optional[str] = Header(default=None),
):
    require_internal_token(authorization)
    for attempt in range(3):
        try:
            with connect() as connection:
                account = connection.execute(
                    """
                    SELECT astronaut_id
                    FROM astronaut_web_accounts
                    WHERE auth_user_id = %s
                    LIMIT 1
                    """,
                    (payload.userId,),
                ).fetchone()
                if not account:
                    raise HTTPException(
                        status_code=403,
                        detail="This account is not assigned to an astronaut.",
                    )

                astronaut_id = account["astronaut_id"]
                readings = connection.execute(
                    """
                    SELECT *
                    FROM (
                        SELECT
                            'reference'::text AS stream_type, astronaut_id, recorded_at, source,
                            heart_rate_bpm, spo2_percent, systolic_bp, diastolic_bp,
                            body_temperature_c, respiratory_rate, ecg_heart_rate_bpm,
                            activity_level, sleep_hours, body_weight_kg, radiation_exposure_msv,
                            anomaly_pred, anomaly_score, overall_status, anomalous_features
                        FROM astro_reference_telemetry
                        WHERE astronaut_id = %s
                        UNION ALL
                        SELECT
                            'live'::text AS stream_type, astronaut_id, recorded_at, source,
                            heart_rate_bpm, spo2_percent, systolic_bp, diastolic_bp,
                            body_temperature_c, respiratory_rate, ecg_heart_rate_bpm,
                            activity_level, sleep_hours, body_weight_kg, radiation_exposure_msv,
                            anomaly_pred, anomaly_score, overall_status, anomalous_features
                        FROM health_telemetry
                        WHERE astronaut_id = %s
                    ) AS astronaut_readings
                    ORDER BY recorded_at DESC
                    LIMIT 100
                    """,
                    (astronaut_id, astronaut_id),
                ).fetchall()
            break
        except HTTPException:
            raise
        except psycopg.OperationalError as error:
            if attempt == 2:
                logger.error("Monitoring query failed (%s) after retries.", type(error).__name__)
                raise HTTPException(
                    status_code=503,
                    detail="Monitoring data is unavailable. Check the Neon connection.",
                ) from error
            time.sleep(0.5 * (2**attempt))
        except psycopg.Error as error:
            logger.error("Monitoring query failed (%s).", type(error).__name__)
            raise HTTPException(
                status_code=503,
                detail="Monitoring data is unavailable. Check the Neon schema and connection.",
            ) from error

    latest_live = next(
        (reading for reading in readings if reading["stream_type"] == "live"),
        None,
    )
    is_live = False
    if latest_live:
        recorded_at = latest_live["recorded_at"]
        if recorded_at.tzinfo is None:
            recorded_at = recorded_at.replace(tzinfo=timezone.utc)
        age_seconds = (datetime.now(timezone.utc) - recorded_at).total_seconds()
        is_live = age_seconds <= LIVE_STALE_SECONDS

    return {
        "astronautId": astronaut_id,
        "readings": readings,
        "isLive": is_live,
        "liveStaleAfterSeconds": LIVE_STALE_SECONDS,
    }


if __name__ == "__main__":
    import dotenv

    dotenv.load_dotenv()
    dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))
    uvicorn.run(app, host="127.0.0.1", port=8788)
