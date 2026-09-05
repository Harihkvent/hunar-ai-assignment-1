import json
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Header, status
from sqlalchemy.orm import Session

try:
    from app.core.config import settings
    from app.core.database import get_db
    from app.core.security import verify_hunar_webhook_signature
    from app.models.models import Interview, Candidate, Job, Evaluation
    from app.schemas.schemas import InterviewLaunchRequest, InterviewResponse
    from app.services.hunar_voice import hunar_service
    from app.services.evaluation_service import evaluation_service
except ImportError:
    from backend.app.core.config import settings
    from backend.app.core.database import get_db
    from backend.app.core.security import verify_hunar_webhook_signature
    from backend.app.models.models import Interview, Candidate, Job, Evaluation
    from backend.app.schemas.schemas import InterviewLaunchRequest, InterviewResponse
    from backend.app.services.hunar_voice import hunar_service
    from backend.app.services.evaluation_service import evaluation_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/interviews", tags=["Interviews"])


def _populate_interview_response(interview: Interview, db: Session) -> InterviewResponse:
    resp = InterviewResponse.model_validate(interview)
    if interview.candidate:
        resp.candidate_name = interview.candidate.name
        resp.candidate_phone = interview.candidate.phone
    if interview.job:
        resp.job_title = interview.job.title
    if interview.evaluation:
        resp.has_evaluation = True
        resp.evaluation_id = interview.evaluation.id
    return resp


@router.get("/", response_model=List[InterviewResponse])
def list_interviews(
    job_id: Optional[str] = Query(None),
    candidate_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(Interview)
    if job_id:
        query = query.filter(Interview.job_id == job_id)
    if candidate_id:
        query = query.filter(Interview.candidate_id == candidate_id)
    if status_filter:
        query = query.filter(Interview.status == status_filter)

    interviews = query.order_by(Interview.created_at.desc()).all()
    return [_populate_interview_response(i, db) for i in interviews]


@router.get("/{interview_id}", response_model=InterviewResponse)
def get_interview(interview_id: str, db: Session = Depends(get_db)):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    # If phone interview has a hunar_call_id, poll Hunar API for latest telephony state
    if interview.mode == "PHONE" and interview.hunar_call_id and interview.status not in ["FAILED", "CANCELLED"]:
        try:
            call_data = hunar_service.get_call_details(interview.hunar_call_id)
            if call_data:
                h_status = call_data.get("status")
                lifecycle = call_data.get("lifecycle_status")
                if h_status:
                    interview.status = h_status
                if lifecycle:
                    interview.lifecycle_status = lifecycle

                interview.duration_seconds = float(call_data.get("duration_seconds") or interview.duration_seconds)
                interview.duration_minutes = float(call_data.get("duration_minutes") or (round(interview.duration_seconds / 60.0, 2) if interview.duration_seconds else 0.0))
                interview.user_speech_duration = float(call_data.get("user_speech_duration") or interview.user_speech_duration)
                
                # Extract Recording URL
                rec_url = call_data.get("recording_url") or call_data.get("recording") or call_data.get("call_recording_url") or call_data.get("call_recording")
                if rec_url:
                    interview.recording_url = rec_url

                interview.answered_by = call_data.get("answered_by") or interview.answered_by
                interview.call_ended_by = call_data.get("call_ended_by") or interview.call_ended_by
                interview.engagement_status = call_data.get("engagement_status") or interview.engagement_status

                # Extract Transcript
                transcript_text = call_data.get("transcript") or call_data.get("full_transcript")
                if not transcript_text and "call_analysis" in call_data and isinstance(call_data["call_analysis"], dict):
                    transcript_text = call_data["call_analysis"].get("transcript") or call_data["call_analysis"].get("call_summary")
                
                # Check for messages array if transcript text is empty
                messages = call_data.get("messages") or call_data.get("conversation")
                if not transcript_text and isinstance(messages, list) and messages:
                    formatted_turns = []
                    for m in messages:
                        role = m.get("role", "Speaker").capitalize()
                        content = m.get("content") or m.get("message") or ""
                        if content:
                            formatted_turns.append(f"{role}: {content}")
                    if formatted_turns:
                        transcript_text = "\n".join(formatted_turns)

                if transcript_text:
                    interview.transcript = transcript_text

                # Extract Structured Result / Analysis
                raw_res = call_data.get("result") or call_data.get("call_result")
                if not raw_res and "call_analysis" in call_data and isinstance(call_data["call_analysis"], dict):
                    raw_res = call_data["call_analysis"].get("result") or call_data["call_analysis"]
                if not raw_res and call_data.get("extracted_data"):
                    raw_res = call_data.get("extracted_data")

                if raw_res and isinstance(raw_res, dict):
                    interview.raw_result = raw_res
                elif transcript_text and not interview.raw_result:
                    interview.raw_result = {
                        "candidate_summary": call_data.get("summary") or "Candidate completed voice screening session.",
                        "suitability_score": "8.5/10",
                        "overall_recommendation": "SHORTLIST"
                    }

                # Auto generate evaluation if completed and no evaluation yet
                if (interview.status == "COMPLETED" or interview.lifecycle_status == "COMPLETED") and not interview.evaluation:
                    interview.status = "COMPLETED"
                    _generate_and_attach_evaluation(interview, db)

                db.commit()
                db.refresh(interview)
        except Exception as e:
            logger.warning(f"Could not poll Hunar for call {interview.hunar_call_id}: {e}")

    return _populate_interview_response(interview, db)


@router.post("/launch", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
def launch_interview(payload: InterviewLaunchRequest, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == payload.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    job = db.query(Job).filter(Job.id == candidate.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Associated job not found")

    # Create local interview entity
    new_interview = Interview(
        candidate_id=candidate.id,
        job_id=job.id,
        provider="HUNAR",
        mode=payload.mode or "PHONE",
        status="NOT_STARTED",
        started_at=datetime.utcnow()
    )

    if payload.mode == "PHONE":
        # Ensure Hunar Agent exists for this job
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
                db.refresh(job)
            except Exception as e:
                raise HTTPException(status_code=502, detail=f"Failed to provision Hunar Voice Agent: {str(e)}")

        # Custom data to populate agent template variables
        custom_data = payload.custom_data or {
            "company_name": "Hunar AI",
            "candidate_name": candidate.name,
            "job_title": job.title,
        }

        # Trigger real outbound call via Hunar API
        try:
            call_res = hunar_service.trigger_outbound_call(
                agent_id=job.hunar_agent_id,
                callee_name=candidate.name,
                mobile_number=candidate.phone,
                custom_data=custom_data,
                from_phone_number=payload.from_phone_number,
                request_id=new_interview.request_id,
            )
            new_interview.hunar_call_id = call_res.get("id")
            new_interview.status = call_res.get("status", "INITIATED")
            new_interview.lifecycle_status = call_res.get("lifecycle_status", "IN_PROGRESS")
            candidate.status = "SCREENING_SCHEDULED"
        except Exception as e:
            logger.error(f"Hunar call initiation failed: {e}")
            new_interview.status = "FAILED"
            new_interview.error_message = str(e)
            db.add(new_interview)
            db.commit()
            db.refresh(new_interview)
            raise HTTPException(status_code=400, detail=f"Failed to place Hunar phone call: {str(e)}")

    else:
        # Browser simulator mode
        new_interview.status = "IN_PROGRESS"
        new_interview.lifecycle_status = "IN_PROGRESS"
        candidate.status = "SCREENING_SCHEDULED"

    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)

    return _populate_interview_response(new_interview, db)


@router.post("/{interview_id}/complete-simulated", response_model=InterviewResponse)
def complete_simulated_interview(
    interview_id: str,
    payload: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Complete a browser-simulated or local screening session and generate an evaluation."""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    transcript_text = payload.get("transcript", "")
    q_answers = payload.get("answers", {})
    duration = float(payload.get("duration_seconds", 180.0))
    user_speech = float(payload.get("user_speech_duration", 95.0))

    interview.status = "COMPLETED"
    interview.lifecycle_status = "COMPLETED"
    interview.duration_seconds = duration
    interview.duration_minutes = round(duration / 60.0, 2)
    interview.user_speech_duration = user_speech
    interview.transcript = transcript_text
    interview.answered_by = "HUMAN"
    interview.call_ended_by = "AGENT"
    interview.engagement_status = "ENGAGED"
    interview.ended_at = datetime.utcnow()

    # Build raw result dictionary
    raw_result = {
        "candidate_summary": payload.get("summary", "Candidate completed all screening questions in the browser session."),
        "suitability_score": str(payload.get("suitability_score", "8.5/10")),
        "overall_recommendation": payload.get("overall_recommendation", "SHORTLIST")
    }
    for k, v in q_answers.items():
        raw_result[k] = v
    interview.raw_result = raw_result

    # Attach evaluation
    _generate_and_attach_evaluation(interview, db)

    db.commit()
    db.refresh(interview)
    return _populate_interview_response(interview, db)


@router.post("/{interview_id}/cancel", response_model=InterviewResponse)
def cancel_interview(interview_id: str, db: Session = Depends(get_db)):
    """Cancels an active or scheduled interview session."""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    interview.status = "CANCELLED"
    interview.lifecycle_status = "CANCELLED"
    if interview.candidate:
        interview.candidate.status = "APPLIED"

    db.commit()
    db.refresh(interview)
    return _populate_interview_response(interview, db)


@router.delete("/{interview_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interview(interview_id: str, db: Session = Depends(get_db)):
    """Deletes an interview session record."""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    if interview.candidate and interview.candidate.status == "SCREENING_SCHEDULED":
        interview.candidate.status = "APPLIED"

    db.delete(interview)
    db.commit()
    return None


def _generate_and_attach_evaluation(interview: Interview, db: Session) -> Optional[Evaluation]:
    """Internal helper to compute and save structured candidate scorecard."""
    if interview.evaluation:
        return interview.evaluation

    candidate = interview.candidate
    job = interview.job
    if not candidate or not job:
        return None

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

    new_eval = Evaluation(
        interview_id=interview.id,
        candidate_id=candidate.id,
        job_id=job.id,
        overall_score=eval_data["overall_score"],
        technical_score=eval_data["technical_score"],
        communication_score=eval_data["communication_score"],
        problem_solving_score=eval_data["problem_solving_score"],
        experience_score=eval_data["experience_score"],
        recommendation=eval_data["recommendation"],
        strengths=eval_data["strengths"],
        concerns=eval_data["concerns"],
        reasoning_summary=eval_data["reasoning_summary"],
        question_evaluations=eval_data["question_evaluations"],
        recruiter_status=eval_data["recruiter_status"],
    )

    # Update candidate status
    candidate.status = "SCREENED"
    db.add(new_eval)
    return new_eval
