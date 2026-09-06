import logging
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
try:
    from app.core.config import settings
    from app.core.database import get_db
    from app.models.models import Job, Candidate, Interview, Evaluation
    from app.schemas.schemas import DashboardStats, SystemHealthResponse, InterviewResponse
    from app.services.hunar_voice import hunar_service
    from app.api.interviews import _populate_interview_response
except ImportError:
    from backend.app.core.config import settings
    from backend.app.core.database import get_db
    from backend.app.models.models import Job, Candidate, Interview, Evaluation
    from backend.app.schemas.schemas import DashboardStats, SystemHealthResponse, InterviewResponse
    from backend.app.services.hunar_voice import hunar_service
    from backend.app.api.interviews import _populate_interview_response

logger = logging.getLogger(__name__)
router = APIRouter(tags=["System & Dashboard"])


import time
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

# Simple short-lived in-memory cache for ultra-fast navigation (3s TTL)
_stats_cache = {"data": None, "timestamp": 0.0}

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    now = time.time()
    if _stats_cache["data"] and (now - _stats_cache["timestamp"]) < 3.0:
        return _stats_cache["data"]

    # 1. Job counts
    total_jobs = db.query(Job).count()
    active_jobs = db.query(Job).filter(Job.status == "ACTIVE").count()

    # 2. Consolidated candidate status counts in a single query
    status_counts = dict(
        db.query(Candidate.status, func.count(Candidate.id))
        .group_by(Candidate.status)
        .all()
    )
    total_candidates = sum(status_counts.values())
    shortlisted = status_counts.get("SHORTLISTED", 0)
    needs_review = status_counts.get("NEEDS_REVIEW", 0)
    rejected = status_counts.get("REJECTED", 0)
    screened_candidates = (
        status_counts.get("SCREENED", 0) + shortlisted + needs_review + rejected
    )

    # 3. Completed interviews & average score
    completed_interviews = db.query(Interview).filter(Interview.status == "COMPLETED").count()
    avg_score_res = db.query(func.avg(Evaluation.overall_score)).scalar()
    avg_score = round(float(avg_score_res), 1) if avg_score_res is not None else 0.0

    # 4. Recent interviews with preloaded relationships in 1 query
    recent_ints = (
        db.query(Interview)
        .options(
            joinedload(Interview.candidate),
            joinedload(Interview.job),
            joinedload(Interview.evaluation),
        )
        .order_by(Interview.created_at.desc())
        .limit(6)
        .all()
    )
    recent_responses = [_populate_interview_response(i, db) for i in recent_ints]

    result = DashboardStats(
        total_jobs=total_jobs,
        active_jobs=active_jobs,
        total_candidates=total_candidates,
        screened_candidates=screened_candidates,
        completed_interviews=completed_interviews,
        shortlisted_candidates=shortlisted,
        needs_review_candidates=needs_review,
        rejected_candidates=rejected,
        average_score=avg_score,
        recent_interviews=recent_responses,
    )
    _stats_cache["data"] = result
    _stats_cache["timestamp"] = now
    return result


@router.get("/system/health", response_model=SystemHealthResponse)
def get_system_health(db: Session = Depends(get_db)):
    hunar_health = hunar_service.check_health()
    return SystemHealthResponse(
        status="HEALTHY",
        database="CONNECTED",
        hunar_api_connected=hunar_health.get("connected", False),
        hunar_agents_count=hunar_health.get("agents_count", 0),
        hunar_numbers_count=hunar_health.get("numbers_count", 0),
        active_api_key_set=bool(settings.HUNAR_API_KEY),
        allowed_countries=hunar_health.get("allowed_countries", []),
        timestamp=datetime.utcnow()
    )


@router.get("/system/numbers")
def get_caller_numbers():
    return hunar_service.list_numbers()
