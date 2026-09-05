import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
try:
    from app.core.database import get_db
    from app.models.models import Evaluation, Interview, Candidate
    from app.schemas.schemas import EvaluationResponse, RecruiterDecisionUpdate
    from app.services.evaluation_service import evaluation_service
except ImportError:
    from backend.app.core.database import get_db
    from backend.app.models.models import Evaluation, Interview, Candidate
    from backend.app.schemas.schemas import EvaluationResponse, RecruiterDecisionUpdate
    from backend.app.services.evaluation_service import evaluation_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/evaluations", tags=["Evaluations"])


def _populate_evaluation_response(evaluation: Evaluation) -> EvaluationResponse:
    resp = EvaluationResponse.model_validate(evaluation)
    if evaluation.interview:
        if evaluation.interview.candidate:
            resp.candidate_name = evaluation.interview.candidate.name
        if evaluation.interview.job:
            resp.job_title = evaluation.interview.job.title
        resp.recording_url = evaluation.interview.recording_url
        resp.transcript = evaluation.interview.transcript
    return resp


@router.get("/{interview_id}", response_model=EvaluationResponse)
def get_evaluation(interview_id: str, db: Session = Depends(get_db)):
    evaluation = db.query(Evaluation).filter(Evaluation.interview_id == interview_id).first()
    if not evaluation:
        # Check if interview exists
        interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")

        # If interview is completed, attempt to generate evaluation on the fly
        if interview.status == "COMPLETED":
            try:
                from app.api.interviews import _generate_and_attach_evaluation
            except ImportError:
                from backend.app.api.interviews import _generate_and_attach_evaluation
            evaluation = _generate_and_attach_evaluation(interview, db)
            db.commit()
            if evaluation:
                db.refresh(evaluation)

        if not evaluation:
            raise HTTPException(status_code=404, detail="Evaluation not yet generated for this interview")

    return _populate_evaluation_response(evaluation)


@router.put("/{evaluation_id}/decision", response_model=EvaluationResponse)
def update_recruiter_decision(
    evaluation_id: str,
    payload: RecruiterDecisionUpdate,
    db: Session = Depends(get_db)
):
    evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    evaluation.recruiter_status = payload.recruiter_status
    if payload.recruiter_notes is not None:
        evaluation.recruiter_notes = payload.recruiter_notes

    # Update candidate status matching recruiter decision
    candidate = db.query(Candidate).filter(Candidate.id == evaluation.candidate_id).first()
    if candidate:
        if payload.recruiter_status == "SHORTLISTED":
            candidate.status = "SHORTLISTED"
        elif payload.recruiter_status == "REJECTED":
            candidate.status = "REJECTED"
        elif payload.recruiter_status == "NEEDS_REVIEW":
            candidate.status = "NEEDS_REVIEW"

    db.commit()
    db.refresh(evaluation)
    return _populate_evaluation_response(evaluation)


@router.post("/{interview_id}/regenerate", response_model=EvaluationResponse)
def regenerate_evaluation(interview_id: str, db: Session = Depends(get_db)):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    candidate = interview.candidate
    job = interview.job
    if not candidate or not job:
        raise HTTPException(status_code=400, detail="Incomplete interview association")

    eval_data = evaluation_service.generate_evaluation(
        candidate_dict={
            "name": candidate.name,
            "experience_years": candidate.experience_years,
            "current_role": candidate.current_role,
        },
        job_dict={
            "title": job.title,
            "experience_min": job.experience_min,
            "experience_max": job.experience_max,
            "required_skills": job.required_skills,
            "interview_questions": job.interview_questions,
        },
        interview_dict={
            "raw_result": interview.raw_result or {},
            "transcript": interview.transcript or "",
            "duration_seconds": interview.duration_seconds,
            "user_speech_duration": interview.user_speech_duration,
            "engagement_status": interview.engagement_status,
            "answered_by": interview.answered_by,
        }
    )

    evaluation = db.query(Evaluation).filter(Evaluation.interview_id == interview_id).first()
    if not evaluation:
        evaluation = Evaluation(interview_id=interview.id, candidate_id=candidate.id, job_id=job.id)
        db.add(evaluation)

    evaluation.overall_score = eval_data["overall_score"]
    evaluation.technical_score = eval_data["technical_score"]
    evaluation.communication_score = eval_data["communication_score"]
    evaluation.problem_solving_score = eval_data["problem_solving_score"]
    evaluation.experience_score = eval_data["experience_score"]
    evaluation.recommendation = eval_data["recommendation"]
    evaluation.strengths = eval_data["strengths"]
    evaluation.concerns = eval_data["concerns"]
    evaluation.reasoning_summary = eval_data["reasoning_summary"]
    evaluation.question_evaluations = eval_data["question_evaluations"]

    db.commit()
    db.refresh(evaluation)
    return _populate_evaluation_response(evaluation)
