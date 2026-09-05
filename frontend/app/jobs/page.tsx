"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Search,
  Users,
  PhoneCall,
  ChevronRight,
  Sparkles,
  Filter,
  CheckCircle,
  Radio,
  Trash2,
  RefreshCw
} from "lucide-react";
import { api } from "../../lib/api";
import { Job } from "../../lib/types";
import { formatDate, getStatusBadgeColor } from "../../lib/utils";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = () => {
    setIsLoading(true);
    api.getJobs()
      .then(setJobs)
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this job and associated candidate records?")) {
      try {
        await api.deleteJob(id);
        fetchJobs();
      } catch (err) {
        alert("Failed to delete job.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            <span>Job Positions & Screening Agents</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage open hiring roles and configured Hunar.AI voice agent screening flows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/jobs/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Job</span>
          </Link>
        </div>
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
            placeholder="Search by job title, department, or required skills..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "ACTIVE", "PAUSED", "CLOSED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? "bg-indigo-600/20 border border-indigo-500/40 text-indigo-300"
                  : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredJobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="glass-panel p-5 rounded-2xl border border-slate-800 glass-panel-hover flex flex-col justify-between group"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block">
                    {job.department}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors mt-0.5">
                    {job.title}
                  </h3>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeColor(job.status)}`}>
                  {job.status}
                </span>
              </div>

              {/* Description preview */}
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {job.description}
              </p>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5">
                {job.required_skills?.slice(0, 3).map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
                  >
                    {skill}
                  </span>
                ))}
                {job.required_skills && job.required_skills.length > 3 && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-800/40 text-slate-500">
                    +{job.required_skills.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Meta & Hunar Agent status */}
            <div className="pt-4 mt-4 border-t border-slate-800/70 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>{job.candidate_count || 0} Candidates</span>
                </div>
                <div className="flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                  <span>{job.interview_count || 0} Screened</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>Agent: {job.persona_name || "Aria"}</span>
                  {job.hunar_agent_code && (
                    <span className="font-mono text-indigo-400">({job.hunar_agent_code})</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDelete(job.id, e)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Job"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </div>
          </Link>
        ))}

        {filteredJobs.length === 0 && !isLoading && (
          <div className="col-span-full p-12 text-center glass-panel rounded-2xl border border-slate-800">
            <p className="text-sm text-slate-400 mb-3">No matching hiring jobs found.</p>
            <Link
              href="/jobs/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Job</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
