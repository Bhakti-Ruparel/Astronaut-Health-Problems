import os
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
