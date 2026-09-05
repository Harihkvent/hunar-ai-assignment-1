"use client";

import React, { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Phone,
  Radio,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Lock,
  Server
} from "lucide-react";
import { api } from "../../lib/api";
import { SystemHealth } from "../../lib/types";

export default function SettingsPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [numbers, setNumbers] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = () => {
    setIsRefreshing(true);
    Promise.all([api.getSystemHealth(), api.getCallerNumbers()])
      .then(([h, n]) => {
        setHealth(h);
        setNumbers(n);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsRefreshing(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-indigo-400" />
            <span>Settings & Integration Health</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor Hunar.AI voice provider connectivity, telephony numbers, and security trust boundary.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Run Health Diagnostics</span>
        </button>
      </div>

      {/* System Status Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              health?.hunar_api_connected
                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                : "bg-amber-500/20 border border-amber-500/40 text-amber-400"
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                {health?.hunar_api_connected ? "All Voice Systems Operational" : "Voice Provider Initializing"}
              </h3>
              <p className="text-xs text-slate-400">
                FastAPI Backend • Hunar Voice External v1 API • SQLite Database
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-xs font-mono text-slate-400 block">
              {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : "—"}
            </span>
            <span className="text-[10px] text-slate-500">Last Checked</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Hunar API Status</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
          <div className="text-xl font-bold text-white">
            {health?.hunar_api_connected ? "Authenticated (200 OK)" : "Offline"}
          </div>
          <p className="text-[11px] text-slate-400">
            Base URL: https://api.voice.hunar.ai/external/v1
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Configured Voice Agents</span>
            <Radio className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-indigo-300">
            {health?.hunar_agents_count || 0} Provisioned
          </div>
          <p className="text-[11px] text-slate-400">
            Synchronized dynamically per hiring role
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Caller ID Phone Numbers</span>
            <Phone className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-300">
            {numbers.length} Validated
          </div>
          <p className="text-[11px] text-slate-400">
            Allowed destinations: {health?.allowed_countries.join(", ") || "Global"}
          </p>
        </div>
      </div>

      {/* Validated Telephony Caller Numbers */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Phone className="w-4 h-4 text-indigo-400" />
          <span>Organization Caller ID Numbers</span>
        </h3>

        <div className="divide-y divide-slate-800/80">
          {numbers.map((num) => (
            <div key={num.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-mono text-sm font-bold text-white">{num.phone_number}</span>
                <span className="text-[11px] text-slate-400 ml-2">
                  Provider: {num.provider} • Country: {num.country_code}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Validated
                </span>
                {num.is_default && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold">
                    Default
                  </span>
                )}
              </div>
            </div>
          ))}

          {numbers.length === 0 && (
            <div className="py-4 text-center text-xs text-slate-400">
              No numbers listed. The provider will automatically assign available pool numbers.
            </div>
          )}
        </div>
      </div>

      {/* Security & Secrets Checklist */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Security & Credential Trust Boundary Checklist</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Backend Trust Boundary</strong>
              <span>Hunar API Key is isolated entirely on the FastAPI backend server. The Next.js frontend never receives or references the raw secret.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Git Exclusions (.gitignore)</strong>
              <span>All <code>.env</code> and local database files are excluded from git commits and repository history.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Webhook HMAC Signature Validation</strong>
              <span>The webhook listener at <code>/api/webhooks/hunar</code> verifies <code>X-Hunar-Signature</code> and <code>X-Hunar-Timestamp</code> using HMAC-SHA256 digests to prevent spoofing or replay attacks.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
