"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Users,
  CheckCircle2,
  Lock,
  Mail,
  Zap,
  Briefcase
} from "lucide-react";
import { DEMO_USERS, useAuth, UserProfile } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("aarav.sharma@hunar.ai");
  const [password, setPassword] = useState("••••••••••••");
  const [selectedUser, setSelectedUser] = useState<UserProfile>(DEMO_USERS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectDemoUser = (user: UserProfile) => {
    setSelectedUser(user);
    setEmail(user.email);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      login(selectedUser);
      setIsSubmitting(false);
      router.push("/");
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6 px-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Side: Brand & Product Value */}
        <div className="space-y-6 hidden md:block">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Voice Screening & Talent Operations</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            Automate First-Round Interviews with <span className="text-indigo-400">Voice AI Agents</span>
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed">
            Conduct multi-lingual phone screening, analyze candidate answers in real-time, generate structured scorecards, and streamline hiring decisions.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Autonomous Outbound Phone Calls via Hunar.AI",
              "Multi-Source People Search (Apollo, PDL, Proxycurl)",
              "Multi-Dimensional Candidate Scoring & Transcripts",
              "Multi-Site Attendance Tracking Architecture",
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
            <div className="flex -space-x-2">
              {DEMO_USERS.map((u) => (
                <img
                  key={u.id}
                  src={u.avatar}
                  alt={u.name}
                  className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover"
                />
              ))}
            </div>
            <div className="text-xs text-slate-400">
              <strong className="text-white">Enterprise Recruiter Suite</strong> • Multi-Role Access
            </div>
          </div>
        </div>

        {/* Right Side: Login Card & 1-Click Role Switcher */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl bg-slate-900/90 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Recruiter Workspace</h2>
                <p className="text-[11px] text-slate-400">Sign in to manage hiring pipelines</p>
              </div>
            </div>
          </div>

          {/* 1-Click Demo Profiles */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Quick 1-Click Demo Profiles</span>
              <span className="text-[10px] text-indigo-400 font-mono">Instant Access</span>
            </label>
            <div className="space-y-2">
              {DEMO_USERS.map((u) => {
                const isSelected = selectedUser.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectDemoUser(u)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-indigo-600/15 border-indigo-500/50 shadow-md shadow-indigo-600/10"
                        : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40"
                    }`}
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{u.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            u.role === "LEAD_RECRUITER"
                              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                              : u.role === "HIRING_MANAGER"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {u.roleTitle}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{u.department} • {u.email}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 pt-2 border-t border-slate-800">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Work Email</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-98 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Entering Workspace...</span>
              ) : (
                <>
                  <span>Sign In as {selectedUser.name.split(" ")[0]}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-[11px] text-slate-500">
            Protected with role-based token authentication & HMAC signed webhooks.
          </div>
        </div>
      </div>
    </div>
  );
}
