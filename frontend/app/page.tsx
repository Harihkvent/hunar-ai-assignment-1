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
import { api } from "../lib/api";
import { DashboardStats, Job } from "../lib/types";
import { formatDate, formatDuration, getScoreBadgeColor, getStatusBadgeColor } from "../lib/utils";
import QuickScreeningAnswersModal from "../components/QuickScreeningAnswersModal";

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
      label: "Open Roles",
      icon: Briefcase,
      href: "/jobs",
    },
    {
      title: "Candidates Screened",
      value: stats?.screened_candidates ?? 0,
      label: "Total Applicants",
      icon: Users,
      href: "/candidates",
    },
    {
      title: "Completed Screenings",
      value: stats?.completed_interviews ?? 0,
      label: "AI Voice Calls",
      icon: PhoneCall,
      href: "/interviews",
    },
    {
      title: "Shortlist Conversion",
      value: stats?.screened_candidates
        ? `${Math.round(((stats.shortlisted_candidates || 0) / stats.screened_candidates) * 100)}%`
        : "0%",
      label: `${stats?.shortlisted_candidates || 0} Shortlisted`,
      icon: Award,
      href: "/candidates?status=SHORTLISTED",
    },
    {
      title: "Average Score",
      value: stats?.average_score ? `${stats.average_score}/100` : "—",
      label: "Across evaluations",
      icon: TrendingUp,
      href: "/interviews",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-indigo-400 font-mono">Recruiter Command Center</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            AI Voice Screening & Evaluation
          </h1>
          <p className="text-xs text-zinc-400">
            Automated technical screening, telephony voice interviews, and multi-dimensional candidate scorecards.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/jobs/new"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/50 transition-colors shadow-xs"
          >
            <span>Create Job</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/candidates"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
          >
            <span>View Candidates</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              href={stat.href}
              className="p-4 rounded-xl glass-panel glass-panel-hover flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-zinc-400">{stat.title}</span>
                <Icon className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  {stat.label}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Interviews */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Recent Voice Screenings
              </h2>
            </div>
            <Link
              href="/interviews"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="glass-panel rounded-xl overflow-hidden">
            {stats?.recent_interviews && stats.recent_interviews.length > 0 ? (
              <div className="divide-y divide-white/[0.05]">
                {stats.recent_interviews.map((intItem) => (
                  <div
                    key={intItem.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">
                          {intItem.candidate_name || "Applicant"}
                        </span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getStatusBadgeColor(intItem.status)}`}>
                          {intItem.status.replace("_", " ")}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-zinc-400">
                          {intItem.mode}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Role: <strong className="text-zinc-300 font-medium">{intItem.job_title || "General Role"}</strong> •{" "}
                        {formatDate(intItem.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right hidden sm:block mr-1">
                        <span className="text-xs font-mono text-zinc-300 block">
                          {formatDuration(intItem.duration_seconds)}
                        </span>
                        <span className="text-[10px] text-zinc-400">Duration</span>
                      </div>

                      {/* Instant Answers & Telemetry Preview */}
                      <button
                        type="button"
                        onClick={() => setPreviewInterviewId(intItem.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1.2 rounded-md text-xs font-medium text-zinc-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white transition-colors"
                        title="View extracted conversation responses"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="hidden sm:inline">Responses</span>
                      </button>

                      {intItem.has_evaluation ? (
                        <Link
                          href={`/evaluations/${intItem.id}`}
                          className="flex items-center gap-1.5 px-2.5 py-1.2 rounded-md text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Scorecard</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/interviews/${intItem.id}`}
                          className="flex items-center gap-1.5 px-2.5 py-1.2 rounded-md text-xs font-medium text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
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
              <div className="p-8 text-center text-zinc-400 text-xs">
                No recent voice screening sessions recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Active Job Pipeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Active Job Pipeline
              </h2>
            </div>
            <Link
              href="/jobs"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Manage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="glass-panel rounded-xl p-3.5 space-y-2.5">
            {jobs.slice(0, 4).map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                    {job.title}
                  </h4>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {job.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>{job.department}</span>
                  <span>{job.candidate_count || 0} Candidates</span>
                </div>
              </Link>
            ))}

            <Link
              href="/jobs/new"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-white/[0.1] text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:border-white/[0.2] hover:bg-white/[0.02] transition-all"
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
