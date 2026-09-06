import { Job, Candidate, Interview, Evaluation, DashboardStats, SystemHealth } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
  };

  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      // ignore
    }
    throw new Error(errorDetail || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // --- Dashboard & System ---
  getDashboardStats: () => request<DashboardStats>("/dashboard/stats"),
  getSystemHealth: () => request<SystemHealth>("/system/health"),
  getCallerNumbers: () => request<any[]>("/system/numbers"),

  // --- Jobs ---
  getJobs: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    return request<Job[]>(`/jobs/${qs ? `?${qs}` : ""}`);
  },
  getJob: (id: string) => request<Job>(`/jobs/${id}`),
  createJob: (job: Partial<Job> & { sync_hunar_agent?: boolean }) =>
    request<Job>("/jobs/", {
      method: "POST",
      body: JSON.stringify(job),
    }),
  updateJob: (id: string, job: Partial<Job> & { sync_hunar_agent?: boolean }) =>
    request<Job>(`/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(job),
    }),
  syncJobAgent: (id: string) =>
    request<Job>(`/jobs/${id}/sync-agent`, {
      method: "POST",
    }),
  generateQuestions: (params: {
    title: string;
    description?: string;
    required_skills?: string[];
    experience_min?: number;
    experience_max?: number;
  }) =>
    request<{ job_title: string; recommended_questions: string[]; question_count: number }>(
      "/jobs/generate-questions",
      {
        method: "POST",
        body: JSON.stringify(params),
      }
    ),
  deleteJob: (id: string) =>
    request<void>(`/jobs/${id}`, {
      method: "DELETE",
    }),

  // --- Candidates ---
  getCandidates: (params?: { job_id?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.job_id) query.set("job_id", params.job_id);
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    return request<Candidate[]>(`/candidates/${qs ? `?${qs}` : ""}`);
  },
  getCandidate: (id: string) => request<Candidate>(`/candidates/${id}`),
  createCandidate: (candidate: Partial<Candidate>) =>
    request<Candidate>("/candidates/", {
      method: "POST",
      body: JSON.stringify(candidate),
    }),
  updateCandidate: (id: string, candidate: Partial<Candidate>) =>
    request<Candidate>(`/candidates/${id}`, {
      method: "PUT",
      body: JSON.stringify(candidate),
    }),
  deleteCandidate: (id: string) =>
    request<void>(`/candidates/${id}`, {
      method: "DELETE",
    }),

  // --- Interviews ---
  getInterviews: (params?: { job_id?: string; candidate_id?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.job_id) query.set("job_id", params.job_id);
    if (params?.candidate_id) query.set("candidate_id", params.candidate_id);
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();
    return request<Interview[]>(`/interviews/${qs ? `?${qs}` : ""}`);
  },
  getInterview: (id: string) => request<Interview>(`/interviews/${id}`),
  launchInterview: (data: {
    candidate_id: string;
    mode?: "PHONE" | "SIMULATOR";
    from_phone_number?: string;
    custom_data?: Record<string, any>;
  }) =>
    request<Interview>("/interviews/launch", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  completeSimulatedInterview: (
    interviewId: string,
    data: {
      transcript: string;
      answers: Record<string, string>;
      duration_seconds: number;
      user_speech_duration: number;
      summary?: string;
      suitability_score?: string;
      overall_recommendation?: string;
    }
  ) =>
    request<Interview>(`/interviews/${interviewId}/complete-simulated`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // --- Evaluations ---
  getEvaluation: (interviewId: string) => request<Evaluation>(`/evaluations/${interviewId}`),
  updateRecruiterDecision: (
    evaluationId: string,
    decision: { recruiter_status: string; recruiter_notes?: string }
  ) =>
    request<Evaluation>(`/evaluations/${evaluationId}/decision`, {
      method: "PUT",
      body: JSON.stringify(decision),
    }),
  regenerateEvaluation: (interviewId: string) =>
    request<Evaluation>(`/evaluations/${interviewId}/regenerate`, {
      method: "POST",
    }),

  // --- Sourcing & People Search ---
  getSourcingProviders: () => request<import("./types").SourcingProviderInfo[]>("/sourcing/providers"),
  searchPeople: (params: import("./types").PeopleSearchRequest) =>
    request<import("./types").PeopleSearchResponse>("/sourcing/search", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  importSourcedCandidate: (data: {
    job_id: string;
    candidate: import("./types").SourcedCandidate;
    launch_voice_reachout?: boolean;
    reachout_mode?: "PHONE" | "SIMULATOR" | string;
  }) =>
    request<{
      success: boolean;
      candidate_id: string;
      candidate_name: string;
      job_id: string;
      job_title: string;
      interview_id?: string | null;
      call_status: string;
      message: string;
    }>("/sourcing/import-and-reachout", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

