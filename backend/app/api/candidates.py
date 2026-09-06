import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

try:
    from app.core.database import get_db
    from app.models.models import Candidate, Job, Interview, Evaluation
    from app.schemas.schemas import CandidateCreate, CandidateUpdate, CandidateResponse
except ImportError:
    from backend.app.core.database import get_db
    from backend.app.models.models import Candidate, Job, Interview, Evaluation
    from backend.app.schemas.schemas import CandidateCreate, CandidateUpdate, CandidateResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.get("/", response_model=List[CandidateResponse])
def list_candidates(
    job_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Candidate).options(
        joinedload(Candidate.job),
        joinedload(Candidate.interviews).joinedload(Interview.evaluation)
    )
    if job_id:
        query = query.filter(Candidate.job_id == job_id)
    if status_filter:
        query = query.filter(Candidate.status == status_filter)
    if search:
        query = query.filter(Candidate.name.ilike(f"%{search}%") | Candidate.email.ilike(f"%{search}%"))

    candidates = query.order_by(Candidate.created_at.desc()).all()
    results = []
    for c in candidates:
        c_resp = CandidateResponse.model_validate(c)
        if c.job:
            c_resp.job_title = c.job.title
        
        # Determine latest interview from preloaded in-memory list (zero SQL queries)
        if c.interviews:
            sorted_ints = sorted(c.interviews, key=lambda x: x.created_at or x.id, reverse=True)
            latest_int = sorted_ints[0]
            c_resp.latest_interview_status = latest_int.status
            c_resp.latest_interview_id = latest_int.id
            if latest_int.evaluation:
                c_resp.overall_score = latest_int.evaluation.overall_score

        results.append(c_resp)
    return results


@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(candidate_id: str, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    c_resp = CandidateResponse.model_validate(candidate)
    if candidate.job:
        c_resp.job_title = candidate.job.title

    latest_int = (
        db.query(Interview)
        .filter(Interview.candidate_id == candidate.id)
        .order_by(Interview.created_at.desc())
        .first()
    )
    if latest_int:
        c_resp.latest_interview_status = latest_int.status
        c_resp.latest_interview_id = latest_int.id
        if latest_int.evaluation:
            c_resp.overall_score = latest_int.evaluation.overall_score

    return c_resp


@router.post("/", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
def create_candidate(payload: CandidateCreate, db: Session = Depends(get_db)):
    # Validate job exists
    job = db.query(Job).filter(Job.id == payload.job_id).first()
    if not job:
        raise HTTPException(status_code=400, detail="Specified job does not exist")

    new_cand = Candidate(**payload.model_dump())
    db.add(new_cand)
    db.commit()
    db.refresh(new_cand)

    c_resp = CandidateResponse.model_validate(new_cand)
    c_resp.job_title = job.title
    return c_resp


@router.put("/{candidate_id}", response_model=CandidateResponse)
def update_candidate(candidate_id: str, payload: CandidateUpdate, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(candidate, key, value)

    db.commit()
    db.refresh(candidate)

    c_resp = CandidateResponse.model_validate(candidate)
    if candidate.job:
        c_resp.job_title = candidate.job.title
    return c_resp


@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_candidate(candidate_id: str, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    db.delete(candidate)
    db.commit()
    return None
