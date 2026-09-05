"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  PhoneCall,
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  Clock,
  Sparkles,
  Award,
  Play,
  CheckCircle2
} from "lucide-react";
import { api } from "../../../lib/api";
import { Candidate, Interview, Job } from "../../../lib/types";
import { formatDate, formatDuration, getStatusBadgeColor, getScoreBadgeColor } from "../../../lib/utils";
import VoiceScreeningModal from "../../../components/VoiceScreeningModal";

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const candidateId = resolvedParams.id;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isScreeningModalOpen, setIsScreeningModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    setIsLoading(true);
    api.getCandidate(candidateId)
      .then(async (c) => {
        setCandidate(c);
        const [j, ints] = await Promise.all([
          api.getJob(c.job_id).catch(() => null),
          api.getInterviews({ candidate_id: c.id }).catch(() => []),
        ]);
        setJob(j);
        setInterviews(ints);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [candidateId]);

  if (isLoading) {
    return <div className="p-12 text-center text-slate-400">Loading candidate profile...</div>;
  }

  if (!candidate) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-slate-300">Candidate not found.</p>
        <Link href="/candidates" className="text-indigo-400 hover:underline text-xs">
          Return to Candidates
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/candidates"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeColor(candidate.status)}`}>
                {candidate.status.replace("_", " ")}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
              {candidate.name}
            </h1>
          </div>
        </div>

        <button
          onClick={() => setIsScreeningModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Launch Voice Screening</span>
        </button>
      </div>

      {/* Grid: Profile & Attached Job */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Candidate Overview</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block mb-1">Current Role & Title:</span>
              <span className="font-bold text-slate-200 text-sm">{candidate.current_role}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block mb-1">Years of Experience:</span>
              <span className="font-bold text-slate-200 text-sm">{candidate.experience_years} Years</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block mb-1">Email Address:</span>
              <span className="font-mono text-slate-200">{candidate.email}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block mb-1">Mobile Phone (E.164):</span>
              <span className="font-mono text-indigo-300 font-bold">{candidate.phone}</span>
            </div>
          </div>

          {candidate.resume_notes && (
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Resume Summary & Recruiter Notes
              </span>
              <p className="text-xs text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-slate-800 leading-relaxed">
                {candidate.resume_notes}
              </p>
            </div>
          )}
        </div>

        {/* Applied Role Info */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>Applied Position</span>
            </h3>

            {job ? (
              <div className="space-y-3">
                <Link href={`/jobs/${job.id}`} className="font-bold text-base text-white hover:text-indigo-300 block">
                  {job.title}
                </Link>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Department: <strong className="text-slate-300">{job.department}</strong></div>
                  <div>Target Exp: <strong className="text-slate-300">{job.experience_min}-{job.experience_max} Years</strong></div>
                  <div>Hunar Persona: <strong className="text-slate-300">{job.persona_name || "Aria"}</strong></div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Position record not available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Voice Screening Sessions History */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-indigo-400" />
          <span>Screening Interviews & Scorecards ({interviews.length})</span>
        </h3>

        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          {interviews.length > 0 ? (
            <div className="divide-y divide-slate-800/80">
              {interviews.map((intItem) => (
                <div
                  key={intItem.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm text-slate-100">
                        Session: {intItem.request_id}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeColor(intItem.status)}`}>
                        {intItem.status.replace("_", " ")}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {intItem.mode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Initiated: {formatDate(intItem.created_at)} • Duration:{" "}
                      <strong className="text-slate-300">{formatDuration(intItem.duration_seconds)}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {intItem.has_evaluation ? (
                      <Link
                        href={`/evaluations/${intItem.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/20 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Evaluation Scorecard</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/interviews/${intItem.id}`}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Open Console</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No voice screening sessions conducted for this candidate yet. Click &quot;Launch Voice Screening&quot; to begin.
            </div>
          )}
        </div>
      </div>

      {/* Voice Screening Modal */}
      {isScreeningModalOpen && (
        <VoiceScreeningModal
          candidate={candidate}
          job={job}
          isOpen={isScreeningModalOpen}
          onClose={() => setIsScreeningModalOpen(false)}
          onSuccess={() => loadData()}
        />
      )}
    </div>
  );
}
