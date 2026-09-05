"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  PhoneCall,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  PhoneForwarded,
  ShieldCheck,
  Radio,
  Loader2
} from "lucide-react";
import { api } from "../lib/api";
import { Candidate, Job } from "../lib/types";

interface VoiceScreeningModalProps {
  candidate: Candidate;
  job?: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (interviewId: string) => void;
}

export default function VoiceScreeningModal({
  candidate,
  job,
  isOpen,
  onClose,
  onSuccess,
}: VoiceScreeningModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"PHONE" | "SIMULATOR">("PHONE");
  const [phone, setPhone] = useState(candidate.phone || "+919876543210");
  const [callerNumbers, setCallerNumbers] = useState<any[]>([]);
  const [selectedCallerNumber, setSelectedCallerNumber] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPhone(candidate.phone || "+919876543210");
      setErrorMessage(null);
      api.getCallerNumbers()
        .then((nums) => {
          setCallerNumbers(nums);
          if (nums.length > 0) {
            setSelectedCallerNumber(nums[0].phone_number);
          }
        })
        .catch(() => setCallerNumbers([]));
    }
  }, [isOpen, candidate]);

  if (!isOpen) return null;

  const handleLaunch = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // If phone was edited, update candidate phone first
      if (phone !== candidate.phone) {
        await api.updateCandidate(candidate.id, { phone });
      }

      const res = await api.launchInterview({
        candidate_id: candidate.id,
        mode: mode,
        from_phone_number: mode === "PHONE" && selectedCallerNumber ? selectedCallerNumber : undefined,
      });

      if (onSuccess) {
        onSuccess(res.id);
      }
      onClose();
      router.push(`/interviews/${res.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate screening session.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel bg-slate-900 border border-slate-700/80 shadow-2xl p-6 overflow-hidden">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Launch AI Voice Screening
            </h3>
            <p className="text-xs text-slate-400">
              Candidate: <strong className="text-slate-200">{candidate.name}</strong> • Role:{" "}
              <strong className="text-slate-200">{job?.title || candidate.job_title}</strong>
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => setMode("PHONE")}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              mode === "PHONE"
                ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-800/50 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Radio className={`w-4 h-4 ${mode === "PHONE" ? "text-indigo-400" : "text-slate-500"}`} />
              <span className="font-semibold text-sm">Hunar Phone Call</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Triggers live outbound call via Hunar.AI telephony agent to candidate&apos;s phone.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMode("SIMULATOR")}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              mode === "SIMULATOR"
                ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-800/50 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Laptop className={`w-4 h-4 ${mode === "SIMULATOR" ? "text-cyan-400" : "text-slate-500"}`} />
              <span className="font-semibold text-sm">Web Simulator</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Interactive in-browser screening session for recruiter preview and testing.
            </p>
          </button>
        </div>

        {/* Form fields */}
        {mode === "PHONE" ? (
          <div className="space-y-4 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Candidate Phone Number (E.164 format)
              </label>
              <div className="relative">
                <input
                  suppressHydrationWarning
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-mono text-white placeholder-slate-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                E.164 with country code (e.g., +91 for India, +1 for US/Canada).
              </p>
            </div>

            {callerNumbers.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Caller ID (From Phone Number)
                </label>
                <select
                  value={selectedCallerNumber}
                  onChange={(e) => setSelectedCallerNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                >
                  {callerNumbers.map((num) => (
                    <option key={num.id} value={num.phone_number} className="bg-slate-900 text-white">
                      {num.phone_number} ({num.country_code} • {num.provider}) {num.is_default ? "— Default" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                The AI voice agent will conduct a structured first-round screening, asking the job&apos;s configured questions, recording the response, and creating a scorecard.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 mb-5 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Interactive Screening Tester</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Launches an interactive voice session in the browser console. You can speak into your microphone or choose candidate answers, and the system will generate the complete evaluation scorecard and audio waveform.
            </p>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleLaunch}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Initiating Screening...</span>
              </>
            ) : (
              <>
                <PhoneForwarded className="w-4 h-4" />
                <span>{mode === "PHONE" ? "Place Phone Call" : "Start Simulator"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
