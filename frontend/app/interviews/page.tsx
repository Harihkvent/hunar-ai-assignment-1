"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  PhoneCall,
  Search,
  Filter,
  FileText,
  Play,
  CheckCircle,
  Radio,
  Clock,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { api } from "../../lib/api";
import { Interview } from "../../lib/types";
import { formatDate, formatDuration, getStatusBadgeColor } from "../../lib/utils";

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    setIsLoading(true);
    api.getInterviews()
      .then(setInterviews)
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredInterviews = interviews.filter((i) => {
    const matchesSearch =
      (i.candidate_name && i.candidate_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.job_title && i.job_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      i.request_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <PhoneCall className="w-6 h-6 text-indigo-400" />
            <span>AI Voice Screening Console</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time monitor for active Hunar telephony calls, audio recordings, and evaluation scorecards.
          </p>
        </div>

        <Link
          href="/candidates"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <span>Select Candidate to Screen</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            suppressHydrationWarning
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by candidate name, role, request ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "COMPLETED", "IN_PROGRESS", "INITIATED", "FAILED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? "bg-indigo-600/20 border border-indigo-500/40 text-indigo-300"
                  : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Interviews Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {filteredInterviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Candidate & Role</th>
                  <th className="px-5 py-3 font-semibold">Call Mode</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Duration</th>
                  <th className="px-5 py-3 font-semibold">Screening Date</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInterviews.map((intItem) => (
                  <tr key={intItem.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-5 py-4">
                      <Link
                        href={`/interviews/${intItem.id}`}
                        className="font-bold text-slate-100 hover:text-indigo-300 block"
                      >
                        {intItem.candidate_name || "Candidate"}
                      </Link>
                      <span className="text-[11px] text-slate-400">
                        {intItem.job_title || "Position"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px]">
                        {intItem.mode === "PHONE" ? <PhoneCall className="w-3 h-3 text-indigo-400" /> : <Radio className="w-3 h-3 text-cyan-400" />}
                        <span>{intItem.mode}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${getStatusBadgeColor(intItem.status)}`}>
                        {intItem.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-300">
                      {formatDuration(intItem.duration_seconds)}
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {formatDate(intItem.created_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
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
                            <span>Live Console</span>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            No voice screening sessions found.
          </div>
        )}
      </div>
    </div>
  );
}
