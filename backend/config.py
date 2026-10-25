"""TaskFlow Cloud — backend configuration (Phase 3).

Everything comes from environment variables; nothing secret is hardcoded.
Local default is SQLite. For AWS/RDS, set DATABASE_URL to the Postgres URL:

    DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@RDS-ENDPOINT:5432/taskflow

See .env.example for the full list.
"""
import os
from datetime import timedelta


def _database_uri():
    raw = os.getenv("DATABASE_URL", "sqlite:///taskflow.db").strip()
    # Heroku-style URLs use postgres:// but SQLAlchemy needs postgresql://
    if raw.startswith("postgres://"):
        raw = raw.replace("postgres://", "postgresql://", 1)
    return raw


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
    SQLALCHEMY_DATABASE_URI = _database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}

    # Auth tokens (Phase 4). 1 day is student-friendly; shorten in production.
    # Default is long enough to silence JWT length warnings — still dev-only.
    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY", "dev-only-jwt-secret-change-me-in-production-0123456789"
    )
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        hours=int(os.getenv("JWT_EXPIRES_HOURS", "24"))
    )

    # CORS: comma-separated list, e.g. "http://localhost:5173"
    CORS_ORIGINS = [
        o.strip()
        for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if o.strip()
    ]

    API_PREFIX = "/api"


