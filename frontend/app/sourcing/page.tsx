"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserSearch,
  Search,
  Sparkles,
  Briefcase,
  Users,
  PhoneCall,
  ExternalLink,
  CheckCircle,
  Building,
  MapPin,
  Mail,
  Phone,
  Filter,
  Sliders,
  Play,
  RotateCcw,
  Loader2,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  Plus
} from "lucide-react";
import { api } from "@/lib/api";
import { Job, SourcedCandidate, SourcingProviderInfo, PeopleSearchResponse } from "@/lib/types";

export default function PeopleSearchSourcingPage() {
  const router = useRouter();

  // Data states
  const [jobs, setJobs] = useState<Job[]>([]);
  const [providers, setProviders] = useState<SourcingProviderInfo[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("APOLLO");

  // Form states
  const [rawJd, setRawJd] = useState<string>("");
  const [title, setTitle] = useState<string>("Senior Backend Engineer");
  const [skillsInput, setSkillsInput] = useState<string>("FastAPI, PostgreSQL, Python, Redis, Docker");
  const [expMin, setExpMin] = useState<number>(3);
  const [expMax, setExpMax] = useState<number>(7);
  const [location, setLocation] = useState<string>("India / Remote");

  // Results & UI states
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResponse, setSearchResponse] = useState<PeopleSearchResponse | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [importingId, setImportingId] = useState<string | null>(null);
  const [reachoutSuccessId, setReachoutSuccessId] = useState<string | null>(null);
  const [reachoutStatusMessage, setReachoutStatusMessage] = useState<string | null>(null);

  // Load jobs and providers
  useEffect(() => {
    Promise.all([
      api.getJobs({ status: "ACTIVE" }).catch(() => []),
      api.getSourcingProviders().catch(() => []),
    ]).then(([jList, pList]) => {
      setJobs(jList);
      setProviders(pList);
      if (jList.length > 0) {
        handleSelectJob(jList[0].id, jList);
      } else {
        triggerSearch();
      }
    });
  }, []);

  const handleSelectJob = (jobId: string, jobList: Job[] = jobs) => {
    setSelectedJobId(jobId);
    const targetJob = jobList.find((j) => j.id === jobId);
    if (targetJob) {
      setTitle(targetJob.title);
      setSkillsInput((targetJob.required_skills || []).join(", "));
      setExpMin(targetJob.experience_min || 2);
      setExpMax(targetJob.experience_max || 6);
      setRawJd(targetJob.description || "");
      // Auto search
      executeSearch({
        job_id: targetJob.id,
        title: targetJob.title,
        skills: targetJob.required_skills,
        experience_min: targetJob.experience_min,
        experience_max: targetJob.experience_max,
        location: targetJob.location || "India",
        provider: selectedProvider,
      });
    }
  };

  const triggerSearch = () => {
    const skillsList = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    executeSearch({
      job_id: selectedJobId || undefined,
      job_description: rawJd || undefined,
      title: title || "Software Engineer",
      skills: skillsList,
      experience_min: expMin,
      experience_max: expMax,
      location: location,
      provider: selectedProvider,
    });
  };

  const executeSearch = async (params: any) => {
    setIsSearching(true);
    setSearchResponse(null);
    setSelectedCandidates(new Set());
    try {
      const res = await api.searchPeople(params);
      setSearchResponse(res);
    } catch (err: any) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImportAndReachout = async (candidate: SourcedCandidate, launchVoice: boolean) => {
    let targetJobId = selectedJobId;
    if (!targetJobId && jobs.length > 0) {
      targetJobId = jobs[0].id;
    }

    if (!targetJobId) {
      alert("Please select or create a Job first to import candidates into.");
      return;
    }

    setImportingId(candidate.id);
    setReachoutStatusMessage(null);

    try {
      const res = await api.importSourcedCandidate({
        job_id: targetJobId,
        candidate: candidate,
        launch_voice_reachout: launchVoice,
        reachout_mode: "PHONE",
      });

      setReachoutSuccessId(candidate.id);
      setReachoutStatusMessage(res.message);

      setTimeout(() => {
        setReachoutSuccessId(null);
      }, 5000);
    } catch (err: any) {
      alert(err.message || "Failed to import candidate.");
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Talent Sourcing & Candidate Discovery
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              Problem 2 Solution
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            People Search & Voice AI Reachout
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Match job descriptions against <strong>Apollo.IO</strong>, <strong>People Data Labs (PDL)</strong>, <strong>Proxycurl</strong>, or <strong>Coresignal</strong> candidate databases, then trigger automated <strong>Hunar Voice AI Reachout Calls</strong> with 1-click.
          </p>
        </div>

        {/* Provider Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 self-start lg:self-auto">
          {[
            { id: "APOLLO", label: "Apollo.IO", tag: "275M+" },
            { id: "PDL", label: "People Data Labs", tag: "3B+" },
            { id: "PROXYCURL", label: "Proxycurl", tag: "Live" },
            { id: "CORESIGNAL", label: "Coresignal", tag: "Rich" },
          ].map((prov) => (
            <button
              key={prov.id}
              onClick={() => {
                setSelectedProvider(prov.id);
                const skillsList = skillsInput
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                executeSearch({
                  job_id: selectedJobId || undefined,
                  job_description: rawJd || undefined,
                  title: title || "Software Engineer",
                  skills: skillsList,
                  experience_min: expMin,
                  experience_max: expMax,
                  location: location,
                  provider: prov.id,
                });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedProvider === prov.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <span>{prov.label}</span>
              <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                selectedProvider === prov.id ? "bg-indigo-800 text-indigo-200" : "bg-slate-800 text-slate-500"
              }`}>
                {prov.tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Sourcing Layout: Left Criteria, Right Sourced Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Sourcing Criteria & Job Description (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-400" />
                <span>Search Criteria from Job</span>
              </h3>
              <button
                onClick={triggerSearch}
                disabled={isSearching}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isSearching ? "animate-spin" : ""}`} />
                <span>Re-Search</span>
              </button>
            </div>

            {/* Existing Job Selector */}
            {jobs.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Existing Job Position
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => handleSelectJob(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
                >
                  <option value="">-- Custom Search from Scratch --</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.department})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Target Role Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Role Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
              />
            </div>

            {/* Target Skills */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Required / Matching Skills (comma-separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="e.g. FastAPI, PostgreSQL, Python, Docker"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
              />
            </div>

            {/* Experience Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Min Exp (Yrs)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={expMin}
                  onChange={(e) => setExpMin(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Max Exp (Yrs)
                </label>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={expMax}
                  onChange={(e) => setExpMax(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Location / Country
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. India / Remote"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white"
              />
            </div>

            {/* Raw Job Description Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Or Paste Full Job Description (AI auto-parsing)
              </label>
              <textarea
                rows={3}
                value={rawJd}
                onChange={(e) => setRawJd(e.target.value)}
                placeholder="Paste Job Description text to auto-extract role keywords and query filters..."
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500 leading-relaxed font-mono"
              />
            </div>

            {/* Submit Search Button */}
            <button
              type="button"
              onClick={triggerSearch}
              disabled={isSearching}
              className="w-full py-3 rounded-2xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching {selectedProvider} Database...</span>
                </>
              ) : (
                <>
                  <UserSearch className="w-4 h-4" />
                  <span>Search People on {selectedProvider}</span>
                </>
              )}
            </button>
          </div>

          {/* Provider API Info Box */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Multi-Source Talent API Engine</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Supports live connections to <strong>Apollo.IO</strong>, <strong>People Data Labs</strong>, <strong>Proxycurl</strong>, and <strong>Coresignal</strong>. When no external keys are set, queries run against verified sandbox databases with realistic profile contact telemetry.
            </p>
          </div>
        </div>

        {/* Right Column: Sourced Candidates Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    Sourced Candidates ({searchResponse?.results?.length || 0})
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Source: {searchResponse?.provider || selectedProvider}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {searchResponse?.provider_note || "Ready to search talent profiles."}
                </p>
              </div>
            </div>

            <Link
              href="/candidates"
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold self-start sm:self-auto"
            >
              <span>View Active Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Status banner on reachout */}
          {reachoutStatusMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{reachoutStatusMessage}</span>
            </div>
          )}

          {/* Candidates Grid */}
          {isSearching ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-slate-400">
                Querying {selectedProvider} People API & ranking candidates by skill match...
              </p>
            </div>
          ) : searchResponse?.results && searchResponse.results.length > 0 ? (
            <div className="space-y-4">
              {searchResponse.results.map((cand) => {
                const isImporting = importingId === cand.id;
                const isSuccess = reachoutSuccessId === cand.id;

                return (
                  <div
                    key={cand.id}
                    className="glass-panel p-5 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl space-y-4"
                  >
                    {/* Top Row: Name, Match Badge, Current Role */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="text-base font-bold text-white tracking-tight">
                            {cand.name}
                          </h4>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                            {cand.match_score}% Match
                          </span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            {cand.provider}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 font-medium mt-1 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{cand.current_title}</span>
                          <span className="text-slate-500">•</span>
                          <strong className="text-slate-200">{cand.current_company}</strong>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">{cand.experience_years} yrs exp</span>
                        </p>

                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{cand.location}</span>
                        </p>
                      </div>

                      {/* Contact Info Chips */}
                      <div className="flex flex-wrap items-center gap-2 self-start">
                        <div className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                          <Phone className="w-3 h-3 text-cyan-400" />
                          <span>{cand.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                          <Mail className="w-3 h-3 text-indigo-400" />
                          <span>{cand.email}</span>
                        </div>
                        {cand.linkedin_url && (
                          <a
                            href={cand.linkedin_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-blue-400 hover:text-blue-300 hover:bg-slate-800 transition-colors"
                            title="Open LinkedIn"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>


                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {cand.skills.map((sk, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-900 text-slate-300 border border-slate-800"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>

                    {/* Match Reasons */}
                    {cand.match_reasons && cand.match_reasons.length > 0 && (
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                        <span className="text-indigo-400 font-semibold block">AI Sourcing Fit Signals:</span>
                        <ul className="list-disc list-inside space-y-0.5">
                          {cand.match_reasons.map((mr, rIdx) => (
                            <li key={rIdx}>{mr}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-[11px] text-slate-500">
                        {isSuccess ? "Candidate imported and Voice AI call initiated!" : "1-Click automated screening reachout available"}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* 1-Click Import Only */}
                        <button
                          type="button"
                          onClick={() => handleImportAndReachout(cand, false)}
                          disabled={isImporting}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isImporting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                          <span>Import to Pipeline</span>
                        </button>

                        {/* 1-Click Import & Trigger Voice AI Call */}
                        <button
                          type="button"
                          onClick={() => handleImportAndReachout(cand, true)}
                          disabled={isImporting}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 via-indigo-600 to-indigo-500 hover:from-cyan-500 hover:to-indigo-400 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-1.5 active:scale-95"
                        >
                          {isImporting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <PhoneCall className="w-3.5 h-3.5" />
                          )}
                          <span>Voice AI Reachout Call</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center glass-panel rounded-3xl border border-slate-800 space-y-3">
              <UserSearch className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">No Candidates Sourced Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Click <strong>Search People</strong> above to query talent profiles matching your job description across Apollo.IO, People Data Labs, Proxycurl, and Coresignal.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
