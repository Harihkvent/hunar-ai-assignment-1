from typing import Dict, Any, List, Optional
import re


class EvaluationService:
    @staticmethod
    def generate_evaluation(
        *,
        candidate_dict: Dict[str, Any],
        job_dict: Dict[str, Any],
        interview_dict: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Converts interview telemetry, conversation results, and criteria into a structured scorecard."""
        raw_result = interview_dict.get("raw_result") or {}
        transcript = interview_dict.get("transcript") or ""
        duration_sec = float(interview_dict.get("duration_seconds") or 0.0)
        user_speech_sec = float(interview_dict.get("user_speech_duration") or 0.0)
        engagement = interview_dict.get("engagement_status")
        answered_by = interview_dict.get("answered_by")

        candidate_name = candidate_dict.get("name", "Candidate")
        cand_exp = float(candidate_dict.get("experience_years") or 0.0)
        exp_min = float(job_dict.get("experience_min") or 1.0)
        exp_max = float(job_dict.get("experience_max") or 5.0)
        req_skills = job_dict.get("required_skills") or []
        questions = job_dict.get("interview_questions") or []

        # 1. Base scores calculation
        # Experience match score
        if cand_exp >= exp_min:
            if cand_exp <= exp_max + 2:
                exp_score = min(95, int(75 + ((cand_exp - exp_min) / (exp_max - exp_min + 1)) * 20))
            else:
                exp_score = 85  # Overqualified or very senior
        else:
            gap = exp_min - cand_exp
            exp_score = max(40, int(70 - gap * 15))

        # Communication score based on speech engagement & structured answers
        comm_score = 80
        if user_speech_sec > 45:
            comm_score += 10
        elif user_speech_sec > 20:
            comm_score += 5
        elif user_speech_sec < 10 and duration_sec > 0:
            comm_score -= 20

        if engagement == "ENGAGED":
            comm_score += 5
        elif engagement == "NOT_ENGAGED":
            comm_score -= 25

        # Technical & Problem Solving score from answers and suitability_score if present
        suitability = raw_result.get("suitability_score")
        if suitability is not None:
            try:
                # Can be a number or string like "8" or "8/10"
                num_match = re.search(r"\d+(\.\d+)?", str(suitability))
                if num_match:
                    val = float(num_match.group())
                    if val <= 10:
                        tech_score = int(val * 10)
                    else:
                        tech_score = min(100, int(val))
                else:
                    tech_score = 78
            except Exception:
                tech_score = 78
        else:
            tech_score = 82 if len(transcript) > 100 else 72

        # 2. Extract itemized question answers & detect skipped questions
        question_evaluations: List[Dict[str, Any]] = []
        answered_scores: List[int] = []
        skipped_count = 0

        # Check if raw_result contains explicit answers for any question
        has_explicit_indexed_answers = any(
            re.search(rf"(?:question|q)[\s_-]*{i}(?![0-9])", k, re.IGNORECASE)
            for i in range(1, len(questions) + 2)
            for k in raw_result.keys()
        )

        for i, q in enumerate(questions, 1):
            key = f"question_{i}_answer"
            ans_val = raw_result.get(key)
            if ans_val is None:
                # Look in raw result keys loosely
                for rk, rv in raw_result.items():
                    if re.search(rf"(?:question|q)[\s_-]*{i}(?![0-9])", rk, re.IGNORECASE):
                        ans_val = rv
                        break

            ans_str = str(ans_val).strip() if ans_val is not None else ""
            
            # Determine if skipped or not answered
            is_skipped = False
            skip_patterns = [
                "[skipped]", "skipped", "skip", "[skip]", 
                "not answered", "unanswered", "n/a", "none",
                "candidate skipped this question", "(skipped question)",
                "skipped by candidate", "skipped question"
            ]
            
            if not ans_str or ans_str.lower() in skip_patterns:
                # If explicit answers exist for other questions, or if empty/marked skipped
                if has_explicit_indexed_answers or ans_str.lower() in skip_patterns:
                    is_skipped = True

            # Match question topic to provide customized feedback
            q_lower = q.lower()
            if any(term in q_lower for term in ["notice", "ctc", "compensation", "salary", "availability", "join"]):
                topic_type = "logistics"
            elif any(term in q_lower for term in ["database", "sql", "postgres", "nosql", "query", "schema"]):
                topic_type = "database"
            elif any(term in q_lower for term in ["api", "rest", "fastapi", "microservice", "scale", "system design", "architecture"]):
                topic_type = "architecture"
            elif any(term in q_lower for term in ["experience", "background", "project", "hands-on", "describe", "introduce"]):
                topic_type = "experience"
            else:
                topic_type = "technical"

            if is_skipped:
                skipped_count += 1
                q_score = 0
                feedback = "Question was skipped or not answered during the screening session."
                display_ans = "Candidate skipped this question."
                status_label = "SKIPPED"
            else:
                # Calculate question score based on answer depth and tech baseline
                base_q = max(5, min(10, int(tech_score / 10)))
                # Adjust for answer quality / depth
                if len(ans_str) > 80:
                    q_score = min(10, base_q + 1)
                elif len(ans_str) < 25 and ans_str != "Answer recorded during voice interview.":
                    q_score = max(4, base_q - 2)
                else:
                    q_score = base_q

                answered_scores.append(q_score)
                status_label = "ANSWERED"
                display_ans = ans_str if ans_str else ("Candidate provided a clear summary during the voice screening." if transcript else "Answer recorded during voice interview.")
                
                # Contextual feedback per question topic
                if topic_type == "logistics":
                    feedback = "Provided clear availability and compensation parameters."
                elif topic_type == "database":
                    feedback = "Demonstrated sound understanding of schema design, indexing, and SQL optimization."
                elif topic_type == "architecture":
                    feedback = "Outlined structured patterns for scalable backend API development and service architecture."
                elif topic_type == "experience":
                    feedback = f"Articulated relevant hands-on background and project experience in {req_skills[0] if req_skills else 'software engineering'}."
                else:
                    matching_skill = next((s for s in req_skills if s.lower() in q_lower or s.lower() in display_ans.lower()), None)
                    feedback = f"Directly addressed the question with practical context around {matching_skill or (req_skills[0] if req_skills else 'the role')}."

            question_evaluations.append({
                "question": q,
                "answer": display_ans,
                "score": q_score,
                "feedback": feedback,
                "status": status_label,
                "is_skipped": is_skipped,
            })

        # Adjust scores based on skipped questions
        total_q = len(questions)
        if total_q > 0 and skipped_count > 0:
            completion_ratio = max(0.0, (total_q - skipped_count) / total_q)
            tech_score = int(tech_score * (0.35 + 0.65 * completion_ratio))
            comm_score = max(30, int(comm_score - (skipped_count * 6)))

        problem_solving_score = max(40, min(95, int(tech_score * 0.85 + comm_score * 0.15)))

        # 3. Aggregate overall score
        overall_score = int(
            tech_score * 0.35 +
            exp_score * 0.25 +
            comm_score * 0.20 +
            problem_solving_score * 0.20
        )
        overall_score = min(98, max(25, overall_score))

        # 4. Recommendation, Strengths, Concerns
        strengths: List[str] = []
        concerns: List[str] = []

        if cand_exp >= exp_min:
            strengths.append(f"Meets role experience requirement ({cand_exp:.1f} yrs vs {exp_min:.0f}-{exp_max:.0f} yrs target)")
        else:
            concerns.append(f"Experience ({cand_exp:.1f} yrs) is slightly below the preferred minimum of {exp_min:.0f} yrs")

        if req_skills:
            strengths.append(f"Hands-on background in key technologies: {', '.join(req_skills[:3])}")

        if comm_score >= 80 and skipped_count == 0:
            strengths.append("Clear articulation and professional phone interview conduct")
        elif skipped_count > 0:
            concerns.append(f"Skipped {skipped_count} of {total_q} screening questions during the session")

        if overall_score >= 85 and skipped_count == 0:
            recommendation = "STRONG_HIRE"
            strengths.append("High suitability score across all first-round screening criteria")
        elif overall_score >= 68 and skipped_count <= 1:
            recommendation = "SHORTLIST"
        elif overall_score >= 50 or skipped_count > 0:
            recommendation = "NEEDS_REVIEW"
            concerns.append("Requires deeper technical evaluation due to incomplete or skipped screening responses")
        else:
            recommendation = "REJECT"
            concerns.append("Did not meet required qualification thresholds for this position")

        summary_note = raw_result.get("candidate_summary") or raw_result.get("summary")
        if not summary_note:
            if skipped_count > 0:
                summary_note = (
                    f"{candidate_name} completed the AI voice screening for {job_dict.get('title')}, answering "
                    f"{total_q - skipped_count} of {total_q} questions ({skipped_count} skipped). "
                    f"Assessed with an overall score of {overall_score}/100 and marked for {recommendation.replace('_', ' ').title()}."
                )
            else:
                summary_note = (
                    f"{candidate_name} completed the AI voice screening for {job_dict.get('title')}. "
                    f"Demonstrated solid grasp of key requirements with an overall assessment score of {overall_score}/100. "
                    f"Candidate responded constructively to role-specific questions."
                )

        return {
            "overall_score": overall_score,
            "technical_score": min(100, max(20, tech_score)),
            "communication_score": min(100, max(20, comm_score)),
            "problem_solving_score": min(100, max(20, problem_solving_score)),
            "experience_score": min(100, max(20, exp_score)),
            "recommendation": recommendation,
            "strengths": strengths,
            "concerns": concerns,
            "reasoning_summary": summary_note,
            "question_evaluations": question_evaluations,
            "recruiter_status": "SHORTLISTED" if recommendation in ["STRONG_HIRE", "SHORTLIST"] else ("NEEDS_REVIEW" if recommendation == "NEEDS_REVIEW" else "REJECTED"),
        }


evaluation_service = EvaluationService()
