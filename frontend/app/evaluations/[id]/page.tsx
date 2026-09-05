"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  FileText,
  ArrowLeft,
  Award,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Sparkles,
  RotateCcw,
  MessageSquare,
  Save,
  Check,
  PhoneCall
} from "lucide-react";
import { api } from "@/lib/api";
import { Evaluation } from "@/lib/types";
import { formatDate, getScoreBadgeColor } from "@/lib/utils";
import ScoreMeters from "@/components/ScoreMeters";
import AudioPlayer from "@/components/AudioPlayer";

export default function EvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const interviewId = resolvedParams.id;

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recruiterStatus, setRecruiterStatus] = useState<string>("PENDING");
  const [recruiterNotes, setRecruiterNotes] = useState<string>("");
  const [isSavingDecision, setIsSavingDecision] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    setIsLoading(true);
    setErrorMessage(null);
    api.getEvaluation(interviewId)
      .then((ev) => {
        setEvaluation(ev);
        setRecruiterStatus(ev.recruiter_status || "PENDING");
        setRecruiterNotes(ev.recruiter_notes || "");
      })
      .catch((err) => {
        setErrorMessage(err.message || "Evaluation not yet generated for this interview session.");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [interviewId]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const refreshed = await api.regenerateEvaluation(interviewId);
      setEvaluation(refreshed);
      setRecruiterStatus(refreshed.recruiter_status || "PENDING");
      setRecruiterNotes(refreshed.recruiter_notes || "");
    } catch (err: any) {
      alert(err.message || "Failed to regenerate scorecard");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDecision = async (status: string) => {
    if (!evaluation) return;
    setIsSavingDecision(true);
    setSaveSuccess(false);

    try {
      const updated = await api.updateRecruiterDecision(evaluation.id, {
        recruiter_status: status,
        recruiter_notes: recruiterNotes,
      });
      setEvaluation(updated);
      setRecruiterStatus(updated.recruiter_status);
      setSaveSuccess(true);

      // Trigger confetti on Shortlist!
      if (status === "SHORTLISTED") {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save recruiter decision.");
    } finally {
      setIsSavingDecision(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-slate-400">Loading candidate evaluation scorecard...</div>;
  }

  if (!evaluation) {
    return (
      <div className="max-w-xl mx-auto my-12 glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Scorecard Not Yet Available</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {errorMessage || "This screening interview has not concluded yet. The AI scorecard will automatically generate once the call or simulator screening finishes."}
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href={`/interviews/${interviewId}`}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/30"
          >
            Open Screening Console
          </Link>
          <Link
            href="/candidates"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all"
          >
            View Candidates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/interviews/${interviewId}`}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Structured Candidate Scorecard
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {formatDate(evaluation.created_at)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
              {evaluation.candidate_name || "Candidate Evaluation"}
            </h1>
            <p className="text-xs text-slate-400">
              Role Position: <strong className="text-slate-200">{evaluation.job_title}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-50"
            title="Recompute evaluation scores and signals"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin text-indigo-400" : ""}`} />
            <span>{isRegenerating ? "Recalculating..." : "Recalculate Scorecard"}</span>
          </button>

          <Link
            href={`/interviews/${interviewId}`}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Screening Logs</span>
          </Link>
        </div>
      </div>

      {/* Main Score Meters & AI Breakdown */}
      <ScoreMeters evaluation={evaluation} />

      {/* Reasoning Summary */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>AI Executive Evaluation Summary</span>
        </h3>
        <p className="text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 leading-relaxed">
          {evaluation.reasoning_summary}
        </p>
      </div>

      {/* Question-by-Question Itemized Response Signals */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span>Itemized Screening Responses & Assessment</span>
        </h3>

        <div className="space-y-3">
          {evaluation.question_evaluations?.map((qItem, idx) => {
            const isSkipped = qItem.is_skipped || qItem.status === "SKIPPED" || qItem.score === 0 || qItem.answer?.toLowerCase().includes("skipped");

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border space-y-2.5 transition-colors ${
                  isSkipped
                    ? "bg-slate-900/40 border-amber-500/20"
                    : "bg-slate-900/70 border-slate-800/80"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`text-xs font-bold ${isSkipped ? "text-slate-300" : "text-slate-200"}`}>
                    Q{idx + 1}: {qItem.question}
                  </span>
                  {isSkipped ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold shrink-0">
                      Skipped (0/10)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold shrink-0">
                      {qItem.score}/10
                    </span>
                  )}
                </div>

                <div className={`text-xs p-3 rounded-lg border leading-relaxed font-mono ${
                  isSkipped
                    ? "bg-slate-950/40 text-slate-400 border-amber-500/20 italic"
                    : "bg-slate-950/60 text-slate-300 border-slate-800/60"
                }`}>
                  <span className={`font-semibold block mb-1 ${isSkipped ? "text-amber-400" : "text-indigo-400"}`}>
                    {isSkipped ? "Status:" : "Answer Captured:"}
                  </span>
                  {qItem.answer}
                </div>

                {qItem.feedback && (
                  <p className={`text-[11px] italic ${isSkipped ? "text-amber-400/80" : "text-slate-400"}`}>
                    Assessment signal: {qItem.feedback}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Audio Recording & Transcript */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AudioPlayer
          recordingUrl={evaluation.recording_url}
          candidateName={evaluation.candidate_name}
        />

        {evaluation.transcript && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Conversation Transcript</span>
            </h4>
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
              {evaluation.transcript}
            </div>
          </div>
        )}
      </div>

      {/* Recruiter Decision Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <span>Recruiter Decision & Next Steps</span>
          </h3>

          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Decision Saved Successfully!</span>
            </span>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Recruiter Review Notes
          </label>
          <textarea
            rows={3}
            value={recruiterNotes}
            onChange={(e) => setRecruiterNotes(e.target.value)}
            placeholder="Add notes for the hiring manager, key follow-ups for round 2..."
            className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-slate-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleDecision("REJECTED")}
            disabled={isSavingDecision}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
              recruiterStatus === "REJECTED"
                ? "bg-rose-500/20 border-rose-500 text-rose-300"
                : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-rose-400 hover:border-rose-500/40"
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>Mark as Rejected</span>
          </button>

          <button
            type="button"
            onClick={() => handleDecision("NEEDS_REVIEW")}
            disabled={isSavingDecision}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
              recruiterStatus === "NEEDS_REVIEW"
                ? "bg-amber-500/20 border-amber-500 text-amber-300"
                : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500/40"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Flag for Review</span>
          </button>

          <button
            type="button"
            onClick={() => handleDecision("SHORTLISTED")}
            disabled={isSavingDecision}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg transition-all active:scale-95 ${
              recruiterStatus === "SHORTLISTED"
                ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
                : "bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-indigo-600/30"
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Shortlist for Round 2</span>
          </button>
        </div>
      </div>
    </div>
  );
}
