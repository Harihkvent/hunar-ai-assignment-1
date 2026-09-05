"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Radio,
  PhoneCall,
  MessageSquare,
  Building2,
  Users,
  ShieldCheck,
  Zap,
  Sparkles,
  Bot,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Cpu,
  Layers,
  PhoneForwarded
} from "lucide-react";

export default function AttendanceSystemDesignPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "channels" | "security" | "cost">("overview");
  const [simState, setSimState] = useState<"IDLE" | "CALLING" | "TRANSCRIBING" | "VERIFIED">("IDLE");
  const [simLog, setSimLog] = useState<string[]>([]);

  const runSimulation = () => {
    setSimState("CALLING");
    setSimLog(["[08:52:01 AM] Incoming PSTN call detected from +919876543210 (Assigned: Rajesh Kumar - Site 42)..."]);
    
    setTimeout(() => {
      setSimState("TRANSCRIBING");
      setSimLog((prev) => [
        ...prev,
        "[08:52:04 AM] Voice AI Prompt: 'Namaste Rajesh! Aapka swagat hai. Kya aap Site 42 (Whitefield Hub) par hain?'",
        "[08:52:08 AM] Worker Audio: 'Haan madam, main Site 42 pe pahunch gaya hoon aur shift start kar raha hoon.'",
        "[08:52:10 AM] Audio Pipeline: Transcribing Hindi vernacular speech -> Feeding LLM Contextual Parser...",
      ]);
    }, 1600);

    setTimeout(() => {
      setSimState("VERIFIED");
      setSimLog((prev) => [
        ...prev,
        "[08:52:13 AM] LLM Extraction: { employee_id: 'EMP-1084', location_id: 'SITE-042', status: 'ON_TIME', delta: '-8m' }",
        "[08:52:14 AM] Verification Engine: Telecom CLI Matched  | Landline Geo-Anchor Verified ",
        "[08:52:15 AM] SMS Dispatch: Confirmation sent to worker SIM.",
        "[08:52:16 AM] Attendance Ledger: Check-in successfully recorded in Central HR Database!",
      ]);
    }, 3400);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-slate-800 bg-gradient-to-br from-slate-900 via-[#0b101b] to-indigo-950/40 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Problem Statement 3 — Architectural Solution</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Multi-Site Attendance Tracking <span className="text-indigo-400">Without Smartphones or Apps</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            How HR reliably tracks <strong>1,000 employees across 100 decentralized sites</strong> daily using Voice AI, PSTN telephony, 2-Way SMS, and LLM semantic extraction under strict zero-smartphone constraints.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        {[
          { id: "overview", label: "Architecture Blueprint", icon: Layers },
          { id: "channels", label: "3-Tier Ingestion Channels", icon: PhoneCall },
          { id: "security", label: "Anti-Proxy & Security", icon: ShieldCheck },
          { id: "cost", label: "ROI & Cost Matrix ($0.25/mo)", icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Architecture Blueprint & Live Interactive Telephony Simulator */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Key Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Distributed Scale</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white">1,000 Workers</div>
              <p className="text-xs text-slate-400">Across 100 physical locations</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Hardware Requirement</span>
                <Radio className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">Basic 2G Phone</div>
              <p className="text-xs text-emerald-400/90 font-medium">Zero smartphone / app reliance</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Daily Check-in Speed</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">12–18 Seconds</div>
              <p className="text-xs text-slate-400">Natural voice conversation</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Total Cost / Employee</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">$0.25 / Month</div>
              <p className="text-xs text-slate-400">~$9.65 total daily org cost</p>
            </div>
          </div>

          {/* Interactive Telephony Simulator */}
          <div className="p-6 rounded-3xl bg-[#0b101b] border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-400" />
                  <span>Interactive Voice AI Telephony Simulation</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Simulate an employee calling the toll-free number from a 2G feature phone at Site 42.
                </p>
              </div>

              <button
                onClick={runSimulation}
                disabled={simState === "CALLING" || simState === "TRANSCRIBING"}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-indigo-600/30"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{simState === "IDLE" ? "Simulate Inbound Call" : "Re-run Simulation"}</span>
              </button>
            </div>

            {/* Simulation Terminal Screen */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-500 text-[11px]">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${simState === "VERIFIED" ? "bg-emerald-400" : simState === "IDLE" ? "bg-slate-600" : "bg-amber-400 animate-ping"}`} />
                  TELEPHONY EVENT STREAM
                </span>
                <span>STATUS: {simState}</span>
              </div>

              {simLog.length === 0 ? (
                <div className="py-8 text-center text-slate-600 italic">
                  Click &apos;Simulate Inbound Call&apos; above to trigger the PSTN &rarr; LLM attendance pipeline.
                </div>
              ) : (
                <div className="space-y-1.5 pt-2">
                  {simLog.map((log, i) => (
                    <div key={i} className="text-slate-300 leading-relaxed">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Channels */}
      {activeTab === "channels" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">1. Inbound Voice AI Line</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Workers dial toll-free <code>1800-XXX-ATTEND</code> from their 2G phone or site landline. Voice AI asks a 15-second conversational verification in their native language.
            </p>
            <div className="text-[11px] font-mono text-indigo-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
              "Namaste Rajesh! Aapka check-in time 08:52 AM record ho gaya hai."
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">2. 2-Way SMS / USSD</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Backup for noisy or weak-signal areas. Worker sends a free SMS: <code>IN 42</code> or natural text <code>Reached Site 42</code>. LLM verifies phone number & replies with confirmation.
            </p>
            <div className="text-[11px] font-mono text-emerald-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
              "Confirmed: Rajesh Kumar @ Site 42. Status: ON TIME (08:54 AM)."
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">3. Landline Roll-Call</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              For remote sites with supervisor landlines. Voice AI auto-dials the landline at 09:00 AM; supervisor simply names any absent staff, automatically marking the rest present.
            </p>
            <div className="text-[11px] font-mono text-cyan-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
              "Supervisor: Only ID 108 and 114 are on leave. Rest all present."
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Anti-Proxy & Security */}
      {activeTab === "security" && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Anti-Buddy-Punching & Location Proof Without Apps</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400">1. Telecom Caller ID (CLI/ANI)</span>
              <p className="text-xs text-slate-300">
                PSTN signaling provides hardware SIM identity. Calls from unregistered numbers are instantly flagged or challenged.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400">2. Landline Geo-Anchoring</span>
              <p className="text-xs text-slate-300">
                On-site landline telephone numbers are physically hardwired to that exact street address, providing 100% tamper-proof physical location proof.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400">3. Acoustic Voice Biometrics</span>
              <p className="text-xs text-slate-300">
                2-second acoustic voiceprint comparison against candidate baseline audio matches speaker frequency without hardware biometric readers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400">4. Proactive Absence Dispatch</span>
              <p className="text-xs text-slate-300">
                At 09:20 AM, Voice AI dials any unverified worker to log reasons (sick, late, flat tyre), reducing HR manual work to zero.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Cost */}
      {activeTab === "cost" && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 animate-in fade-in duration-300">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <span>Operational Cost Breakdown (1,000 Workers / 100 Locations)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-3 px-4">Component</th>
                  <th className="py-3 px-4">Usage Unit</th>
                  <th className="py-3 px-4">Daily Cost</th>
                  <th className="py-3 px-4">Monthly Cost (26 Days)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                <tr>
                  <td className="py-3 px-4 text-white font-sans font-semibold">Inbound Voice Calls</td>
                  <td className="py-3 px-4">1,000 calls × 15s (250 mins @ $0.015/m)</td>
                  <td className="py-3 px-4 text-indigo-400">$3.75</td>
                  <td className="py-3 px-4">$97.50</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-white font-sans font-semibold">LLM Semantic Parsing</td>
                  <td className="py-3 px-4">1,000 calls × 300 tokens</td>
                  <td className="py-3 px-4 text-indigo-400">$0.15</td>
                  <td className="py-3 px-4">$3.90</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-white font-sans font-semibold">Outbound Exception Calls</td>
                  <td className="py-3 px-4">100 follow-ups × 30s (50 mins)</td>
                  <td className="py-3 px-4 text-indigo-400">$0.75</td>
                  <td className="py-3 px-4">$19.50</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-white font-sans font-semibold">SMS Confirmations</td>
                  <td className="py-3 px-4">1,000 SMS @ $0.005/msg</td>
                  <td className="py-3 px-4 text-indigo-400">$5.00</td>
                  <td className="py-3 px-4">$130.00</td>
                </tr>
                <tr className="bg-indigo-950/30 font-bold text-white">
                  <td className="py-4 px-4 font-sans text-sm">Total Organization Cost</td>
                  <td className="py-4 px-4">1,000 Employees / 100 Sites</td>
                  <td className="py-4 px-4 text-emerald-400 text-sm">~$9.65 / day</td>
                  <td className="py-4 px-4 text-emerald-400 text-sm">~$250.90 / month</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
             Total cost per employee is only <strong>$0.25 / employee / month</strong>, representing a 90% savings over biometric hardware installations.
          </div>
        </div>
      )}
    </div>
  );
}
