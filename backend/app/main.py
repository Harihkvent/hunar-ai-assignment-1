import sys
from pathlib import Path

# Ensure both project root and backend directory are in sys.path
backend_dir = Path(__file__).resolve().parent.parent
project_root = backend_dir.parent

for p in [str(project_root), str(backend_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from app.core.config import settings
    from app.core.database import engine, Base, SessionLocal
    from app.services.seed_data import seed_database
    from app.api import jobs, candidates, interviews, evaluations, system, webhooks
except ImportError:
    from backend.app.core.config import settings
    from backend.app.core.database import engine, Base, SessionLocal
    from backend.app.services.seed_data import seed_database
    from backend.app.api import jobs, candidates, interviews, evaluations, system, webhooks

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("hunar_ai_app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and seed initial demo data
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    logger.info("Application startup complete.")
    yield
    # Shutdown
    logger.info("Application shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Backend API for Hunar AI Hiring Assistant with Hunar Voice Agents Integration",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(candidates.router, prefix=settings.API_V1_STR)
app.include_router(interviews.router, prefix=settings.API_V1_STR)
app.include_router(evaluations.router, prefix=settings.API_V1_STR)
app.include_router(webhooks.router, prefix=settings.API_V1_STR)
app.include_router(system.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "api_prefix": settings.API_V1_STR,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
