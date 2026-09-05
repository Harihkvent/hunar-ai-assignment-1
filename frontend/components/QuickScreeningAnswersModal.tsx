"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  Sparkles,
  FileText,
  PhoneCall,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Volume2,
  Clock,
  User,
  Bot,
  AlertTriangle
} from "lucide-react";
import { api } from "../lib/api";
import { Evaluation, Interview } from "../lib/types";
import { formatDate, formatDuration, getScoreBadgeColor, getStatusBadgeColor } from "../lib/utils";
import AudioPlayer from "./AudioPlayer";

interface QuickScreeningAnswersModalProps {
  interviewId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickScreeningAnswersModal({
  interviewId,
  isOpen,
  onClose,
}: QuickScreeningAnswersModalProps) {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !interviewId) {
      setEvaluation(null);
      setInterview(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    Promise.all([
      api.getEvaluation(interviewId).catch(() => null),
      api.getInterview(interviewId).catch(() => null),
    ])
      .then(([ev, iv]) => {
        setEvaluation(ev);
        setInterview(iv);
        if (!ev && !iv) {
          setErrorMessage("No interview screening records found.");
        }
      })
      .catch((err) => setErrorMessage(err.message || "Failed to load responses."))
      .finally(() => setIsLoading(false));
  }, [isOpen, interviewId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col glass-panel rounded-3xl border border-slate-700/80 shadow-2xl bg-[#0b101b] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Conversation Responses & Answers
                </h3>
                {interview?.status && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeColor(interview.status)}`}>
                    {interview.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {interview?.candidate_name || evaluation?.candidate_name || "Candidate"} • {interview?.job_title || evaluation?.job_title || "Position"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {interviewId && (
              <Link
                href={`/evaluations/${interviewId}`}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
              >
                <span>Full Scorecard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <span>Fetching screening conversation responses...</span>
            </div>
          ) : errorMessage ? (
            <div className="p-8 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="text-xs text-slate-300">{errorMessage}</p>
            </div>
          ) : (
            <>
              {/* Executive Telemetry Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Overall Score</span>
                  <div className="text-lg font-bold text-white">
                    {evaluation?.overall_score ? `${evaluation.overall_score}/100` : "Pending"}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Recommendation</span>
                  <div className="text-xs font-bold text-indigo-300">
                    {evaluation?.recommendation?.replace("_", " ") || "In Progress"}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Speech Duration</span>
                  <div className="text-lg font-bold text-white">
                    {formatDuration(interview?.user_speech_duration || 0)}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Duration</span>
                  <div className="text-lg font-bold text-white">
                    {formatDuration(interview?.duration_seconds || 0)}
                  </div>
                </div>
              </div>

              {/* Itemized Question-by-Question Q&A */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Captured Answers & Assessment Signals</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {evaluation?.question_evaluations?.length || 0} Questions Evaluated
                  </span>
                </div>

                {evaluation?.question_evaluations && evaluation.question_evaluations.length > 0 ? (
                  <div className="space-y-3">
                    {evaluation.question_evaluations.map((item, idx) => {
                      const isSkipped = item.is_skipped || item.score === 0 || item.status === "SKIPPED" || item.answer?.toLowerCase().includes("skipped");

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border space-y-2.5 transition-colors ${
                            isSkipped ? "bg-slate-900/40 border-amber-500/20" : "bg-slate-900/80 border-slate-800"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-xs font-bold text-slate-200">
                              Q{idx + 1}: {item.question}
                            </span>
                            {isSkipped ? (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold shrink-0">
                                Skipped (0/10)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono text-[11px] font-bold shrink-0">
                                {item.score}/10
                              </span>
                            )}
                          </div>

                          <div className={`p-3 rounded-xl border text-xs leading-relaxed font-mono ${
                            isSkipped ? "bg-slate-950/40 text-slate-400 border-amber-500/20 italic" : "bg-slate-950/70 text-slate-300 border-slate-800/80"
                          }`}>
                            <span className={`font-semibold block mb-1 ${isSkipped ? "text-amber-400" : "text-indigo-400"}`}>
                              {isSkipped ? "Status:" : "Answer Captured:"}
                            </span>
                            {item.answer}
                          </div>

                          {item.feedback && (
                            <p className={`text-[11px] italic ${isSkipped ? "text-amber-400/80" : "text-slate-400"}`}>
                              Assessment signal: {item.feedback}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
                    No itemized responses recorded for this screening session.
                  </div>
                )}
              </div>

              {/* Call Audio Recording */}
              {(evaluation?.recording_url || interview?.recording_url) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Call Audio Recording</span>
                  </h4>
                  <AudioPlayer
                    recordingUrl={evaluation?.recording_url || interview?.recording_url}
                    candidateName={evaluation?.candidate_name || interview?.candidate_name}
                  />
                </div>
              )}

              {/* Conversation Transcript */}
              {(evaluation?.transcript || interview?.transcript) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Raw Conversation Transcript</span>
                  </h4>
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                    {evaluation?.transcript || interview?.transcript}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Screened via Hunar.AI Voice AI Engine
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Close
            </button>
            {interviewId && (
              <Link
                href={`/evaluations/${interviewId}`}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-colors"
              >
                Open Full Evaluation
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
