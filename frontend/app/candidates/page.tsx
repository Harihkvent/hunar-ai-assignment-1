"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  PhoneCall,
  FileText,
  Briefcase,
  ChevronRight,
  Plus,
  MessageSquare,
  UserSearch
} from "lucide-react";
import { api } from "../../lib/api";
import { Candidate, Job } from "../../lib/types";
import { formatDate, getStatusBadgeColor, getScoreBadgeColor, formatStatus } from "../../lib/utils";
import VoiceScreeningModal from "../../components/VoiceScreeningModal";
import QuickScreeningAnswersModal from "../../components/QuickScreeningAnswersModal";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [jobFilter, setJobFilter] = useState<string>("ALL");
  const [screeningCandidate, setScreeningCandidate] = useState<Candidate | null>(null);
  const [previewInterviewId, setPreviewInterviewId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([api.getCandidates(), api.getJobs()])
      .then(([c, j]) => {
        setCandidates(c);
        setJobs(j);
      })
      .catch((err) => console.error("Failed to load candidates:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.current_role && c.current_role.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchesJob = jobFilter === "ALL" || c.job_id === jobFilter;
    return matchesSearch && matchesStatus && matchesJob;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>Candidate Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track all applicants, voice screening statuses, and AI evaluation signals.
          </p>
        </div>

        <Link
          href="/jobs"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Briefcase className="w-4 h-4" />
          <span>View Job Pipelines</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            suppressHydrationWarning
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidates by name, email, role..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500"
          />
        </div>

        <div>
          <select
            suppressHydrationWarning
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
          >
            <option value="ALL" className="bg-slate-900">All Job Roles</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id} className="bg-slate-900">
                {j.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            suppressHydrationWarning
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
          >
            <option value="ALL" className="bg-slate-900">All Pipeline Statuses</option>
            <option value="APPLIED" className="bg-slate-900">Applied (Unscreened)</option>
            <option value="SCREENING_SCHEDULED" className="bg-slate-900">Screening Scheduled / Active</option>
            <option value="SCREENED" className="bg-slate-900">Screened</option>
            <option value="SHORTLISTED" className="bg-slate-900">Shortlisted</option>
            <option value="NEEDS_REVIEW" className="bg-slate-900">Needs Review</option>
            <option value="REJECTED" className="bg-slate-900">Rejected</option>
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {filteredCandidates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Candidate</th>
                  <th className="px-5 py-3 font-semibold">Applied Role</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Experience</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Score</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCandidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-5 py-4">
                      <Link
                        href={`/candidates/${cand.id}`}
                        className="font-bold text-slate-100 hover:text-indigo-300 block"
                      >
                        {cand.name}
                      </Link>
                      <span className="text-[11px] text-slate-400">{cand.current_role}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-300 font-medium">
                        {cand.job_title || "General"}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-300">
                      <div>{cand.phone}</div>
                      <div className="text-[11px] text-slate-500">{cand.email}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {cand.experience_years} Years
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-wide ${getStatusBadgeColor(cand.status)}`}>
                        {formatStatus(cand.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {cand.overall_score ? (
                        <span className={`px-2 py-0.5 rounded-lg border font-mono font-bold ${getScoreBadgeColor(cand.overall_score)}`}>
                          {cand.overall_score}/100
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {cand.latest_interview_id && (
                          <>
                            <button
                              type="button"
                              onClick={() => setPreviewInterviewId(cand.latest_interview_id || null)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 hover:bg-cyan-500/15 border border-cyan-500/30 transition-colors"
                              title="View conversation responses & answers"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Responses</span>
                            </button>

                            <Link
                              href={`/evaluations/${cand.latest_interview_id}`}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-400 hover:bg-indigo-500/15 border border-indigo-500/20 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Scorecard</span>
                            </Link>
                          </>
                        )}
                        <button
                          onClick={() => setScreeningCandidate(cand)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all active:scale-95"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Screen</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            No matching candidates found.
          </div>
        )}
      </div>

      {/* Quick Screening Answers Modal */}
      <QuickScreeningAnswersModal
        interviewId={previewInterviewId}
        isOpen={Boolean(previewInterviewId)}
        onClose={() => setPreviewInterviewId(null)}
      />

      {/* Voice Screening Modal */}
      {screeningCandidate && (
        <VoiceScreeningModal
          candidate={screeningCandidate}
          job={jobs.find((j) => j.id === screeningCandidate.job_id)}
          isOpen={!!screeningCandidate}
          onClose={() => setScreeningCandidate(null)}
          onSuccess={() => loadData()}
        />
      )}
    </div>
  );
}
