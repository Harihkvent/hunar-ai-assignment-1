import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

try:
    from app.core.config import settings
except ImportError:
    from backend.app.core.config import settings


def get_normalized_database_url(raw_url: str) -> str:
    """
    Normalizes PostgreSQL and SQLite URLs for serverless & cloud deployment.
    - Handles Neon / Supabase / Postgres URLs
    - Strips whitespace, hidden tabs, and newlines from env copy-paste
    - If running on Vercel with SQLite, routes to writable /tmp
    """
    is_serverless = bool(os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
    
    if not raw_url:
        return "sqlite:////tmp/hiring_assistant.db" if is_serverless else "sqlite:///./hiring_assistant.db"

    # Aggressively strip whitespace, tabs, quotes, and newlines
    raw_url = raw_url.strip().strip('"').strip("'").replace("\t", "").replace("\r", "").replace("\n", "")

    # If running on serverless Vercel and using relative SQLite, redirect to writable /tmp
    if is_serverless and "sqlite" in raw_url and "/tmp" not in raw_url:
        return "sqlite:////tmp/hiring_assistant.db"

    # Normalize Postgres URL schemes
    if raw_url.startswith("postgres://"):
        raw_url = raw_url.replace("postgres://", "postgresql://", 1)

    # Clean any malformed sslmode parameter values (e.g. require\t or spaces)
    if "sslmode=" in raw_url:
        import re
        raw_url = re.sub(r'sslmode=([a-zA-Z0-9_-]+)[^\w&]*', r'sslmode=\1', raw_url)

    return raw_url.strip()


db_url = get_normalized_database_url(settings.DATABASE_URL)

# Configure engine connection arguments based on database type
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine = create_engine(db_url, connect_args=connect_args, echo=False)
else:
    # Cloud PostgreSQL (Neon, Supabase, Vercel Postgres, etc.)
    connect_args = {}
    
    # Robust fallback for local Windows DNS when connecting to Neon
    if "neon.tech" in db_url:
        import socket
        try:
            from urllib.parse import urlparse
            parsed = urlparse(db_url)
            host = parsed.hostname
            if host:
                try:
                    socket.gethostbyname(host)
                except Exception:
                    # Fallback IP for Neon us-east-2 endpoint router
                    connect_args["hostaddr"] = "3.143.47.40"
        except Exception:
            pass

    engine = create_engine(
        db_url,
        connect_args=connect_args,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=False
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

