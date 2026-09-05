from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

try:
    from app.core.config import settings
except ImportError:
    from backend.app.core.config import settings

# Create engine (enable check_same_thread=False for SQLite)
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
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
