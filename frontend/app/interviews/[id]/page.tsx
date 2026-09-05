"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PhoneCall,
  ArrowLeft,
  FileText,
  Clock,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  Radio,
  ExternalLink,
  Volume2
} from "lucide-react";
import { api } from "../../../lib/api";
import { Interview, Job, Candidate } from "../../../lib/types";
import { formatDate, formatDuration, getStatusBadgeColor } from "../../../lib/utils";
import AudioPlayer from "../../../components/AudioPlayer";
import SimulatorScreeningRunner from "../../../components/SimulatorScreeningRunner";

export default function InterviewConsolePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const interviewId = resolvedParams.id;
  const router = useRouter();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const intData = await api.getInterview(interviewId);
      setInterview(intData);

      const [c, j] = await Promise.all([
        api.getCandidate(intData.candidate_id).catch(() => null),
        api.getJob(intData.job_id).catch(() => null),
      ]);
      setCandidate(c);
      setJob(j);
    } catch (err) {
      console.error("Failed to load interview console:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [interviewId]);

  // Live polling for PHONE mode if call is active
  useEffect(() => {
    if (!interview) return;
    const isTerminal = ["COMPLETED", "FAILED", "CANCELLED", "NOT_CONNECTED"].includes(interview.status);

    if (interview.mode === "PHONE" && !isTerminal) {
      const pollTimer = setInterval(() => {
        api.getInterview(interviewId)
          .then((updated) => {
            setInterview(updated);
            if (updated.status === "COMPLETED" && updated.has_evaluation) {
              clearInterval(pollTimer);
            }
          })
          .catch((err) => console.error("Poll error:", err));
      }, 3500);

      return () => clearInterval(pollTimer);
    }
  }, [interview?.status, interview?.mode, interviewId]);

  if (isLoading) {
    return <div className="p-12 text-center text-slate-400">Loading screening console...</div>;
  }

  if (!interview) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-slate-300">Screening session not found.</p>
        <Link href="/interviews" className="text-indigo-400 hover:underline text-xs">
          Return to Interviews
        </Link>
      </div>
    );
  }

  const isTerminal = ["COMPLETED", "FAILED", "CANCELLED", "NOT_CONNECTED"].includes(interview.status);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/interviews"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeColor(interview.status)}`}>
                {interview.status.replace("_", " ")}
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {interview.mode} Mode
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
              Screening Session: {interview.candidate_name || candidate?.name || "Applicant"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh Status</span>
          </button>

          {interview.has_evaluation && (
            <Link
              href={`/evaluations/${interview.id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/30 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>View Scorecard</span>
            </Link>
          )}
        </div>
      </div>

      {/* Simulator Mode Runner */}
      {interview.mode === "SIMULATOR" && !isTerminal ? (
        <SimulatorScreeningRunner
          interview={interview}
          job={job}
          candidate={candidate}
          onCompleted={() => loadData()}
        />
      ) : (
        /* Phone Mode Telemetry & Status Tracker */
        <div className="space-y-6">
          {/* Status Tracker Banner */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${
                    interview.status === "COMPLETED"
                      ? "bg-emerald-600 shadow-lg shadow-emerald-500/20"
                      : interview.status === "FAILED"
                      ? "bg-rose-600"
                      : "bg-indigo-600 animate-pulse shadow-lg shadow-indigo-500/30"
                  }`}>
                    <PhoneCall className="w-7 h-7" />
                  </div>
                  {!isTerminal && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    {interview.status === "COMPLETED"
                      ? "Screening Call Successfully Completed"
                      : interview.status === "IN_PROGRESS"
                      ? "Call Currently in Progress with Candidate"
                      : interview.status === "RINGING"
                      ? "Telephony Calling & Ringing..."
                      : interview.status === "FAILED"
                      ? "Call Failed or Unreachable"
                      : "Call Initiated via Hunar.AI Telephony"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Target Phone: <strong className="font-mono text-slate-200">{interview.candidate_phone || candidate?.phone}</strong> •{" "}
                    Request ID: <span className="font-mono text-indigo-400">{interview.request_id}</span>
                  </p>
                </div>
              </div>

              {interview.status === "COMPLETED" && (
                <Link
                  href={`/evaluations/${interview.id}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Open Candidate Scorecard</span>
                </Link>
              )}
            </div>

            {/* Stepper */}
            <div className="grid grid-cols-4 gap-2 pt-6 mt-6 border-t border-slate-800/80">
              {[
                { label: "Initiated", active: true },
                { label: "Ringing / Connected", active: ["RINGING", "IN_PROGRESS", "COMPLETED"].includes(interview.status) },
                { label: "Voice Screening", active: ["IN_PROGRESS", "COMPLETED"].includes(interview.status) },
                { label: "Evaluation Scorecard", active: interview.status === "COMPLETED" },
              ].map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${
                    step.active ? "bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "bg-slate-800"
                  }`} />
                  <span className={`text-[11px] font-medium block ${step.active ? "text-slate-200" : "text-slate-600"}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2-Column Audio Player & Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Audio Player */}
              <AudioPlayer
                recordingUrl={interview.recording_url}
                candidateName={candidate?.name}
                durationSeconds={interview.duration_seconds}
              />

              {/* Transcript Preview */}
              {interview.transcript && (
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Conversation Transcript</span>
                  </h4>
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed max-h-80 overflow-y-auto">
                    {interview.transcript}
                  </div>
                </div>
              )}
            </div>

            {/* Right Telemetry Details */}
            <div className="space-y-6">
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                  Call Telemetry Signals
                </h4>

                <div className="divide-y divide-slate-800/80 space-y-2">
                  <div className="flex justify-between text-slate-400 pt-2">
                    <span>Call Duration:</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {formatDuration(interview.duration_seconds)} ({interview.duration_minutes} min)
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400 pt-2">
                    <span>Candidate Speech Duration:</span>
                    <span className="font-mono text-slate-200">
                      {interview.user_speech_duration ? `${interview.user_speech_duration}s` : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400 pt-2">
                    <span>Answered By:</span>
                    <span className="text-slate-200 capitalize">
                      {interview.answered_by || "Human"}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400 pt-2">
                    <span>Call Ended By:</span>
                    <span className="text-slate-200 capitalize">
                      {interview.call_ended_by || "Agent"}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400 pt-2">
                    <span>Engagement Signal:</span>
                    <span className="font-semibold text-emerald-400">
                      {interview.engagement_status || "ENGAGED"}
                    </span>
                  </div>

                  {interview.hunar_call_id && (
                    <div className="flex justify-between text-slate-400 pt-2">
                      <span>Hunar Call UUID:</span>
                      <span className="font-mono text-[10px] text-indigo-400 truncate max-w-[140px]">
                        {interview.hunar_call_id}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {interview.error_message && (
                <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Telephony Error</span>
                    <span>{interview.error_message}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
