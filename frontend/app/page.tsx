"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  PhoneCall,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight,
  Play,
  FileText,
  AlertCircle,
  MessageSquare,
  UserSearch
} from "lucide-react";
import { api } from "@/lib/api";
import { DashboardStats, Job } from "@/lib/types";
import { formatDate, formatDuration, getScoreBadgeColor, getStatusBadgeColor } from "@/lib/utils";
import QuickScreeningAnswersModal from "@/components/QuickScreeningAnswersModal";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewInterviewId, setPreviewInterviewId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getDashboardStats(), api.getJobs()])
      .then(([s, j]) => {
        setStats(s);
        setJobs(j);
      })
      .catch((err) => console.error("Failed to load dashboard data:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const statCards = [
    {
      title: "Active Jobs",
      value: stats?.active_jobs ?? 0,
      total: stats?.total_jobs,
      label: "Open Roles",
      icon: Briefcase,
      color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400",
      href: "/jobs",
    },
    {
      title: "Candidates Screened",
      value: stats?.screened_candidates ?? 0,
      total: stats?.total_candidates,
      label: "Total Applicants",
      icon: Users,
      color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400",
      href: "/candidates",
    },
    {
      title: "Completed Screenings",
      value: stats?.completed_interviews ?? 0,
      label: "AI Voice Calls",
      icon: PhoneCall,
      color: "from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-400",
      href: "/interviews",
    },
    {
      title: "Shortlist Conversion",
      value: stats?.screened_candidates
        ? `${Math.round(((stats.shortlisted_candidates || 0) / stats.screened_candidates) * 100)}%`
        : "0%",
      label: `${stats?.shortlisted_candidates || 0} Shortlisted`,
      icon: Award,
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
      href: "/candidates?status=SHORTLISTED",
    },
    {
      title: "Average Score",
      value: stats?.average_score ? `${stats.average_score}/100` : "—",
      label: "Across all evaluations",
      icon: TrendingUp,
      color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
      href: "/interviews",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl glass-panel bg-gradient-to-r from-slate-900/90 via-indigo-950/30 to-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Voice Recruitment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Recruiter Screening Command Center
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Configure positions, dispatch intelligent voice screening calls via Hunar.AI telephony, and review multi-dimensional scorecards in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <Link
            href="/jobs/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <span>Create New Job</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/candidates"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-colors"
          >
            <span>View Candidates</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              href={stat.href}
              className="glass-panel p-5 rounded-2xl border border-slate-800/80 glass-panel-hover group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">{stat.title}</span>
                <div className={`p-2 rounded-xl border bg-gradient-to-br ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                  {stat.value}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">
                  {stat.label}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Interviews */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Recent Voice Screenings
              </h2>
            </div>
            <Link
              href="/interviews"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            {stats?.recent_interviews && stats.recent_interviews.length > 0 ? (
              <div className="divide-y divide-slate-800/80">
                {stats.recent_interviews.map((intItem) => (
                  <div
                    key={intItem.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-sm text-slate-100">
                          {intItem.candidate_name || "Applicant"}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeColor(intItem.status)}`}>
                          {intItem.status.replace("_", " ")}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {intItem.mode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Role: <strong className="text-slate-300">{intItem.job_title || "General Role"}</strong> •{" "}
                        {formatDate(intItem.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right hidden sm:block mr-1">
                        <span className="text-xs font-mono text-slate-300 block">
                          {formatDuration(intItem.duration_seconds)}
                        </span>
                        <span className="text-[10px] text-slate-400">Duration</span>
                      </div>

                      {/* Instant Answers & Telemetry Preview */}
                      <button
                        type="button"
                        onClick={() => setPreviewInterviewId(intItem.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
                        title="View extracted conversation responses & itemized answers"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="hidden sm:inline">Responses</span>
                      </button>

                      {intItem.has_evaluation ? (
                        <Link
                          href={`/evaluations/${intItem.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 hover:bg-indigo-500/25 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Scorecard</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/interviews/${intItem.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Console</span>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">
                No recent voice screening sessions recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Active Job Pipeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Active Job Pipeline
              </h2>
            </div>
            <Link
              href="/jobs"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Manage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 p-4 space-y-3">
            {jobs.slice(0, 4).map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900 transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                    {job.title}
                  </h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {job.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{job.department}</span>
                  <span>{job.candidate_count || 0} Candidates</span>
                </div>
              </Link>
            ))}

            <Link
              href="/jobs/new"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-slate-700 text-xs font-semibold text-slate-400 hover:text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
            >
              <span>+ Add New Hiring Job</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Screening Answers & Telemetry Modal */}
      <QuickScreeningAnswersModal
        interviewId={previewInterviewId}
        isOpen={Boolean(previewInterviewId)}
        onClose={() => setPreviewInterviewId(null)}
      />
    </div>
  );
}
