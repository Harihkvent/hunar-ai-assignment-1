"use client";

import React from "react";
import { CheckCircle, AlertTriangle, Award, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { Evaluation } from "../lib/types";
import { getScoreBadgeColor } from "../lib/utils";

interface ScoreMetersProps {
  evaluation: Evaluation;
}

export default function ScoreMeters({ evaluation }: ScoreMetersProps) {
  const getRecommendationDetails = (rec: string) => {
    switch (rec) {
      case "STRONG_HIRE":
        return {
          label: "Strong Hire",
          color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          icon: Award,
          desc: "Exceeds key technical criteria & communication standards",
        };
      case "SHORTLIST":
        return {
          label: "Shortlist",
          color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
          icon: CheckCircle,
          desc: "Meets role requirements for the next interview round",
        };
      case "NEEDS_REVIEW":
        return {
          label: "Needs Review",
          color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          icon: AlertTriangle,
          desc: "Borderline qualification signals; recruiter review needed",
        };
      case "REJECT":
      default:
        return {
          label: "Reject",
          color: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          icon: ShieldAlert,
          desc: "Did not meet core screening prerequisites",
        };
    }
  };

  const recInfo = getRecommendationDetails(evaluation.recommendation);
  const RecIcon = recInfo.icon;

  const categories = [
    { label: "Technical Competence", score: evaluation.technical_score, color: "from-indigo-500 to-indigo-400" },
    { label: "Communication & Clarity", score: evaluation.communication_score, color: "from-cyan-500 to-cyan-400" },
    { label: "Problem Solving", score: evaluation.problem_solving_score, color: "from-purple-500 to-purple-400" },
    { label: "Relevant Experience Match", score: evaluation.experience_score, color: "from-emerald-500 to-emerald-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Score Summary Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Overall score dial */}
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 rounded-2xl bg-slate-950 border border-indigo-500/30 flex flex-col items-center justify-center shadow-lg shadow-indigo-500/10">
              <span className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">
                {evaluation.overall_score}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                Out of 100
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  AI Recommendation
                </span>
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-bold ${recInfo.color}`}>
                <RecIcon className="w-4 h-4" />
                <span>{recInfo.label}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 max-w-sm">
                {recInfo.desc}
              </p>
            </div>
          </div>

          {/* Recruiter decision badge */}
          <div className="w-full sm:w-auto p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <span className="text-slate-400 block mb-1">Recruiter Pipeline Status:</span>
            <span className="font-bold text-slate-200 capitalize text-sm">
              {evaluation.recruiter_status.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Category Score Bars */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <span>Dimension Breakdown</span>
        </h4>

        <div className="space-y-4">
          {categories.map((cat, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">{cat.label}</span>
                <span className="font-mono text-slate-200 font-bold">{cat.score}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${cat.color} transition-all duration-700`}
                  style={{ width: `${Math.max(5, cat.score)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Concerns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Key Strengths & Matches</span>
          </h4>
          <ul className="space-y-2">
            {evaluation.strengths && evaluation.strengths.length > 0 ? (
              evaluation.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500">No key strengths highlighted.</li>
            )}
          </ul>
        </div>

        {/* Concerns / Gaps */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Areas of Concern / Follow-up</span>
          </h4>
          <ul className="space-y-2">
            {evaluation.concerns && evaluation.concerns.length > 0 ? (
              evaluation.concerns.map((con, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{con}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-400">No major disqualifying concerns identified.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
