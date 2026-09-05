import os
import sys
import json
import time
from fastapi.testclient import TestClient

# Ensure root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.main import app
from backend.app.core.config import settings
from backend.app.core.security import compute_hunar_signature

client = TestClient(app)

def run_tests():
    print("========================================")
    print("Running End-to-End System Tests")
    print("========================================")

    # 1. Health Check
    print("\n[1/7] Testing /api/system/health...")
    res = client.get("/api/system/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    health = res.json()
    print(f"  [OK] System status: {health['status']}, Hunar API connected: {health['hunar_api_connected']}")
    print(f"  [OK] Hunar Agent count: {health['hunar_agents_count']}, Phone Numbers: {health['hunar_numbers_count']}")

    # 2. Dashboard Stats
    print("\n[2/7] Testing /api/dashboard/stats...")
    res = client.get("/api/dashboard/stats")
    assert res.status_code == 200, f"Stats failed: {res.text}"
    stats = res.json()
    print(f"  [OK] Active Jobs: {stats['active_jobs']}, Total Candidates: {stats['total_candidates']}")
    print(f"  [OK] Screened Candidates: {stats['screened_candidates']}, Avg Score: {stats['average_score']}")

    # 3. Create Job
    print("\n[3/7] Testing Job Creation & Hunar Agent Auto-Sync...")
    job_payload = {
        "title": "Lead Full-Stack Engineer",
        "department": "Engineering",
        "location": "Bengaluru / Remote",
        "description": "Looking for a seasoned Full-Stack Engineer with React, Next.js, and FastAPI experience to build AI-driven products.",
        "experience_min": 4,
        "experience_max": 8,
        "required_skills": ["React", "Next.js", "Python", "FastAPI", "PostgreSQL"],
        "preferred_skills": ["Docker", "Tailwind CSS"],
        "interview_questions": [
            "How many years of React and Python experience do you have?",
            "Have you deployed Next.js applications in production?",
            "What is your notice period?"
        ],
        "voice_persona": "NEHA",
        "persona_name": "Aria",
        "language": "ENGLISH",
        "sync_hunar_agent": False
    }
    res = client.post("/api/jobs/", json=job_payload)
    assert res.status_code == 201, f"Job creation failed: {res.text}"
    job = res.json()
    job_id = job["id"]
    print(f"  [OK] Created Job: {job['title']} (ID: {job_id})")

    # 4. Attach Candidate
    print("\n[4/7] Testing Candidate Attachment...")
    cand_payload = {
        "job_id": job_id,
        "name": "Arjun Nair",
        "email": "arjun.nair@example.com",
        "phone": "+919876543210",
        "experience_years": 5.0,
        "current_role": "Full-Stack Developer at TechVentures",
        "resume_notes": "Built React web apps with Python backend and PostgreSQL."
    }
    res = client.post("/api/candidates/", json=cand_payload)
    assert res.status_code == 201, f"Candidate creation failed: {res.text}"
    candidate = res.json()
    candidate_id = candidate["id"]
    print(f"  [OK] Created Candidate: {candidate['name']} (ID: {candidate_id})")

    # 5. Launch & Complete Simulated Voice Screening
    print("\n[5/7] Testing Voice Screening Session Execution...")
    launch_res = client.post("/api/interviews/launch", json={
        "candidate_id": candidate_id,
        "mode": "SIMULATOR"
    })
    assert launch_res.status_code == 201, f"Interview launch failed: {launch_res.text}"
    interview = launch_res.json()
    interview_id = interview["id"]
    print(f"  [OK] Screening Session Launched: {interview['request_id']} (Mode: {interview['mode']})")

    complete_res = client.post(f"/api/interviews/{interview_id}/complete-simulated", json={
        "transcript": (
            "AI: Hello Arjun! This is Aria, an AI recruiter calling regarding your application for the Lead Full-Stack Engineer role.\n"
            "Candidate: Hi Aria, I am ready for the screening.\n"
            "AI: How many years of React and Python experience do you have?\n"
            "Candidate: I have over 5 years of experience with React and Python FastAPI in production.\n"
            "AI: Have you deployed Next.js applications in production?\n"
            "Candidate: Yes, I have deployed full-stack Next.js apps with Server Components and SSR caching on Vercel and Docker.\n"
            "AI: What is your notice period?\n"
            "Candidate: 30 days.\n"
        ),
        "answers": {
            "question_1_answer": "5+ years of React and Python FastAPI in production.",
            "question_2_answer": "Deployed full-stack Next.js apps with Server Components and SSR caching.",
            "question_3_answer": "30 days notice period."
        },
        "duration_seconds": 210,
        "user_speech_duration": 115,
        "suitability_score": "9.0/10",
        "overall_recommendation": "STRONG_HIRE"
    })
    assert complete_res.status_code == 200, f"Simulated interview completion failed: {complete_res.text}"
    completed_int = complete_res.json()
    print(f"  [OK] Completed Interview: Status={completed_int['status']}, Has Evaluation={completed_int['has_evaluation']}")

    # 6. Evaluation Scorecard Verification & Recruiter Decision
    print("\n[6/7] Testing Structured Evaluation Scorecard & Decision...")
    eval_res = client.get(f"/api/evaluations/{interview_id}")
    assert eval_res.status_code == 200, f"Evaluation retrieval failed: {eval_res.text}"
    evaluation = eval_res.json()
    print(f"  [OK] Overall Score: {evaluation['overall_score']}/100, Recommendation: {evaluation['recommendation']}")
    print(f"  [OK] Technical Score: {evaluation['technical_score']}%, Comm Score: {evaluation['communication_score']}%")
    print(f"  [OK] Strengths Identified: {len(evaluation['strengths'])}, Concerns: {len(evaluation['concerns'])}")

    decision_res = client.put(f"/api/evaluations/{evaluation['id']}/decision", json={
        "recruiter_status": "SHORTLISTED",
        "recruiter_notes": "Great technical depth with Next.js and FastAPI. Move to Round 2."
    })
    assert decision_res.status_code == 200, f"Decision update failed: {decision_res.text}"
    updated_eval = decision_res.json()
    print(f"  [OK] Recruiter Status Updated to: {updated_eval['recruiter_status']}")

    # 7. Webhook HMAC-SHA256 Signature Verification
    print("\n[7/9] Testing Webhook Signature Verification...")
    webhook_body = json.dumps({
        "event_type": "call_summary",
        "call_id": "hunar-test-call-999",
        "request_id": interview["request_id"],
        "status": "COMPLETED",
        "duration_seconds": 240,
        "duration_minutes": 4.0
    }, sort_keys=True, separators=(",", ":")).encode("utf-8")

    ts = str(int(time.time()))
    sig = compute_hunar_signature(api_key=settings.HUNAR_API_KEY, request_body=webhook_body, timestamp=ts)

    hook_res = client.post(
        "/api/webhooks/hunar",
        content=webhook_body,
        headers={
            "X-Hunar-Signature": sig,
            "X-Hunar-Timestamp": ts,
            "Content-Type": "application/json"
        }
    )
    assert hook_res.status_code == 200, f"Webhook failed: {hook_res.text}"
    print(f"  [OK] Webhook verified and processed: {hook_res.json()}")

    # 8. Sourcing & People Search API
    print("\n[8/9] Testing People Search & Sourcing Engine (Apollo/PDL/Proxycurl/Coresignal)...")
    providers_res = client.get("/api/sourcing/providers")
    assert providers_res.status_code == 200, f"Providers failed: {providers_res.text}"
    providers = providers_res.json()
    assert len(providers) == 4, f"Expected 4 providers, got {len(providers)}"
    print(f"  [OK] Sourcing Providers available: {[p['id'] for p in providers]}")

    search_res = client.post("/api/sourcing/search", json={
        "job_id": job_id,
        "provider": "APOLLO",
        "limit": 4
    })
    assert search_res.status_code == 200, f"Search failed: {search_res.text}"
    search_data = search_res.json()
    assert len(search_data["results"]) > 0, "No candidates found"
    top_cand = search_data["results"][0]
    print(f"  [OK] Sourced {len(search_data['results'])} candidates. Top candidate: {top_cand['name']} ({top_cand['match_score']}% Match)")

    # 9. 1-Click Import & Reachout
    print("\n[9/9] Testing 1-Click Import & Voice AI Reachout...")
    import_res = client.post("/api/sourcing/import-and-reachout", json={
        "job_id": job_id,
        "candidate": top_cand,
        "launch_voice_reachout": True,
        "reachout_mode": "SIMULATOR"
    })
    assert import_res.status_code == 201, f"Import failed: {import_res.text}"
    import_data = import_res.json()
    assert import_data["success"] is True
    print(f"  [OK] Imported candidate: {import_data['candidate_name']}, Reachout Status: {import_data['call_status']}")

    print("\n========================================")
    print("ALL TESTS PASSED SUCCESSFULLY (9/9) [OK]")
    print("========================================")

if __name__ == "__main__":
    run_tests()
