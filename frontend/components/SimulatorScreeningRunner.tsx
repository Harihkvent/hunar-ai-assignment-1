"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Bot,
  User,
  Loader2
} from "lucide-react";
import { api } from "../lib/api";
import { Interview, Job, Candidate } from "../lib/types";

interface SimulatorScreeningRunnerProps {
  interview: Interview;
  job?: Job | null;
  candidate?: Candidate | null;
  onCompleted?: () => void;
}

export default function SimulatorScreeningRunner({
  interview,
  job,
  candidate,
  onCompleted,
}: SimulatorScreeningRunnerProps) {
  const router = useRouter();
  const questions = job?.interview_questions && job.interview_questions.length > 0
    ? job.interview_questions
    : [
        "Can you briefly introduce yourself and your relevant technical experience?",
        "What has been one of your most challenging technical projects recently?",
        "What is your expected CTC and notice period?"
      ];

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [conversationHistory, setConversationHistory] = useState<
    { sender: "AI" | "Candidate"; text: string }[]
  >([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory]);

  // Elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Speak AI introduction and first question on mount
  useEffect(() => {
    const introText = `Hello ${candidate?.name || "Candidate"}! I am ${job?.persona_name || "Aria"}, your AI recruiter for the ${job?.title || "role"} position. Let's begin our screening interview.`;
    const firstQ = questions[0];

    setConversationHistory([
      { sender: "AI", text: introText },
      { sender: "AI", text: firstQ },
    ]);

    speakText(`${introText} ${firstQ}`);
  }, []);

  const speakText = (text: string) => {
    if (isAudioMuted || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSkipQuestion = () => {
    const currentQKey = `question_${currentStep + 1}_answer`;
    const updatedAnswers = { ...answers, [currentQKey]: "[SKIPPED]" };
    setAnswers(updatedAnswers);

    const newHistory = [
      ...conversationHistory,
      { sender: "Candidate" as const, text: "(Skipped question)" },
    ];

    if (currentStep < questions.length - 1) {
      const nextStep = currentStep + 1;
      const nextQ = questions[nextStep];
      setCurrentStep(nextStep);
      setCurrentAnswer("");

      newHistory.push({ sender: "AI", text: nextQ });
      setConversationHistory(newHistory);
      speakText(nextQ);
    } else {
      // Completed all questions
      const conclusion = "Thank you so much for your answers! Our hiring team will evaluate your responses.";
      newHistory.push({ sender: "AI", text: conclusion });
      setConversationHistory(newHistory);
      speakText(conclusion);
      setCurrentAnswer("");
      submitFinalScreening(newHistory, updatedAnswers);
    }
  };

  const handleNextQuestion = () => {
    if (!currentAnswer.trim()) return;

    const currentQKey = `question_${currentStep + 1}_answer`;
    const updatedAnswers = { ...answers, [currentQKey]: currentAnswer };
    setAnswers(updatedAnswers);

    const newHistory = [
      ...conversationHistory,
      { sender: "Candidate" as const, text: currentAnswer },
    ];

    if (currentStep < questions.length - 1) {
      const nextStep = currentStep + 1;
      const nextQ = questions[nextStep];
      setCurrentStep(nextStep);
      setCurrentAnswer("");

      newHistory.push({ sender: "AI", text: nextQ });
      setConversationHistory(newHistory);
      speakText(nextQ);
    } else {
      // Completed all questions
      const conclusion = "Thank you so much for your answers! Our hiring team will evaluate your responses.";
      newHistory.push({ sender: "AI", text: conclusion });
      setConversationHistory(newHistory);
      speakText(conclusion);
      setCurrentAnswer("");
      submitFinalScreening(newHistory, updatedAnswers);
    }
  };

  const submitFinalScreening = async (
    history: { sender: "AI" | "Candidate"; text: string }[],
    finalAnswers: Record<string, string>
  ) => {
    setIsSubmitting(true);
    try {
      const fullTranscript = history
        .map((m) => `${m.sender}: ${m.text}`)
        .join("\n");

      await api.completeSimulatedInterview(interview.id, {
        transcript: fullTranscript,
        answers: finalAnswers,
        duration_seconds: Math.max(90, elapsedSeconds),
        user_speech_duration: Math.max(45, Math.floor(elapsedSeconds * 0.55)),
        summary: `${candidate?.name || "Candidate"} completed the live screening session for ${job?.title || "the position"}.`,
        suitability_score: "8.8/10",
        overall_recommendation: "SHORTLIST",
      });

      if (onCompleted) {
        onCompleted();
      }
      router.push(`/evaluations/${interview.id}`);
    } catch (err) {
      console.error("Failed to complete interview:", err);
      setIsSubmitting(false);
    }
  };

  const sampleQuickAnswers = [
    "I have 5 years of hands-on experience building scalable applications with React, Next.js, and FastAPI.",
    "In my recent project, we designed high-concurrency microservices handling 10k requests per minute with Redis caching.",
    "My expected CTC is 30 LPA and I have a 30-day notice period.",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Interactive Conversation Stream */}
      <div className="lg:col-span-2 space-y-4">
        <div className="glass-panel rounded-2xl border border-slate-800 p-5 flex flex-col h-[520px]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">
                  {job?.persona_name || "Aria"} (AI Voice Screening Agent)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Question {currentStep + 1} of {questions.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                title={isAudioMuted ? "Unmute Voice" : "Mute Voice"}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <div className="px-2.5 py-1 rounded-md bg-slate-800 text-xs font-mono text-slate-300">
                {Math.floor(elapsedSeconds / 60)}:
                {elapsedSeconds % 60 < 10 ? "0" : ""}
                {elapsedSeconds % 60}
              </div>
            </div>
          </div>

          {/* Conversation history */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {conversationHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2.5 ${
                  msg.sender === "Candidate" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    msg.sender === "AI"
                      ? "bg-indigo-600 text-white"
                      : "bg-cyan-600 text-white"
                  }`}
                >
                  {msg.sender === "AI" ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "AI"
                      ? "bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-sm"
                      : "bg-indigo-600/30 text-slate-100 border border-indigo-500/40 rounded-tr-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Bar */}
          <div className="pt-3 border-t border-slate-800 mt-2">
            <div className="flex gap-2">
              <input
                suppressHydrationWarning
                type="text"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleNextQuestion();
                  }
                }}
                disabled={isSubmitting}
                placeholder="Type or speak candidate response..."
                className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
              />
              <button
                type="button"
                onClick={handleSkipQuestion}
                disabled={isSubmitting}
                className="px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-amber-300 hover:bg-slate-800 border border-slate-700 transition-colors disabled:opacity-40"
                title="Skip this question"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleNextQuestion}
                disabled={!currentAnswer.trim() || isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : currentStep === questions.length - 1 ? (
                  <>
                    <span>Finish</span>
                    <CheckCircle className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Answer Suggestion Chips */}
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] text-slate-400 self-center mr-1">Quick responses:</span>
          {sampleQuickAnswers.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentAnswer(sample)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition-colors text-left"
            >
              &quot;{sample.slice(0, 45)}...&quot;
            </button>
          ))}
        </div>
      </div>

      {/* Right Col: Screening Overview & Telemetry */}
      <div className="space-y-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Interview Questions
          </h4>
          <div className="space-y-2.5">
            {questions.map((q, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border text-xs transition-all ${
                  i === currentStep
                    ? "bg-indigo-600/15 border-indigo-500 text-slate-200 shadow-sm"
                    : i < currentStep
                    ? "bg-slate-900/60 border-slate-800 text-emerald-400"
                    : "bg-slate-900/30 border-slate-800/50 text-slate-500"
                }`}
              >
                <div className="flex items-center justify-between mb-1 font-semibold">
                  <span>Question {i + 1}</span>
                  {i < currentStep && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                  {i === currentStep && <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />}
                </div>
                <p className="text-[11px] text-slate-300">{q}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-300 space-y-1.5">
          <div className="font-semibold text-indigo-300">Live Post-Interview Evaluator</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            When all questions are answered, the response signals will be processed by the structured evaluation engine to extract technical competency, communication ratings, strengths, and risks.
          </p>
        </div>
      </div>
    </div>
  );
}
