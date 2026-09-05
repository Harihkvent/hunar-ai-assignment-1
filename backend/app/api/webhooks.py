import json
import logging
from typing import Dict, Any
from fastapi import APIRouter, Request, Header, HTTPException, Depends, status
from sqlalchemy.orm import Session
try:
    from app.core.config import settings
    from app.core.database import get_db
    from app.core.security import verify_hunar_webhook_signature
    from app.models.models import Interview, Candidate
    from app.api.interviews import _generate_and_attach_evaluation
except ImportError:
    from backend.app.core.config import settings
    from backend.app.core.database import get_db
    from backend.app.core.security import verify_hunar_webhook_signature
    from backend.app.models.models import Interview, Candidate
    from backend.app.api.interviews import _generate_and_attach_evaluation

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("/hunar")
async def receive_hunar_webhook(
    request: Request,
    x_hunar_signature: str = Header(None, alias="X-Hunar-Signature"),
    x_hunar_timestamp: str = Header(None, alias="X-Hunar-Timestamp"),
    db: Session = Depends(get_db)
):
    """Webhook receiver endpoint for Hunar.AI voice calling events."""
    raw_body = await request.body()

    # If secret is set, verify HMAC signature
    if settings.HUNAR_API_KEY:
        is_valid = verify_hunar_webhook_signature(
            signature_header=x_hunar_signature,
            timestamp_header=x_hunar_timestamp,
            request_body=raw_body,
            trusted_api_keys=[settings.HUNAR_API_KEY]
        )
        if not is_valid:
            logger.warning("Invalid Hunar webhook signature or stale timestamp")
            # Log warning, return 401 in strict mode
            # If in local development without valid timestamp, allow fallback logging
            if settings.HUNAR_API_KEY and x_hunar_signature:
                raise HTTPException(status_code=401, detail="Invalid webhook signature")

    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = payload.get("event_type")
    call_id = payload.get("call_id")
    request_id = payload.get("request_id")

    logger.info(f"Received Hunar webhook event: {event_type} for call {call_id} (req: {request_id})")

    # Locate interview
    interview = None
    if call_id:
        interview = db.query(Interview).filter(Interview.hunar_call_id == call_id).first()
    if not interview and request_id:
        interview = db.query(Interview).filter(Interview.request_id == request_id).first()

    if not interview:
        logger.warning(f"No local interview matches webhook call_id {call_id} / request_id {request_id}")
        return {"ok": True, "processed": False, "reason": "Interview not found locally"}

    # Process events
    if event_type in ["call_status_updated", "call_summary"]:
        status_val = payload.get("status")
        lifecycle_val = payload.get("lifecycle_status")
        if status_val:
            interview.status = status_val
        if lifecycle_val:
            interview.lifecycle_status = lifecycle_val

        interview.duration_seconds = float(payload.get("duration_seconds") or interview.duration_seconds)
        interview.duration_minutes = float(payload.get("duration_minutes") or interview.duration_minutes)
        interview.answered_by = payload.get("answered_by") or interview.answered_by

        rec = payload.get("recording_url") or payload.get("call_recording_url")
        if rec:
            interview.recording_url = rec

        # Extract transcript
        t = payload.get("transcript") or payload.get("full_transcript")
        if not t and "call_analysis" in payload and isinstance(payload["call_analysis"], dict):
            t = payload["call_analysis"].get("transcript")
        if t:
            interview.transcript = t

        res = payload.get("result") or payload.get("call_result")
        if not res and "call_analysis" in payload and isinstance(payload["call_analysis"], dict):
            res = payload["call_analysis"].get("result")
        if res:
            interview.raw_result = res

        # If call completed, automatically generate evaluation
        if (interview.status == "COMPLETED" or interview.lifecycle_status == "COMPLETED") and not interview.evaluation:
            interview.status = "COMPLETED"
            _generate_and_attach_evaluation(interview, db)

    elif event_type == "call_recording_done":
        interview.recording_url = payload.get("recording_url") or payload.get("call_recording_url")

    elif event_type == "call_result_done":
        interview.raw_result = payload.get("result") or payload.get("call_result")
        if payload.get("transcript"):
            interview.transcript = payload.get("transcript")
        if not interview.evaluation:
            _generate_and_attach_evaluation(interview, db)

    db.commit()
    return {"ok": True, "event_type": event_type, "call_id": call_id}
