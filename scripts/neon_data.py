import json
import os
import sys
from pathlib import Path

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row


PROJECT_DIR = Path(__file__).resolve().parents[1]


def connect():
    load_dotenv(PROJECT_DIR / ".env.local")
    database_url = os.getenv("DATABASE_URL_UNPOOLED") or os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL is not configured.")
    return psycopg.connect(database_url, connect_timeout=10, row_factory=dict_row)


def list_astronauts():
    with connect() as connection:
        rows = connection.execute(
            """
            SELECT astronauts.astronaut_id, accounts.auth_user_id
            FROM (
                SELECT DISTINCT astronaut_id
                FROM astro_reference_telemetry
            ) AS astronauts
            LEFT JOIN astronaut_web_accounts AS accounts
                USING (astronaut_id)
            ORDER BY astronauts.astronaut_id
            """
        ).fetchall()
    return rows


def bind_account(auth_user_id, astronaut_id):
    with connect() as connection:
        connection.execute(
            """
            INSERT INTO astronaut_web_accounts (auth_user_id, astronaut_id)
            VALUES (%s, %s)
            ON CONFLICT DO NOTHING
            """,
            (auth_user_id, astronaut_id),
        )
        row = connection.execute(
            """
            SELECT astronaut_id
            FROM astronaut_web_accounts
            WHERE auth_user_id = %s
            """,
            (auth_user_id,),
        ).fetchone()
        if not row or row["astronaut_id"] != astronaut_id:
            raise ValueError("The account is already assigned to a different astronaut.")


def main():
    if len(sys.argv) == 2 and sys.argv[1] == "astronauts":
        print(json.dumps(list_astronauts()))
        return
    if len(sys.argv) == 4 and sys.argv[1] == "bind":
        bind_account(sys.argv[2], sys.argv[3])
        print("ok")
        return
    raise ValueError("Expected `astronauts` or `bind <auth-user-id> <astronaut-id>`.")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, psycopg.Error) as error:
        print(f"Neon database helper failed ({type(error).__name__}).", file=sys.stderr)
        raise SystemExit(1) from error
