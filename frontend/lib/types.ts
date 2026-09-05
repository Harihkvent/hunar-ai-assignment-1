export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  experience_min: number;
  experience_max: number;
  required_skills: string[];
  preferred_skills: string[];
  interview_questions: string[];
  voice_persona: string;
  persona_name: string;
  language: string;
  hunar_agent_id?: string | null;
  hunar_agent_code?: string | null;
  status: "ACTIVE" | "PAUSED" | "CLOSED";
  candidate_count?: number;
  interview_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  job_id: string;
  job_title?: string;
  name: string;
  email: string;
  phone: string;
  experience_years: number;
  current_role: string;
  resume_notes?: string | null;
  status: "APPLIED" | "SCREENING_SCHEDULED" | "SCREENED" | "SHORTLISTED" | "NEEDS_REVIEW" | "REJECTED";
  latest_interview_status?: string | null;
  latest_interview_id?: string | null;
  overall_score?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  candidate_id: string;
  job_id: string;
  candidate_name?: string;
  candidate_phone?: string;
  job_title?: string;
  hunar_call_id?: string | null;
  request_id: string;
  provider: string;
  mode: "PHONE" | "SIMULATOR";
  status: "NOT_STARTED" | "SCHEDULED" | "INITIATED" | "RINGING" | "IN_PROGRESS" | "COMPLETED" | "NOT_CONNECTED" | "FAILED" | "CANCELLED";
  lifecycle_status: string;
  duration_seconds: number;
  duration_minutes: number;
  user_speech_duration: number;
  recording_url?: string | null;
  transcript?: string | null;
  raw_result?: Record<string, any> | null;
  answered_by?: string | null;
  call_ended_by?: string | null;
  engagement_status?: string | null;
  error_message?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  created_at: string;
  updated_at: string;
  has_evaluation?: boolean;
  evaluation_id?: string | null;
}

export interface QuestionEvaluation {
  question: string;
  answer: string;
  score: number;
  feedback: string;
  status?: "ANSWERED" | "SKIPPED" | string;
  is_skipped?: boolean;
}

export interface Evaluation {
  id: string;
  interview_id: string;
  candidate_id: string;
  job_id: string;
  candidate_name?: string;
  job_title?: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  problem_solving_score: number;
  experience_score: number;
  recommendation: "STRONG_HIRE" | "SHORTLIST" | "NEEDS_REVIEW" | "REJECT";
  strengths: string[];
  concerns: string[];
  reasoning_summary: string;
  question_evaluations: QuestionEvaluation[];
  recruiter_status: "PENDING" | "SHORTLISTED" | "NEEDS_REVIEW" | "REJECTED";
  recruiter_notes?: string | null;
  recording_url?: string | null;
  transcript?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_jobs: number;
  active_jobs: number;
  total_candidates: number;
  screened_candidates: number;
  completed_interviews: number;
  shortlisted_candidates: number;
  needs_review_candidates: number;
  rejected_candidates: number;
  average_score: number;
  recent_interviews: Interview[];
}

export interface SystemHealth {
  status: string;
  database: string;
  hunar_api_connected: boolean;
  hunar_agents_count: number;
  hunar_numbers_count: number;
  active_api_key_set: boolean;
  allowed_countries: string[];
  timestamp: string;
}

export interface SourcingProviderInfo {
  id: string;
  name: string;
  has_api_key: boolean;
  description: string;
  website: string;
  supported_filters: string[];
}

export interface SourcedCandidate {
  id: string;
  name: string;
  current_title: string;
  current_company: string;
  experience_years: number;
  skills: string[];
  location: string;
  email: string;
  phone: string;
  linkedin_url?: string | null;
  match_score: number;
  match_reasons: string[];
  provider: string;
  headline?: string | null;
}

export interface PeopleSearchRequest {
  job_id?: string;
  job_description?: string;
  title?: string;
  skills?: string[];
  experience_min?: number;
  experience_max?: number;
  location?: string;
  provider?: "APOLLO" | "PDL" | "PROXYCURL" | "CORESIGNAL" | string;
  limit?: number;
}

export interface PeopleSearchResponse {
  provider: string;
  total_found: number;
  results: SourcedCandidate[];
  extracted_criteria: Record<string, any>;
  is_live_api: boolean;
  provider_note: string;
}

