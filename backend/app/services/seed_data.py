import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

try:
    from app.models.models import Job, Candidate, Interview, Evaluation
except ImportError:
    from backend.app.models.models import Job, Candidate, Interview, Evaluation

logger = logging.getLogger(__name__)


def seed_database(db: Session):
    """Seed initial demo jobs, candidates, and evaluations if database is empty."""
    if db.query(Job).count() > 0:
        return

    logger.info("Seeding initial hiring data...")

    # Job 1: Senior Frontend Developer
    job_1 = Job(
        id="job-senior-frontend",
        title="Senior Frontend Developer",
        department="Frontend Engineering",
        location="Bengaluru, India (Hybrid)",
        description="We are seeking an experienced Senior Frontend Developer to lead the architecture and implementation of modern web applications using React, Next.js, and TypeScript. You will collaborate closely with UI/UX designers and backend engineers to build responsive, accessible, and high-performance interfaces.",
        experience_min=4,
        experience_max=8,
        required_skills=["React", "Next.js", "TypeScript", "Tailwind CSS", "State Management"],
        preferred_skills=["WebSockets", "Performance Optimization", "GraphQL"],
        interview_questions=[
            "How many years of React and Next.js experience do you have?",
            "Have you worked with Next.js App Router and Server Components?",
            "What is your expected CTC and notice period?"
        ],
        voice_persona="NEHA",
        persona_name="Aria",
        language="ENGLISH",
        hunar_agent_id="4d86bde1-c575-4cfc-b2e9-f66e6944a648",
        hunar_agent_code="FD79",
        status="ACTIVE",
    )

    # Job 2: Backend Python Lead
    job_2 = Job(
        id="job-backend-python-lead",
        title="Backend Python Lead",
        department="Core Infrastructure",
        location="Remote (India / Global)",
        description="Looking for a Backend Lead with extensive Python, FastAPI, and distributed systems experience to architect scalable microservices, manage database pipelines, and lead high-impact engineering initiatives.",
        experience_min=5,
        experience_max=9,
        required_skills=["Python", "FastAPI", "PostgreSQL", "Docker", "Redis", "System Design"],
        preferred_skills=["Kubernetes", "Kafka", "AWS Cloud Architecture"],
        interview_questions=[
            "Can you explain your experience building production APIs with FastAPI and Python?",
            "How do you approach database indexing and concurrency in PostgreSQL?",
            "What is your current notice period and compensation expectation?"
        ],
        voice_persona="NEHA",
        persona_name="Aria",
        language="ENGLISH",
        hunar_agent_id="dfb1ad2d-0f55-4bb1-99ea-f038979d695c",
        hunar_agent_code="FD80",
        status="ACTIVE",
    )

    # Job 3: DevOps & Cloud Engineer
    job_3 = Job(
        id="job-devops-engineer",
        title="DevOps & Cloud Engineer",
        department="Platform Operations",
        location="Mumbai, India (On-site / Hybrid)",
        description="Responsible for CI/CD automation, cloud infrastructure as code (Terraform), Kubernetes cluster management, and site reliability engineering across our cloud platforms.",
        experience_min=3,
        experience_max=6,
        required_skills=["AWS", "Kubernetes", "Terraform", "CI/CD", "Linux", "Prometheus"],
        preferred_skills=["Helm", "Go", "Security Hardening"],
        interview_questions=[
            "Describe your hands-on experience managing Kubernetes clusters in production.",
            "How have you structured Infrastructure as Code using Terraform?",
            "What is your notice period?"
        ],
        voice_persona="NEHA",
        persona_name="Aria",
        language="ENGLISH",
        hunar_agent_id="501a287f-ef92-4443-ab0d-15abc6394930",
        hunar_agent_code="FD83",
        status="ACTIVE",
    )

    db.add_all([job_1, job_2, job_3])
    db.commit()

    # Candidates for Job 1
    cand_1 = Candidate(
        id="cand-rohit-verma",
        job_id=job_1.id,
        name="Rohit Verma",
        email="rohit.verma.dev@example.com",
        phone="+919876543210",
        experience_years=5.5,
        current_role="Senior React Engineer at FinTech Corp",
        resume_notes="Strong expertise in React 18, Next.js App Router, and complex dashboard state management. Led design system adoption.",
        status="SHORTLISTED",
    )
    cand_2 = Candidate(
        id="cand-priya-sharma",
        job_id=job_1.id,
        name="Priya Sharma",
        email="priya.sharma@example.com",
        phone="+919811223344",
        experience_years=4.0,
        current_role="Frontend Developer at CloudTech Solutions",
        resume_notes="Built high-traffic B2B SaaS web apps with Next.js, Tailwind, and TypeScript.",
        status="SCREENING_SCHEDULED",
    )
    cand_3 = Candidate(
        id="cand-aman-gupta",
        job_id=job_1.id,
        name="Aman Gupta",
        email="aman.gupta@example.com",
        phone="+919988776655",
        experience_years=2.0,
        current_role="Junior Web Developer",
        resume_notes="Good foundational skills in JavaScript and HTML/CSS; newer to Next.js 14.",
        status="APPLIED",
    )

    # Candidates for Job 2
    cand_4 = Candidate(
        id="cand-sneha-patel",
        job_id=job_2.id,
        name="Sneha Patel",
        email="sneha.patel@example.com",
        phone="+919765432109",
        experience_years=6.5,
        current_role="Lead Backend Engineer at SaaSify",
        resume_notes="Designed asynchronous processing pipelines handling 10M+ daily events using FastAPI and PostgreSQL.",
        status="SHORTLISTED",
    )
    cand_5 = Candidate(
        id="cand-karthik-rajan",
        job_id=job_2.id,
        name="Karthik Rajan",
        email="karthik.rajan@example.com",
        phone="+919845012345",
        experience_years=4.5,
        current_role="Python Developer at DataCorp",
        resume_notes="Solid experience in Django and Flask, migrating services to FastAPI.",
        status="NEEDS_REVIEW",
    )

    # Candidate for Job 3
    cand_6 = Candidate(
        id="cand-vikram-singh",
        job_id=job_3.id,
        name="Vikram Singh",
        email="vikram.singh@example.com",
        phone="+919123456780",
        experience_years=5.0,
        current_role="DevOps Specialist",
        resume_notes="Managed multi-region AWS EKS clusters and automated GitOps workflows with ArgoCD.",
        status="SCREENED",
    )

    db.add_all([cand_1, cand_2, cand_3, cand_4, cand_5, cand_6])
    db.commit()

    # Pre-seeded Completed Interview & Evaluation for Candidate 1 (Rohit Verma)
    interview_1 = Interview(
        id="int-rohit-verma-01",
        candidate_id=cand_1.id,
        job_id=job_1.id,
        hunar_call_id="call-hunar-seed-001",
        request_id="seed-req-001",
        provider="HUNAR",
        mode="PHONE",
        status="COMPLETED",
        lifecycle_status="COMPLETED",
        duration_seconds=248.0,
        duration_minutes=4.13,
        user_speech_duration=142.0,
        recording_url="https://recordings.hunar.ai/asda1_sample_call_001.mp3",
        transcript=(
            "AI: Hello Rohit! This is Aria, an AI recruiter calling regarding your application for the Senior Frontend Developer role. Do you have a few minutes for a brief voice screening?\n"
            "Rohit: Yes, absolutely! I'm happy to talk.\n"
            "AI: Great! How many years of React and Next.js experience do you have?\n"
            "Rohit: I've been working with React for about five and a half years, and I've been actively using Next.js including the App Router and Server Components for over 2 years in my current role.\n"
            "AI: Have you worked with Next.js App Router and Server Components?\n"
            "Rohit: Yes, we recently migrated our customer-facing web portals to Next.js 14 App Router with streaming SSR and server actions, which significantly improved our Core Web Vitals.\n"
            "AI: What is your expected CTC and notice period?\n"
            "Rohit: My expected CTC is around 32 to 35 LPA, and I have a 30-day notice period, which is negotiable.\n"
            "AI: Thank you so much for sharing your background, Rohit. Our hiring team will review your screening responses and get back to you shortly. Have a great day!\n"
        ),
        raw_result={
            "candidate_summary": "Rohit demonstrated outstanding React and Next.js App Router expertise with clear real-world migration experience.",
            "question_1_answer": "5.5 years of React and 2+ years of Next.js with App Router and Server Components.",
            "question_2_answer": "Migrated production B2B portal to Next.js 14 App Router, streaming SSR, and server actions.",
            "question_3_answer": "Expected CTC 32-35 LPA, 30 days notice period.",
            "suitability_score": "9.2/10",
            "overall_recommendation": "STRONG_HIRE"
        },
        answered_by="HUMAN",
        call_ended_by="AGENT",
        engagement_status="ENGAGED",
        started_at=datetime.utcnow() - timedelta(hours=3),
        ended_at=datetime.utcnow() - timedelta(hours=3) + timedelta(seconds=248),
    )

    db.add(interview_1)
    db.commit()

    eval_1 = Evaluation(
        id="eval-rohit-verma-01",
        interview_id=interview_1.id,
        candidate_id=cand_1.id,
        job_id=job_1.id,
        overall_score=92,
        technical_score=94,
        communication_score=90,
        problem_solving_score=91,
        experience_score=92,
        recommendation="STRONG_HIRE",
        strengths=[
            "5.5 years of hands-on React and Next.js 14 App Router mastery",
            "Proven production experience with SSR streaming and Server Actions",
            "Articulate, confident communication with concise technical clarity",
            "Manageable 30-day notice period"
        ],
        concerns=[
            "Salary expectation is in the upper bracket of the role band"
        ],
        reasoning_summary="Rohit is an exceptional candidate for the Senior Frontend Developer position. He demonstrated deep domain fluency with Next.js 14 architecture and articulated past production performance wins.",
        question_evaluations=[
            {
                "question": "How many years of React and Next.js experience do you have?",
                "answer": "5.5 years of React and 2+ years of Next.js with App Router and Server Components.",
                "score": 9,
                "feedback": "Clear, verified timeline that aligns well with the senior level requirement."
            },
            {
                "question": "Have you worked with Next.js App Router and Server Components?",
                "answer": "Migrated production B2B portal to Next.js 14 App Router, streaming SSR, and server actions.",
                "score": 10,
                "feedback": "Excellent real-world architectural context with Core Web Vitals optimization."
            },
            {
                "question": "What is your expected CTC and notice period?",
                "answer": "Expected CTC 32-35 LPA, 30 days notice period.",
                "score": 9,
                "feedback": "30 days notice period is reasonable for immediate team onboarding."
            }
        ],
        recruiter_status="SHORTLISTED",
        recruiter_notes="Strong candidate. Recommended to proceed directly to the technical system design round with the Engineering Manager.",
    )

    # Pre-seeded Completed Interview & Evaluation for Candidate 4 (Sneha Patel)
    interview_4 = Interview(
        id="int-sneha-patel-01",
        candidate_id=cand_4.id,
        job_id=job_2.id,
        hunar_call_id="call-hunar-seed-002",
        request_id="seed-req-002",
        provider="HUNAR",
        mode="PHONE",
        status="COMPLETED",
        lifecycle_status="COMPLETED",
        duration_seconds=310.0,
        duration_minutes=5.16,
        user_speech_duration=190.0,
        recording_url="https://recordings.hunar.ai/asda1_sample_call_002.mp3",
        transcript=(
            "AI: Hello Sneha! This is Aria, an AI recruiter calling regarding your application for the Backend Python Lead role. Do you have a few minutes for a quick screening?\n"
            "Sneha: Hi Aria, yes I do.\n"
            "AI: Can you explain your experience building production APIs with FastAPI and Python?\n"
            "Sneha: I have spent the last 4 years leading Python microservice architectures using FastAPI, Pydantic v2, and async SQLAlchemy. We built asynchronous event-driven services handling high concurrency.\n"
            "AI: How do you approach database indexing and concurrency in PostgreSQL?\n"
            "Sneha: We use composite B-tree and GiST indexes based on query execution plans analyzed via EXPLAIN ANALYZE. For concurrency, we employ optimistic locking and connection pooling with PgBouncer.\n"
            "AI: What is your current notice period and compensation expectation?\n"
            "Sneha: My notice period is 45 days, and my expectation is 40 LPA.\n"
            "AI: Thank you Sneha for taking the time to speak with us. Our hiring team will review the discussion and update you soon.\n"
        ),
        raw_result={
            "candidate_summary": "Sneha has strong FastAPI and PostgreSQL architectural background with deep async database tuning experience.",
            "question_1_answer": "4 years of FastAPI microservice leadership, async SQLAlchemy, Pydantic v2.",
            "question_2_answer": "PostgreSQL indexing with EXPLAIN ANALYZE, PgBouncer pooling, optimistic concurrency.",
            "question_3_answer": "45 days notice period, 40 LPA expectation.",
            "suitability_score": "9.5/10",
            "overall_recommendation": "STRONG_HIRE"
        },
        answered_by="HUMAN",
        call_ended_by="AGENT",
        engagement_status="ENGAGED",
        started_at=datetime.utcnow() - timedelta(days=1),
        ended_at=datetime.utcnow() - timedelta(days=1) + timedelta(seconds=310),
    )

    eval_4 = Evaluation(
        id="eval-sneha-patel-01",
        interview_id=interview_4.id,
        candidate_id=cand_4.id,
        job_id=job_2.id,
        overall_score=94,
        technical_score=96,
        communication_score=92,
        problem_solving_score=95,
        experience_score=93,
        recommendation="STRONG_HIRE",
        strengths=[
            "Exceptional FastAPI and distributed microservices architecture knowledge",
            "Deep understanding of PostgreSQL performance tuning and query plan optimization",
            "Strong leadership experience in high-throughput SaaS environments"
        ],
        concerns=[
            "45 days notice period"
        ],
        reasoning_summary="Sneha is an outstanding engineering lead with strong technical depth across the entire backend stack.",
        question_evaluations=[
            {
                "question": "Can you explain your experience building production APIs with FastAPI and Python?",
                "answer": "4 years of FastAPI microservice leadership, async SQLAlchemy, Pydantic v2.",
                "score": 10,
                "feedback": "Demonstrated master-level familiarity with modern async Python paradigms."
            },
            {
                "question": "How do you approach database indexing and concurrency in PostgreSQL?",
                "answer": "PostgreSQL indexing with EXPLAIN ANALYZE, PgBouncer pooling, optimistic concurrency.",
                "score": 10,
                "feedback": "Comprehensive technical answer covering query plans and connection pooling."
            },
            {
                "question": "What is your current notice period and compensation expectation?",
                "answer": "45 days notice period, 40 LPA expectation.",
                "score": 8,
                "feedback": "Standard notice period."
            }
        ],
        recruiter_status="SHORTLISTED",
        recruiter_notes="Fast-track to final Technical Architecture discussion.",
    )

    db.add_all([eval_1, interview_4, eval_4])
    db.commit()
    logger.info("Seeding completed successfully.")
