import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

try:
    from app.core.database import Base
except ImportError:
    from backend.app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False, index=True)
    department = Column(String(100), default="Engineering")
    location = Column(String(100), default="Remote / Hybrid")
    description = Column(Text, nullable=False)
    experience_min = Column(Integer, default=1)
    experience_max = Column(Integer, default=5)
    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)
    interview_questions = Column(JSON, default=list)
    voice_persona = Column(String(50), default="NEHA")
    persona_name = Column(String(50), default="Aria")
    language = Column(String(50), default="ENGLISH")
    hunar_agent_id = Column(String(100), nullable=True)
    hunar_agent_code = Column(String(50), nullable=True)
    status = Column(String(50), default="ACTIVE")  # ACTIVE, PAUSED, CLOSED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    candidates = relationship("Candidate", back_populates="job", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="job", cascade="all, delete-orphan")


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey("jobs.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    experience_years = Column(Float, default=2.0)
    current_role = Column(String(255), default="Software Engineer")
    resume_notes = Column(Text, nullable=True)
    status = Column(String(50), default="APPLIED")  # APPLIED, SCREENING_SCHEDULED, SCREENED, SHORTLISTED, NEEDS_REVIEW, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    job = relationship("Job", back_populates="candidates")
    interviews = relationship("Interview", back_populates="candidate", cascade="all, delete-orphan")


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False, index=True)
    job_id = Column(String(36), ForeignKey("jobs.id"), nullable=False, index=True)
    hunar_call_id = Column(String(100), nullable=True, index=True)
    request_id = Column(String(100), default=generate_uuid, index=True)
    provider = Column(String(50), default="HUNAR")
    mode = Column(String(50), default="PHONE")  # PHONE, SIMULATOR
    status = Column(String(50), default="NOT_STARTED")  # NOT_STARTED, SCHEDULED, INITIATED, RINGING, IN_PROGRESS, COMPLETED, NOT_CONNECTED, FAILED, CANCELLED
    lifecycle_status = Column(String(50), default="NOT_STARTED")
    duration_seconds = Column(Float, default=0.0)
    duration_minutes = Column(Float, default=0.0)
    user_speech_duration = Column(Float, default=0.0)
    recording_url = Column(Text, nullable=True)
    transcript = Column(Text, nullable=True)
    raw_result = Column(JSON, nullable=True)
    answered_by = Column(String(50), nullable=True)
    call_ended_by = Column(String(50), nullable=True)
    engagement_status = Column(String(50), nullable=True)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    candidate = relationship("Candidate", back_populates="interviews")
    job = relationship("Job", back_populates="interviews")
    evaluation = relationship("Evaluation", back_populates="interview", uselist=False, cascade="all, delete-orphan")


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    interview_id = Column(String(36), ForeignKey("interviews.id"), unique=True, nullable=False, index=True)
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False, index=True)
    job_id = Column(String(36), ForeignKey("jobs.id"), nullable=False, index=True)
    overall_score = Column(Integer, default=0)
    technical_score = Column(Integer, default=0)
    communication_score = Column(Integer, default=0)
    problem_solving_score = Column(Integer, default=0)
    experience_score = Column(Integer, default=0)
    recommendation = Column(String(50), default="NEEDS_REVIEW")  # STRONG_HIRE, SHORTLIST, NEEDS_REVIEW, REJECT
    strengths = Column(JSON, default=list)
    concerns = Column(JSON, default=list)
    reasoning_summary = Column(Text, nullable=False)
    question_evaluations = Column(JSON, default=list)
    recruiter_status = Column(String(50), default="PENDING")  # PENDING, SHORTLISTED, NEEDS_REVIEW, REJECTED
    recruiter_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    interview = relationship("Interview", back_populates="evaluation")
