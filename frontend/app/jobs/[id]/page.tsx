"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  PhoneCall,
  ArrowLeft,
  Sparkles,
  Plus,
  Play,
  FileText,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  UserSearch
} from "lucide-react";
import { api } from "@/lib/api";
import { Job, Candidate } from "@/lib/types";
import { formatDate, getStatusBadgeColor, getScoreBadgeColor } from "@/lib/utils";
import VoiceScreeningModal from "@/components/VoiceScreeningModal";
import QuickScreeningAnswersModal from "@/components/QuickScreeningAnswersModal";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;

  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [previewInterviewId, setPreviewInterviewId] = useState<string | null>(null);

  // Modal states
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [screeningCandidate, setScreeningCandidate] = useState<Candidate | null>(null);

  // New candidate form
  const [newCandName, setNewCandName] = useState("");
  const [newCandEmail, setNewCandEmail] = useState("");
  const [newCandPhone, setNewCandPhone] = useState("+91");
  const [newCandExp, setNewCandExp] = useState(3.0);
  const [newCandRole, setNewCandRole] = useState("Software Engineer");
  const [newCandNotes, setNewCandNotes] = useState("");

  const loadData = () => {
    setIsLoading(true);
    Promise.all([api.getJob(jobId), api.getCandidates({ job_id: jobId })])
      .then(([j, c]) => {
        setJob(j);
        setCandidates(c);
      })
      .catch((err) => console.error("Failed to load job details:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [jobId]);

  const handleSyncAgent = async () => {
    if (!job) return;
    setIsSyncing(true);
    try {
      const updated = await api.syncJobAgent(job.id);
      setJob(updated);
      alert("Hunar Voice Agent synchronized successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to sync agent.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandName.trim() || !newCandEmail.trim() || !newCandPhone.trim()) return;

    try {
      await api.createCandidate({
        job_id: jobId,
        name: newCandName,
        email: newCandEmail,
        phone: newCandPhone,
        experience_years: newCandExp,
        current_role: newCandRole,
        resume_notes: newCandNotes,
      });

      setIsAddCandidateOpen(false);
      setNewCandName("");
      setNewCandEmail("");
      setNewCandPhone("+91");
      setNewCandNotes("");
      loadData();
    } catch (err) {
      alert("Failed to add candidate.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading job position details...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-slate-300">Job position not found.</p>
        <Link href="/jobs" className="text-indigo-400 hover:underline text-xs">
          Return to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back and Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/jobs"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                {job.department}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeColor(job.status)}`}>
                {job.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
              {job.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncAgent}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>Sync Voice Agent</span>
          </button>

          <button
            onClick={() => setIsAddCandidateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Description, Skills, Questions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Role Summary</h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>

            {/* Skills */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Required Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {job.required_skills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {job.preferred_skills && job.preferred_skills.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Preferred Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {job.preferred_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Voice Screening Questions */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Voice Screening Questions ({job.interview_questions?.length || 0})</span>
            </h3>
            <div className="space-y-2">
              {job.interview_questions?.map((q, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300"
                >
                  <span className="font-bold text-indigo-400 shrink-0">{idx + 1}.</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Voice Agent Card & Pipeline metrics */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Hunar Voice Agent
                </h4>
                <p className="text-xs text-slate-400">
                  Persona: <strong className="text-slate-200">{job.persona_name || "Aria"}</strong> ({job.voice_persona})
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
              <div className="flex justify-between text-slate-400">
                <span>Agent Status:</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Configured</span>
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Agent Code:</span>
                <span className="font-mono text-indigo-400">{job.hunar_agent_code || "FD79"}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Language:</span>
                <span className="text-slate-200">{job.language || "ENGLISH"}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Target Experience:</span>
                <span className="text-slate-200">{job.experience_min} - {job.experience_max} Years</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pipeline Snapshot
            </h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-2xl font-bold text-white block">{candidates.length}</span>
                <span className="text-[10px] text-slate-400">Applicants</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-2xl font-bold text-indigo-400 block">
                  {candidates.filter((c) => c.status === "SHORTLISTED").length}
                </span>
                <span className="text-[10px] text-slate-400">Shortlisted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Pipeline Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Candidate Pipeline ({candidates.length})
            </h2>
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          {candidates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Candidate</th>
                    <th className="px-5 py-3 font-semibold">Contact</th>
                    <th className="px-5 py-3 font-semibold">Experience</th>
                    <th className="px-5 py-3 font-semibold">Screening Status</th>
                    <th className="px-5 py-3 font-semibold">AI Score</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {candidates.map((cand) => (
                    <tr key={cand.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-5 py-4">
                        <Link href={`/candidates/${cand.id}`} className="font-bold text-slate-100 hover:text-indigo-300">
                          {cand.name}
                        </Link>
                        <span className="block text-[11px] text-slate-400">{cand.current_role}</span>
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-300">
                        <div>{cand.phone}</div>
                        <div className="text-[11px] text-slate-500">{cand.email}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {cand.experience_years} Years
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${getStatusBadgeColor(cand.status)}`}>
                          {cand.status.replace("_", " ")}
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
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 hover:bg-cyan-500/15 border border-cyan-500/30 transition-colors flex items-center gap-1"
                                title="View conversation responses & itemized answers"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Responses</span>
                              </button>

                              <Link
                                href={`/evaluations/${cand.latest_interview_id}`}
                                className="p-2 rounded-lg text-indigo-400 hover:bg-indigo-500/15 transition-colors"
                                title="View Scorecard"
                              >
                                <FileText className="w-4 h-4" />
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
            <div className="p-8 text-center text-slate-400 text-xs">
              No candidates attached to this job yet. Click &quot;Add Candidate&quot; to begin.
            </div>
          )}
        </div>
      </div>

      {/* Add Candidate Modal */}
      {isAddCandidateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl glass-panel bg-slate-900 border border-slate-700 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Add Candidate to {job.title}</h3>
            <form onSubmit={handleCreateCandidate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  suppressHydrationWarning
                  type="text"
                  required
                  value={newCandName}
                  onChange={(e) => setNewCandName(e.target.value)}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
                <input
                  suppressHydrationWarning
                  type="email"
                  required
                  value={newCandEmail}
                  onChange={(e) => setNewCandEmail(e.target.value)}
                  placeholder="vikram@example.com"
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone (E.164) *</label>
                <input
                  suppressHydrationWarning
                  type="text"
                  required
                  value={newCandPhone}
                  onChange={(e) => setNewCandPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Experience (Yrs)</label>
                  <input
                    suppressHydrationWarning
                    type="number"
                    step="0.5"
                    value={newCandExp}
                    onChange={(e) => setNewCandExp(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Current Role</label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={newCandRole}
                    onChange={(e) => setNewCandRole(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Resume / Recruiter Notes</label>
                <textarea
                  rows={2}
                  value={newCandNotes}
                  onChange={(e) => setNewCandNotes(e.target.value)}
                  placeholder="Background notes, referral source..."
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCandidateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
                >
                  Attach Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Screening Answers Modal */}
      <QuickScreeningAnswersModal
        interviewId={previewInterviewId}
        isOpen={Boolean(previewInterviewId)}
        onClose={() => setPreviewInterviewId(null)}
      />

      {/* Voice Screening Launcher Modal */}
      {screeningCandidate && (
        <VoiceScreeningModal
          candidate={screeningCandidate}
          job={job}
          isOpen={!!screeningCandidate}
          onClose={() => setScreeningCandidate(null)}
          onSuccess={() => loadData()}
        />
      )}
    </div>
  );
}
