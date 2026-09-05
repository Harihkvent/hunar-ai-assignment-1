from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# --- Job Schemas ---
class JobBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    department: Optional[str] = "Engineering"
    location: Optional[str] = "Remote / Hybrid"
    description: str = Field(..., min_length=10)
    experience_min: Optional[int] = 1
    experience_max: Optional[int] = 5
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    interview_questions: List[str] = Field(default_factory=list)
    voice_persona: Optional[str] = "NEHA"
    persona_name: Optional[str] = "Aria"
    language: Optional[str] = "ENGLISH"
    status: Optional[str] = "ACTIVE"


class JobCreate(JobBase):
    sync_hunar_agent: Optional[bool] = True


class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    experience_min: Optional[int] = None
    experience_max: Optional[int] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    interview_questions: Optional[List[str]] = None
    voice_persona: Optional[str] = None
    persona_name: Optional[str] = None
    language: Optional[str] = None
    status: Optional[str] = None
    sync_hunar_agent: Optional[bool] = False


class JobResponse(JobBase):
    id: str
    hunar_agent_id: Optional[str] = None
    hunar_agent_code: Optional[str] = None
    candidate_count: Optional[int] = 0
    interview_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Candidate Schemas ---
class CandidateBase(BaseModel):
    job_id: str
    name: str = Field(..., min_length=2)
    email: str
    phone: str
    experience_years: Optional[float] = 2.0
    current_role: Optional[str] = "Software Engineer"
    resume_notes: Optional[str] = None
    status: Optional[str] = "APPLIED"


class CandidateCreate(CandidateBase):
    pass


class CandidateUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    experience_years: Optional[float] = None
    current_role: Optional[str] = None
    resume_notes: Optional[str] = None
    status: Optional[str] = None


class CandidateResponse(CandidateBase):
    id: str
    job_title: Optional[str] = None
    latest_interview_status: Optional[str] = None
    latest_interview_id: Optional[str] = None
    overall_score: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Interview Schemas ---
class InterviewLaunchRequest(BaseModel):
    candidate_id: str
    mode: Optional[str] = "PHONE"  # "PHONE" (actual Hunar telephony) or "SIMULATOR"
    from_phone_number: Optional[str] = None
    custom_data: Optional[Dict[str, Any]] = None


class InterviewResponse(BaseModel):
    id: str
    candidate_id: str
    job_id: str
    candidate_name: Optional[str] = None
    candidate_phone: Optional[str] = None
    job_title: Optional[str] = None
    hunar_call_id: Optional[str] = None
    request_id: str
    provider: str
    mode: str
    status: str
    lifecycle_status: str
    duration_seconds: float
    duration_minutes: float
    user_speech_duration: float
    recording_url: Optional[str] = None
    transcript: Optional[str] = None
    raw_result: Optional[Dict[str, Any]] = None
    answered_by: Optional[str] = None
    call_ended_by: Optional[str] = None
    engagement_status: Optional[str] = None
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    has_evaluation: Optional[bool] = False
    evaluation_id: Optional[str] = None

    class Config:
        from_attributes = True


# --- Evaluation Schemas ---
class QuestionEvaluation(BaseModel):
    question: str
    answer: str
    score: int
    feedback: str


class EvaluationResponse(BaseModel):
    id: str
    interview_id: str
    candidate_id: str
    job_id: str
    candidate_name: Optional[str] = None
    job_title: Optional[str] = None
    overall_score: int
    technical_score: int
    communication_score: int
    problem_solving_score: int
    experience_score: int
    recommendation: str
    strengths: List[str]
    concerns: List[str]
    reasoning_summary: str
    question_evaluations: List[QuestionEvaluation]
    recruiter_status: str
    recruiter_notes: Optional[str] = None
    recording_url: Optional[str] = None
    transcript: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RecruiterDecisionUpdate(BaseModel):
    recruiter_status: str  # "SHORTLISTED", "NEEDS_REVIEW", "REJECTED"
    recruiter_notes: Optional[str] = None


# --- System / Stats Schemas ---
class DashboardStats(BaseModel):
    total_jobs: int
    active_jobs: int
    total_candidates: int
    screened_candidates: int
    completed_interviews: int
    shortlisted_candidates: int
    needs_review_candidates: int
    rejected_candidates: int
    average_score: float
    recent_interviews: List[InterviewResponse]


class SystemHealthResponse(BaseModel):
    status: str
    database: str
    hunar_api_connected: bool
    hunar_agents_count: int
    hunar_numbers_count: int
    active_api_key_set: bool
    allowed_countries: List[str]
    timestamp: datetime
