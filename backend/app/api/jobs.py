import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

try:
    from app.core.database import get_db
    from app.models.models import Job, Candidate, Interview
    from app.schemas.schemas import JobCreate, JobUpdate, JobResponse
    from app.services.hunar_voice import hunar_service
except ImportError:
    from backend.app.core.database import get_db
    from backend.app.models.models import Job, Candidate, Interview
    from backend.app.schemas.schemas import JobCreate, JobUpdate, JobResponse
    from backend.app.services.hunar_voice import hunar_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("/", response_model=List[JobResponse])
def list_jobs(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Job)
    if status_filter:
        query = query.filter(Job.status == status_filter)
    if search:
        query = query.filter(Job.title.ilike(f"%{search}%") | Job.description.ilike(f"%{search}%"))

    jobs = query.order_by(Job.created_at.desc()).all()
    results = []
    for j in jobs:
        c_count = db.query(Candidate).filter(Candidate.job_id == j.id).count()
        i_count = db.query(Interview).filter(Interview.job_id == j.id).count()
        j_resp = JobResponse.model_validate(j)
        j_resp.candidate_count = c_count
        j_resp.interview_count = i_count
        results.append(j_resp)
    return results


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    c_count = db.query(Candidate).filter(Candidate.job_id == job.id).count()
    i_count = db.query(Interview).filter(Interview.job_id == job.id).count()
    j_resp = JobResponse.model_validate(job)
    j_resp.candidate_count = c_count
    j_resp.interview_count = i_count
    return j_resp


@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(payload: JobCreate, db: Session = Depends(get_db)):
    job_data = payload.model_dump(exclude={"sync_hunar_agent"})
    new_job = Job(**job_data)

    if payload.sync_hunar_agent:
        try:
            agent_res = hunar_service.create_or_sync_agent_for_job(job_data)
            new_job.hunar_agent_id = agent_res.get("id")
            new_job.hunar_agent_code = agent_res.get("agent_code")
        except Exception as e:
            logger.warning(f"Failed to auto-provision Hunar Voice Agent on job creation: {e}")

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    j_resp = JobResponse.model_validate(new_job)
    j_resp.candidate_count = 0
    j_resp.interview_count = 0
    return j_resp


@router.put("/{job_id}", response_model=JobResponse)
def update_job(job_id: str, payload: JobUpdate, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    update_data = payload.model_dump(exclude_unset=True, exclude={"sync_hunar_agent"})
    for key, value in update_data.items():
        setattr(job, key, value)

    if payload.sync_hunar_agent:
        try:
            full_job_dict = {
                "title": job.title,
                "persona_name": job.persona_name,
                "voice_persona": job.voice_persona,
                "language": job.language,
                "required_skills": job.required_skills,
                "experience_min": job.experience_min,
                "experience_max": job.experience_max,
                "interview_questions": job.interview_questions,
                "hunar_agent_id": job.hunar_agent_id,
            }
            agent_res = hunar_service.create_or_sync_agent_for_job(full_job_dict)
            job.hunar_agent_id = agent_res.get("id")
            job.hunar_agent_code = agent_res.get("agent_code")
        except Exception as e:
            logger.warning(f"Failed to sync Hunar Voice Agent: {e}")

    db.commit()
    db.refresh(job)

    c_count = db.query(Candidate).filter(Candidate.job_id == job.id).count()
    i_count = db.query(Interview).filter(Interview.job_id == job.id).count()
    j_resp = JobResponse.model_validate(job)
    j_resp.candidate_count = c_count
    j_resp.interview_count = i_count
    return j_resp


@router.post("/{job_id}/sync-agent", response_model=JobResponse)
def sync_job_agent(job_id: str, db: Session = Depends(get_db)):
    """Manually triggers or re-syncs the Hunar Voice Agent for this job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    try:
        full_job_dict = {
            "title": job.title,
            "persona_name": job.persona_name,
            "voice_persona": job.voice_persona,
            "language": job.language,
            "required_skills": job.required_skills,
            "experience_min": job.experience_min,
            "experience_max": job.experience_max,
            "interview_questions": job.interview_questions,
            "hunar_agent_id": job.hunar_agent_id,
        }
        agent_res = hunar_service.create_or_sync_agent_for_job(full_job_dict)
        job.hunar_agent_id = agent_res.get("id")
        job.hunar_agent_code = agent_res.get("agent_code")
        db.commit()
        db.refresh(job)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to sync Hunar Voice Agent: {str(e)}")

    c_count = db.query(Candidate).filter(Candidate.job_id == job.id).count()
    i_count = db.query(Interview).filter(Interview.job_id == job.id).count()
    j_resp = JobResponse.model_validate(job)
    j_resp.candidate_count = c_count
    j_resp.interview_count = i_count
    return j_resp


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Mark all active/scheduled interviews under this job as CANCELLED before deletion
    active_interviews = db.query(Interview).filter(
        Interview.job_id == job.id,
        Interview.status.in_(["SCHEDULED", "INITIATED", "RINGING", "IN_PROGRESS", "NOT_STARTED"])
    ).all()
    for intv in active_interviews:
        intv.status = "CANCELLED"
        intv.lifecycle_status = "CANCELLED"

    db.delete(job)
    db.commit()
    return None
