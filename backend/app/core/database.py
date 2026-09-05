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
    - Converts postgres:// to postgresql+pg8000:// (or postgresql://)
    - If running on Vercel with SQLite, routes to writable /tmp
    """
    is_serverless = bool(os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
    
    if not raw_url:
        return "sqlite:////tmp/hiring_assistant.db" if is_serverless else "sqlite:///./hiring_assistant.db"

    # If running on serverless Vercel and using relative SQLite, redirect to writable /tmp
    if is_serverless and "sqlite" in raw_url and "/tmp" not in raw_url:
        return "sqlite:////tmp/hiring_assistant.db"

    # Handle Postgres URL schemes (common with Neon, Supabase, Heroku, Render)
    if raw_url.startswith("postgres://"):
        raw_url = raw_url.replace("postgres://", "postgresql+pg8000://", 1)
    elif raw_url.startswith("postgresql://") and "+pg8000" not in raw_url and "+psycopg2" not in raw_url:
        # Default to pg8000 driver for pure-Python serverless compatibility
        raw_url = raw_url.replace("postgresql://", "postgresql+pg8000://", 1)

    return raw_url


db_url = get_normalized_database_url(settings.DATABASE_URL)

# Configure engine connection arguments based on database type
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine = create_engine(db_url, connect_args=connect_args, echo=False)
else:
    # Cloud PostgreSQL (Neon, Supabase, Vercel Postgres, etc.)
    engine = create_engine(
        db_url,
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

