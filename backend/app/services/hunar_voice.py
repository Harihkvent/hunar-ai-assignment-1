import json
import logging
from typing import Dict, Any, List, Optional
import httpx

try:
    from app.core.config import settings
except ImportError:
    from backend.app.core.config import settings

logger = logging.getLogger(__name__)


class HunarVoiceService:
    def __init__(self):
        self.base_url = settings.HUNAR_BASE_URL.rstrip("/")
        self.api_key = settings.HUNAR_API_KEY
        self.headers = {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json",
        }

    def _client(self) -> httpx.Client:
        return httpx.Client(base_url=self.base_url, headers=self.headers, timeout=20.0)

    def check_health(self) -> Dict[str, Any]:
        """Verify API key authentication and connection status."""
        try:
            with self._client() as client:
                res = client.get("/agents/?page=1&page_size=5")
                num_res = client.get("/numbers/?page=1&page_size=10")
                if res.status_code in [200, 201]:
                    agents_data = res.json()
                    numbers_data = num_res.json() if num_res.status_code == 200 else {"results": []}
                    allowed_countries = set()
                    for n in numbers_data.get("results", []):
                        for c in n.get("allowed_countries", []):
                            allowed_countries.add(c)
                    return {
                        "connected": True,
                        "status_code": res.status_code,
                        "agents_count": agents_data.get("count", len(agents_data.get("results", []))),
                        "numbers_count": len(numbers_data.get("results", [])),
                        "allowed_countries": list(allowed_countries),
                    }
                else:
                    return {
                        "connected": False,
                        "status_code": res.status_code,
                        "error": res.text,
                        "agents_count": 0,
                        "numbers_count": 0,
                        "allowed_countries": [],
                    }
        except Exception as e:
            logger.error(f"Hunar API health check failed: {e}")
            return {
                "connected": False,
                "error": str(e),
                "agents_count": 0,
                "numbers_count": 0,
                "allowed_countries": [],
            }

    def list_agents(self, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        with self._client() as client:
            res = client.get(f"/agents/?page={page}&page_size={page_size}")
            res.raise_for_status()
            return res.json()

    def get_agent(self, agent_id: str) -> Dict[str, Any]:
        with self._client() as client:
            res = client.get(f"/agents/{agent_id}/")
            res.raise_for_status()
            return res.json()

    def create_or_sync_agent_for_job(self, job_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Creates or updates a customized Hunar Voice Agent for a specific hiring job."""
        title = job_dict.get("title", "Software Engineer")
        persona_name = job_dict.get("persona_name") or "Aria"
        voice_persona = job_dict.get("voice_persona") or "NEHA"
        language = job_dict.get("language") or "ENGLISH"
        req_skills = ", ".join(job_dict.get("required_skills", [])) or "software engineering"
        exp_range = f"{job_dict.get('experience_min', 1)} to {job_dict.get('experience_max', 5)} years"
        questions = job_dict.get("interview_questions", [])

        if not questions:
            questions = [
                f"Can you briefly describe your background and relevant experience with {req_skills}?",
                "What has been one of your most challenging technical projects recently?",
                "What is your expected CTC and notice period?"
            ]

        # Construct conversational agent prompt
        agent_prompt = (
            f"You are {persona_name}, an expert AI voice recruiter conducting a first-round technical screening for the position of {title}.\n"
            f"Target experience: {exp_range}.\n"
            f"Key required skills: {req_skills}.\n"
            f"Your job is to ask the candidate the following screening questions one by one:\n"
        )
        for i, q in enumerate(questions, 1):
            agent_prompt += f"{i}. {q}\n"

        agent_prompt += (
            "\nRules:\n"
            "- Speak naturally, professionally, and concisely.\n"
            "- Ask one question at a time and wait for the candidate's complete answer.\n"
            "- If the candidate's answer is very brief, ask a quick relevant follow-up before moving to the next question.\n"
            "- Never make final hiring promises on the call; inform the candidate that the hiring team will review their responses."
        )

        objective = f"Screen applicants for the {title} position by asking key technical and background questions."
        introduction = f"Hello {{callee_name}}! This is {persona_name}, an AI recruiter calling regarding your application for the {title} role. Do you have a few minutes for a brief voice screening?"

        # Result schema for structured conversation signals
        result_schema = {
            "candidate_summary": "Brief summary of candidate's background and communication",
            "suitability_score": "Score out of 10 based on answers",
            "overall_recommendation": "STRONG_HIRE, HIRE, MAYBE, or REJECT",
        }
        for i, q in enumerate(questions, 1):
            result_schema[f"question_{i}_answer"] = f"Candidate's response to: {q}"

        result_prompt = (
            "Analyze the conversation transcript carefully. Extract the candidate's answers to each screening question, "
            "summarize their communication clarity, and assess their overall technical and behavioral fit."
        )

        agent_payload = {
            "name": f"Hiring Agent: {title}"[:64],
            "language": language,
            "voice_persona": voice_persona,
            "persona_name": persona_name,
            "agent_prompt": agent_prompt,
            "objective": objective,
            "introduction": introduction,
            "result_prompt": result_prompt,
            "result_schema": result_schema
        }

        agent_id = job_dict.get("hunar_agent_id")
        with self._client() as client:
            if agent_id:
                try:
                    res = client.put(f"/agents/{agent_id}/", json=agent_payload)
                    if res.status_code == 200:
                        return res.json()
                except Exception as e:
                    logger.warning(f"Could not update existing agent {agent_id}, will create new: {e}")

            # Create new agent
            res = client.post("/agents/", json=agent_payload)
            if res.status_code not in [200, 201]:
                logger.error(f"Failed to create agent: {res.status_code} - {res.text}")
                res.raise_for_status()
            return res.json()

    def list_numbers(self) -> List[Dict[str, Any]]:
        """List validated caller ID phone numbers available in the organization."""
        try:
            with self._client() as client:
                res = client.get("/numbers/?page=1&page_size=20")
                if res.status_code == 200:
                    return res.json().get("results", [])
                return []
        except Exception as e:
            logger.error(f"Failed to list numbers: {e}")
            return []

    def trigger_outbound_call(
        self,
        agent_id: str,
        callee_name: str,
        mobile_number: str,
        custom_data: Optional[Dict[str, Any]] = None,
        from_phone_number: Optional[str] = None,
        request_id: Optional[str] = None,
        callback_base_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Triggers an outbound voice call via Hunar External API."""
        call_payload: Dict[str, Any] = {
            "agent_id": agent_id,
            "callee_name": callee_name,
            "mobile_number": mobile_number,
            "custom_data": custom_data or {},
        }

        if from_phone_number:
            call_payload["from_phone_number"] = from_phone_number
        if request_id:
            call_payload["request_id"] = request_id[:64]

        # Webhook callback URLs (Hunar API strictly requires https scheme for callbacks)
        cb_base = callback_base_url or settings.WEBHOOK_BASE_URL
        if cb_base and cb_base.strip().lower().startswith("https://"):
            cb_clean = cb_base.strip().rstrip('/')
            call_payload["callback_config"] = {
                "call_status_callback_url": f"{cb_clean}/api/webhooks/hunar",
                "call_recording_callback_url": f"{cb_clean}/api/webhooks/hunar",
                "call_result_callback_url": f"{cb_clean}/api/webhooks/hunar",
                "call_summary_callback_url": f"{cb_clean}/api/webhooks/hunar",
            }

        with self._client() as client:
            res = client.post("/calls/", json=call_payload)
            if res.status_code not in [200, 201]:
                logger.error(f"Hunar call creation failed: {res.status_code} - {res.text}")
                error_detail = res.text
                try:
                    err_json = res.json()
                    error_detail = err_json.get("message") or str(err_json.get("details")) or res.text
                except Exception:
                    pass
                raise Exception(f"{error_detail}")
            return res.json()

    def get_call_details(self, call_id: str) -> Dict[str, Any]:
        with self._client() as client:
            res = client.get(f"/calls/{call_id}/")
            res.raise_for_status()
            return res.json()


hunar_service = HunarVoiceService()
