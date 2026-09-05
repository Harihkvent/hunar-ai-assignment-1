import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

try:
    from app.core.database import get_db
    from app.models.models import Job, Candidate, Interview
    from app.schemas.schemas import (
        PeopleSearchRequest,
        PeopleSearchResponse,
        SourcedCandidate,
        ImportSourcedCandidateRequest,
        CandidateResponse,
        SourcingProviderInfo,
    )
    from app.services.people_search_service import people_search_service
    from app.services.hunar_voice import hunar_service
except ImportError:
    from backend.app.core.database import get_db
    from backend.app.models.models import Job, Candidate, Interview
    from backend.app.schemas.schemas import (
        PeopleSearchRequest,
        PeopleSearchResponse,
        SourcedCandidate,
        ImportSourcedCandidateRequest,
        CandidateResponse,
        SourcingProviderInfo,
    )
    from backend.app.services.people_search_service import people_search_service
    from backend.app.services.hunar_voice import hunar_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/sourcing", tags=["Talent Sourcing & People Search"])


@router.get("/providers", response_model=List[SourcingProviderInfo])
def list_sourcing_providers():
    """Returns available People Search APIs (Apollo.IO, PDL, Proxycurl, Coresignal)."""
    return people_search_service.get_providers_info()


@router.post("/search", response_model=PeopleSearchResponse)
async def search_people(
    payload: PeopleSearchRequest,
    db: Session = Depends(get_db)
):
    """
    Search and source candidates across Apollo.IO, People Data Labs, Proxycurl, or Coresignal
    based on a Job Description or explicit criteria.
    """
    title = payload.title
    skills = payload.skills or []
    exp_min = payload.experience_min or 1.0
    exp_max = payload.experience_max or 10.0
    raw_jd = payload.job_description

    # If job_id is provided, pull context from existing Job
    if payload.job_id:
        job = db.query(Job).filter(Job.id == payload.job_id).first()
        if job:
            title = title or job.title
            if not skills and job.required_skills:
                skills = job.required_skills
            exp_min = max(exp_min, float(job.experience_min or 1.0))
            exp_max = max(exp_max, float(job.experience_max or 5.0))
            raw_jd = raw_jd or job.description

    return await people_search_service.search_people(
        provider=payload.provider or "APOLLO",
        title=title,
        skills=skills,
        experience_min=exp_min,
        experience_max=exp_max,
        location=payload.location or "India",
        limit=payload.limit or 8,
        raw_jd=raw_jd,
    )


@router.post("/import-and-reachout", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def import_sourced_candidate(
    payload: ImportSourcedCandidateRequest,
    db: Session = Depends(get_db)
):
    """
    Imports a sourced candidate profile into the hiring pipeline and optionally
    initiates an immediate Voice AI screening reachout call.
    """
    job = db.query(Job).filter(Job.id == payload.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Target job not found")

    sc = payload.candidate
    notes = f"Sourced via {sc.provider} API (Match: {sc.match_score}%). Current: {sc.current_title} at {sc.current_company}. LinkedIn: {sc.linkedin_url or 'N/A'}."

    # Create candidate in DB
    new_candidate = Candidate(
        job_id=job.id,
        name=sc.name,
        email=sc.email,
        phone=sc.phone,
        experience_years=sc.experience_years,
        current_role=sc.current_title,
        resume_notes=notes,
        status="APPLIED"
    )
    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)

    interview_id = None
    call_status = "NOT_LAUNCHED"

    # Launch Voice AI reachout if requested
    if payload.launch_voice_reachout:
        mode = payload.reachout_mode or "PHONE"
        new_interview = Interview(
            candidate_id=new_candidate.id,
            job_id=job.id,
            provider="HUNAR",
            mode=mode,
            status="NOT_STARTED",
        )
        db.add(new_interview)
        db.commit()
        db.refresh(new_interview)
        interview_id = new_interview.id

        if mode == "PHONE":
            # Ensure Hunar Agent exists
            if not job.hunar_agent_id:
                try:
                    agent_res = hunar_service.create_or_sync_agent_for_job({
                        "title": job.title,
                        "persona_name": job.persona_name,
                        "voice_persona": job.voice_persona,
                        "language": job.language,
                        "required_skills": job.required_skills,
                        "experience_min": job.experience_min,
                        "experience_max": job.experience_max,
                        "interview_questions": job.interview_questions,
                    })
                    job.hunar_agent_id = agent_res.get("id")
                    job.hunar_agent_code = agent_res.get("agent_code")
                    db.commit()
                except Exception as e:
                    logger.warning(f"Could not auto-provision agent for reachout: {e}")

            # Trigger call
            try:
                call_res = hunar_service.trigger_outbound_call(
                    agent_id=job.hunar_agent_id,
                    callee_name=new_candidate.name,
                    mobile_number=new_candidate.phone,
                    custom_data={
                        "company_name": "Hunar AI",
                        "candidate_name": new_candidate.name,
                        "job_title": job.title,
                    },
                    request_id=new_interview.request_id,
                )
                new_interview.hunar_call_id = call_res.get("id")
                new_interview.status = call_res.get("status", "INITIATED")
                new_interview.lifecycle_status = call_res.get("lifecycle_status", "IN_PROGRESS")
                new_candidate.status = "SCREENING_SCHEDULED"
                call_status = "INITIATED"
            except Exception as e:
                logger.error(f"Failed to place reachout call: {e}")
                new_interview.status = "FAILED"
                new_interview.error_message = str(e)
                call_status = f"FAILED: {str(e)}"
        else:
            new_interview.status = "IN_PROGRESS"
            new_candidate.status = "SCREENING_SCHEDULED"
            call_status = "SIMULATOR_READY"

        db.commit()
        db.refresh(new_candidate)

    return {
        "success": True,
        "candidate_id": new_candidate.id,
        "candidate_name": new_candidate.name,
        "job_id": job.id,
        "job_title": job.title,
        "interview_id": interview_id,
        "call_status": call_status,
        "message": f"Successfully imported {new_candidate.name} into {job.title}." + (f" Voice reachout status: {call_status}." if payload.launch_voice_reachout else "")
    }
