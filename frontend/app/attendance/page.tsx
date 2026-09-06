"use client";

import React, { useState, useMemo } from "react";
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
  Cpu,
  Layers,
  PhoneForwarded,
  Search,
  Filter,
  Check,
  HelpCircle,
  Activity,
  Terminal,
  FileText,
  CreditCard,
  Network,
  Lock,
  RefreshCw,
  Sliders,
  ChevronRight,
  UserCheck,
  UserX,
  Clock3,
  XCircle,
  Info,
  Server,
  Scale,
  Award
} from "lucide-react";

interface SiteData {
  id: string;
  name: string;
  city: string;
  zone: string;
  expected: number;
  present: number;
  late: number;
  excused: number;
  pending: number;
  status: "OK" | "LATE" | "REVIEW";
  primaryChannel: "Hardware RFID" | "Voice IVR" | "2-Way SMS" | "Site Landline";
  supervisor: string;
  supervisorPhone: string;
  geoAnchor: string;
  securityLevel: "HIGH (Terminal Hardware)" | "STANDARD (Voice + PIN)" | "BASIC (CLI + SMS)";
}

const CITIES = [
  "Mumbai (Bhiwandi Hub)",
  "Bengaluru (Whitefield)",
  "Delhi NCR (Gurugram)",
  "Hyderabad (HITEC City)",
  "Pune (Chakan Industrial)",
  "Chennai (Sriperumbudur)",
  "Kolkata (Salt Lake)",
  "Ahmedabad (Sanand Zone)"
];

const ZONES = ["North", "South", "East", "West", "Central"];

const SUPERVISORS = [
  "Rajesh Sharma",
  "Anil Deshmukh",
  "Priya Nambiar",
  "Vikramaditya Rao",
  "Sunil Patel",
  "Deepak Gupta",
  "Kavita Reddy",
  "Manish Sen"
];

export default function AttendanceSystemDesignPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "simulator" | "locations" | "statemachine" | "security" | "assistant" | "scenario"
  >("overview");

  // Telemetry dataset for all 100 decentralized locations
  const sampleSites: SiteData[] = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => {
      const siteId = i + 1;
      const isProblemSite = [2, 14, 28, 42, 67, 89].includes(siteId);
      const isLateSite = [8, 19, 33, 51, 74].includes(siteId);

      const present = isProblemSite ? 7 : isLateSite ? 8 : 10;
      const late = isLateSite ? 2 : 0;
      const excused = isProblemSite ? 1 : 0;
      const pending = isProblemSite ? 2 : 0;
      const status: "OK" | "LATE" | "REVIEW" = pending > 0 ? "REVIEW" : late > 0 ? "LATE" : "OK";

      const channelType =
        siteId % 4 === 0
          ? "Hardware RFID"
          : siteId % 3 === 0
          ? "Site Landline"
          : siteId % 2 === 0
          ? "Voice IVR"
          : "2-Way SMS";

      const securityLevel =
        channelType === "Hardware RFID" || channelType === "Site Landline"
          ? "HIGH (Terminal Hardware)"
          : channelType === "Voice IVR"
          ? "STANDARD (Voice + PIN)"
          : "BASIC (CLI + SMS)";

      const formattedId = `SITE-${siteId < 10 ? `00${siteId}` : siteId < 100 ? `0${siteId}` : siteId}`;

      return {
        id: formattedId,
        name: `Workstation ${formattedId}`,
        city: CITIES[siteId % CITIES.length],
        zone: ZONES[siteId % ZONES.length],
        expected: 10,
        present,
        late,
        excused,
        pending,
        status,
        primaryChannel: channelType,
        supervisor: SUPERVISORS[siteId % SUPERVISORS.length],
        supervisorPhone: `+91-98${siteId < 10 ? `00${siteId}` : siteId < 100 ? `0${siteId}` : siteId}-11223`,
        geoAnchor: `Lat 19.${1000 + siteId * 7}, Long 72.${8000 + siteId * 5} (Telco Fixed Loop)`,
        securityLevel,
      };
    });
  }, []);

  // Simulator State
  const [simChannel, setSimChannel] = useState<"VOICE" | "SMS" | "ROLLCALL" | "AUTOFUP" | "RFID">("VOICE");
  const [simLang, setSimLang] = useState<"HINDI" | "ENGLISH" | "TAMIL" | "TELUGU">("HINDI");
  const [simState, setSimState] = useState<"IDLE" | "IN_PROGRESS" | "COMPLETED">("IDLE");
  const [simLogs, setSimLogs] = useState<string[]>([]);

  // Location filter state
  const [locationSearch, setLocationSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState<string>("ALL");
  const [zoneFilter, setZoneFilter] = useState<string>("ALL");
  const [selectedSite, setSelectedSite] = useState<SiteData | null>(null);

  // HR Assistant State
  const [hrQuery, setHrQuery] = useState("");
  const [hrAnswer, setHrAnswer] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  // Run Simulation Handler
  const runSimulation = (channel: "VOICE" | "SMS" | "ROLLCALL" | "AUTOFUP" | "RFID") => {
    setSimChannel(channel);
    setSimState("IN_PROGRESS");
    setSimLogs([]);

    if (channel === "VOICE") {
      const langGreeting =
        simLang === "HINDI"
          ? "'Namaste Rajesh! Hunar Attendance me swagat hai. Kya aap Site 42 par hain?'"
          : simLang === "TAMIL"
          ? "'Vanakkam Rajesh! Neengal Site 42 il irukkireergalaa?'"
          : simLang === "TELUGU"
          ? "'Namaskaram Rajesh! Meeru Site 42 lo unnara?'"
          : "'Hello Rajesh! Please confirm that you are checking in for today\'s shift at Site 42.'";

      const langResponse =
        simLang === "HINDI"
          ? "'Haan madam, main Site 42 pe aa gaya hoon aur shift start kar raha hoon.'"
          : simLang === "TAMIL"
          ? "'Aam madam, naan Site 42 ku vandhuvitten. Shift thodangugiren.'"
          : simLang === "TELUGU"
          ? "'Avunu madam, nenu Site 42 ki vachanu. Shift start chestunnanu.'"
          : "'Yes, I have reached the site and am ready for my shift.'";

      setSimLogs([
        `[08:52:01 AM] [PSTN INBOUND] Inbound Voice Call received on Toll-Free 1800-102-ATTEND from +91-98765-43210 (Basic Feature Phone)...`
      ]);

      setTimeout(() => {
        setSimLogs((prev) => [
          ...prev,
          `[08:52:03 AM] [TELEPHONY GATEWAY] Caller number -> Employee lookup: EMP-1084 (Rajesh Kumar), Assigned: Site 42.`,
          `[08:52:05 AM] [VOICE AI INTERACTION - ${simLang}] Prompt: ${langGreeting}`,
          `[08:52:08 AM] [WORKER SPEECH CAPTURE] Audio: ${langResponse}`,
          `[08:52:10 AM] [SPEECH-TO-TEXT & LLM] Transcribing audio -> Feeding LLM Contextual Semantic Parser...`,
        ]);
      }, 900);

      setTimeout(() => {
        setSimLogs((prev) => [
          ...prev,
          `[08:52:12 AM] [LLM INTENT EXTRACTION] Structured JSON:
{
  "intent": "CHECK_IN",
  "employee_id": "EMP-1084",
  "site_id": "SITE-042",
  "status": "ON_TIME",
  "delta_minutes": -7,
  "language": "${simLang}"
}`,
          `[08:52:13 AM] [DETERMINISTIC RULES ENGINE] Validations:
  ✓ Correct employee record verified
  ✓ Correct assigned site (Site 42)
  ✓ Scheduled today & within valid attendance window
  ✓ Idempotency check: No duplicate event found`,
          `[08:52:14 AM] [ATTENDANCE DATABASE] State Transition: EXPECTED ──► PRESENT (Recorded at 08:53 AM).`,
          `[08:52:15 AM] [SMS NOTIFICATION DISPATCH] Sent to feature phone: "Your attendance has been recorded at 08:53 AM."`,
          `[08:52:16 AM] [HR DASHBOARD SYNC] Central HR Dashboard synchronized in real time.`
        ]);
        setSimState("COMPLETED");
      }, 2200);
    } else if (channel === "SMS") {
      setSimLogs([
        "[08:54:10 AM] [SMS SHORTCODE] Inbound SMS received on 56767 from +91-98111-22334: 'IN SITE 42 PIN 4492'"
      ]);

      setTimeout(() => {
        setSimLogs((prev) => [
          ...prev,
          "[08:54:12 AM] [TELECOM GATEWAY] Caller SIM mapped -> Employee EMP-2041: Priya Sharma (Assigned: Site 42).",
          "[08:54:13 AM] [LLM NLP PARSER] Extracted structured payload: { intent: 'CHECK_IN', site: 'SITE-042', confidence: 0.99 }",
          "[08:54:14 AM] [RULES ENGINE] Shift starts 09:00 AM. Arrival 08:54 AM (6 min early). Marked PRESENT.",
          "[08:54:15 AM] [CONFIRMATION SMS] Dispatched: 'Check-in confirmed for Priya Sharma at Site 42 at 08:54 AM. Status: PRESENT.'"
        ]);
        setSimState("COMPLETED");
      }, 1400);
    } else if (channel === "ROLLCALL") {
      setSimLogs([
        "[09:00:00 AM] [SUPERVISOR ROLL-CALL] Central Voice AI dials Site 18 Fixed Landline (+91-22-2876-0018)..."
      ]);

      setTimeout(() => {
        setSimLogs((prev) => [
          ...prev,
          "[09:00:04 AM] [LANDLINE GEO-ANCHOR] Hardwired Loop Confirmed: Physical coordinate 100% verified via Telco loop.",
          "[09:00:06 AM] [VOICE AI INTERACTION] Prompt: 'Hello Supervisor Mohan. Please report any absent workers for today\'s shift at Site 18.'",
          "[09:00:10 AM] [SUPERVISOR SPEECH] 'Only ID 108 Amit Verma is on approved sick leave. All other 9 staff are present on site.'",
          "[09:00:12 AM] [LLM NEGATIVE-REPORTING PARSER] Marked 9 employees as PRESENT; marked EMP-108 as EXCUSED_LEAVE.",
          "[09:00:14 AM] [COMPLIANCE ROLLUP] Site 18 compliance marked 100% resolved without requiring individual smartphone apps."
        ]);
        setSimState("COMPLETED");
      }, 1800);
    } else if (channel === "AUTOFUP") {
      setSimLogs([
        "[09:20:00 AM] [09:20 AUTOMATED FOLLOW-UP] 09:15 AM normal cutoff elapsed. Identified missing employees (e.g. 80 out of 1,000).",
        "[09:20:02 AM] [QUEUE / SCHEDULER] Missing employees queued into automated follow-up campaign."
      ]);

      setTimeout(() => {
        setSimLogs((prev) => [
          ...prev,
          "[09:20:06 AM] [VOICE AI CALL] Voice AI dials Employee Vikram Rao (+91-98220-44912) at Site 28...",
          "[09:20:09 AM] [VOICE AI PROMPT] 'We haven\'t received your attendance for today. Are you present, late, on leave, or facing an issue?'",
          "[09:20:13 AM] [WORKER RESPONSE] 'I am on my way. My bus was delayed; I will reach in 20 minutes.'",
          "[09:20:15 AM] [LLM INTENT EXTRACTION] Intent: LATE_ARRIVAL, ETA: 20 minutes.",
          "[09:20:17 AM] [RULES ENGINE] Company policy evaluated: State updated from PENDING ──► LATE (Grace period applied).",
          "[09:20:18 AM] [HR DASHBOARD] Central HR Dashboard updated with explanation."
        ]);
        setSimState("COMPLETED");
      }, 2000);
    } else {
      // RFID
      setSimLogs([
        "[08:49:15 AM] [PHYSICAL TERMINAL] RFID / Biometric reader pulse received from Site 42 Gateway..."
      ]);

      setTimeout(() => {
        setSimLogs((prev) => [
          ...prev,
          "[08:49:16 AM] [HARDWARE CONTROLLER] Card UID matched Employee EMP-1084 (Rajesh Kumar).",
          "[08:49:17 AM] [SITE GATEWAY] Event packet transmitted to central attendance system.",
          "[08:49:18 AM] [LOCATION VERIFICATION] Terminal is physically installed at Site 42; physical presence inherently verified.",
          "[08:49:19 AM] [ATTENDANCE DATABASE] Marked PRESENT with strong physical-presence assurance."
        ]);
        setSimState("COMPLETED");
      }, 1500);
    }
  };

  // HR Assistant handler
  const handleAskHr = (queryText: string) => {
    setHrQuery(queryText);
    setIsAnswering(true);
    setHrAnswer(null);

    setTimeout(() => {
      const q = queryText.toLowerCase();
      if (q.includes("absent") || q.includes("high") || q.includes("missing")) {
        setHrAnswer(
          "📊 **High Absenteeism Analysis (100 Locations)**:\n• 6 locations have unverified check-ins above 20%: **Site 02, Site 14, Site 28, Site 42, Site 67, and Site 89**.\n• Automated Voice AI follow-up calls were triggered at 09:20 AM.\n• 4 workers confirmed transit delay (marked LATE).\n• 2 workers reported medical leave (marked EXCUSED_LEAVE).\n• 2 unreached workers escalated to respective Location Managers."
        );
      } else if (q.includes("late") || q.includes("site 42") || q.includes("site 042")) {
        setHrAnswer(
          "⏱️ **Site 42 Attendance Detail**:\n• Total Expected: 10 Employees\n• Present: 7 (On-Time via Voice/RFID)\n• Late: 1 (Bus delay reported via AI voice prompt)\n• Excused Leave: 0\n• Pending Review: 2 (Automated follow-up in progress)\n• Site Supervisor: Deepak Gupta (+91-98042-11223)"
        );
      } else if (q.includes("trade") || q.includes("hardware") || q.includes("telephony")) {
        setHrAnswer(
          "⚖️ **Design Trade-Off Analysis**:\n• **Telephony vs Hardware**: Telephony is cheaper and rapidly deployable across all 100 sites; RFID/Biometric hardware provides strongest physical presence for high-security hubs.\n• **LLM vs Rules**: LLMs understand conversational natural language in regional dialects; deterministic engine strictly decides payroll-grade attendance.\n• **Multi-Channel Fallback**: Voice IVR (primary) + SMS/USSD (secondary) + Site Landline (operational fallback)."
        );
      } else {
        setHrAnswer(
          "✅ **Organization Summary (1,000 Employees across 100 Locations)**:\n• Expected: 1,000 | Verified Present: 904 (90.4%)\n• Late Arrivals: 41 (4.1%)\n• On Leave: 32 (3.2%)\n• Absent: 18 (1.8%)\n• Pending: 5 (0.5%)\n• Core Principle: *'LLMs understand human language; deterministic systems decide attendance.'*"
        );
      }
      setIsAnswering(false);
    }, 500);
  };

  const filteredSites = useMemo(() => {
    return sampleSites.filter((s: SiteData) => {
      const matchesSearch =
        s.id.toLowerCase().includes(locationSearch.toLowerCase()) ||
        s.city.toLowerCase().includes(locationSearch.toLowerCase()) ||
        s.supervisor.toLowerCase().includes(locationSearch.toLowerCase()) ||
        s.zone.toLowerCase().includes(locationSearch.toLowerCase());
      const matchesStatus = locationFilter === "ALL" || s.status === locationFilter;
      const matchesZone = zoneFilter === "ALL" || s.zone === zoneFilter;
      return matchesSearch && matchesStatus && matchesZone;
    });
  }, [sampleSites, locationSearch, locationFilter, zoneFilter]);

  // Overall statistics
  const stats = useMemo(() => {
    const totalExpected = sampleSites.reduce((acc, s) => acc + s.expected, 0);
    const totalPresent = sampleSites.reduce((acc, s) => acc + s.present, 0);
    const totalLate = sampleSites.reduce((acc, s) => acc + s.late, 0);
    const totalExcused = sampleSites.reduce((acc, s) => acc + s.excused, 0);
    const totalPending = sampleSites.reduce((acc, s) => acc + s.pending, 0);
    const attendanceRate = ((totalPresent / totalExpected) * 100).toFixed(1);

    return {
      totalExpected,
      totalPresent,
      totalLate,
      totalExcused,
      totalPending,
      attendanceRate,
    };
  }, [sampleSites]);

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-[#0b101b] to-indigo-950/40 shadow-2xl">
        <div className="relative z-10 max-w-4xl space-y-3.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-xs">
              <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Assignment 3 — AI-Assisted Attendance System Design</span>
            </div>
            <span className="text-xs text-slate-400">
              Architecture Document: <code className="text-indigo-300 font-mono">docs/ASSIGNMENT_3_SYSTEM_DESIGN.md</code>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            AI-Assisted Attendance System <span className="text-indigo-400">Without Smartphones or Apps</span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Scalable architecture for HR tracking <strong>1,000 employees across 100 decentralized locations</strong> every day. Built on multi-tier telecom ingestion (Voice/IVR, SMS/USSD, Site Terminals, Supervisor Landlines), LLM conversational natural-language parsing, deterministic state machine enforcement, and 09:20 AM automated proactive follow-ups.
          </p>

          {/* Architectural Axiom Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-200 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              <strong>Core Architectural Principle:</strong> <em>&quot;LLMs understand human language; deterministic systems decide attendance.&quot;</em>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl glass-panel space-y-1.5 border border-white/[0.06]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Workforce Scale</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">{stats.totalExpected} Employees</div>
          <p className="text-[11px] text-slate-400">100 Physical Locations (~10/site)</p>
        </div>

        <div className="p-4 rounded-2xl glass-panel space-y-1.5 border border-white/[0.06]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Attendance Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400">{stats.attendanceRate}% Present</div>
          <p className="text-[11px] text-slate-400">{stats.totalPresent} on-time • {stats.totalLate} late</p>
        </div>

        <div className="p-4 rounded-2xl glass-panel space-y-1.5 border border-white/[0.06]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Employee Hardware</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">Basic Feature Phones</div>
          <p className="text-[11px] text-cyan-400 font-medium">Zero apps / Zero smartphone GPS</p>
        </div>

        <div className="p-4 rounded-2xl glass-panel space-y-1.5 border border-white/[0.06]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Validation Model</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">Deterministic Rules</div>
          <p className="text-[11px] text-slate-400">LLM for language; rules for payroll</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "overview", label: "1. System Topology & Flow", icon: Layers },
          { id: "simulator", label: "2. Multi-Channel Simulator", icon: Bot },
          { id: "locations", label: "3. 100-Location Grid & Heatmap", icon: MapPin },
          { id: "statemachine", label: "4. State Machine & Timeline", icon: Activity },
          { id: "security", label: "5. Anti-Proxy & Location Verification", icon: ShieldCheck },
          { id: "assistant", label: "6. LLM HR Intelligence Assistant", icon: Sparkles },
          { id: "scenario", label: "7. Scenario & Design Trade-offs", icon: Scale },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: System Topology & Flow */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <span>High-Level Architecture (100 Locations / 1,000 Employees)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Telecom-first, site-aware attendance platform with deterministic rules and AI assistance.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-950/50 px-3 py-1.5 rounded-lg border border-indigo-500/30 font-mono">
                <span>FastAPI • PostgreSQL • Redis • LLM Intelligence</span>
              </div>
            </div>

            {/* Architecture ASCII Block matching Section 4 of Design Doc */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
              <pre className="text-[11px] sm:text-xs">{`
                           ┌──────────────────────────────────────────────────┐
                           │                  HR / Managers                   │
                           │                  Web Dashboard                   │
                           └────────────────────────┬─────────────────────────┘
                                                    │ HTTPS / API
                                                    ▼
                           ┌──────────────────────────────────────────────────┐
                           │                    API Layer                     │
                           │                     FastAPI                      │
                           └────────────────────────┬─────────────────────────┘
                                                    │
             ┌──────────────────────────────────────┼──────────────────────────────────────┐
             │                                      │                                      │
             ▼                                      ▼                                      ▼
   ┌───────────────────┐                  ┌───────────────────┐                  ┌───────────────────┐
   │ Employee /        │                  │ Attendance /      │                  │ AI / Exception    │
   │ Location Service  │                  │ Rules Engine      │                  │ Service           │
   └─────────┬─────────┘                  └─────────┬─────────┘                  └─────────┬─────────┘
             │                                      │                                      │
             └──────────────────────────────────────┼──────────────────────────────────────┘
                                                    ▼
                                  ┌───────────────────────────────────┐
                                  │          PostgreSQL / DB          │
                                  └─────────────────┬─────────────────┘
                                                    │
                                  ┌─────────────────▼─────────────────┐
                                  │         Queue / Scheduler         │
                                  │          Redis / Workers          │
                                  └─────────────────┬─────────────────┘
                                                    │
             ┌──────────────────────────────────────┼──────────────────────────────────────┐
             │                                      │                                      │
             ▼                                      ▼                                      ▼
        Voice / IVR                            SMS / USSD                            Site Hardware
             │                                                                             │
             ▼                                                                             ▼
       Basic Phones                                                                 RFID / Biometric
       / Landlines                                                                     Terminals
             │                                                                             │
             └──────────────────────────────────────┬──────────────────────────────────────┘
                                                    ▼
                                            Attendance Events
                                                    │
                                                    ▼
                                        Validation + Audit Trail
              `}</pre>
            </div>

            {/* Ingestion Channels matching Section 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                  <PhoneCall className="w-4 h-4" />
                  <span>1. Voice / IVR</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Primary conversational option using basic feature phones. LLM transcribes speech in regional dialects and extracts structured check-in intent.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <MessageSquare className="w-4 h-4" />
                  <span>2. SMS / USSD</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Low-bandwidth fallback channel for low-connectivity zones or when voice interaction is unavailable.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                  <CreditCard className="w-4 h-4" />
                  <span>3. RFID / Biometric</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Strongest physical-presence option for locations where on-site terminal hardware is practical and deployed.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                  <Building2 className="w-4 h-4" />
                  <span>4. Landline / Supervisor</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Operational fallback for exception cases, negative-reporting roll calls, or reporting approved leave.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: Multi-Channel Simulator */}
      {/* ========================================================================= */}
      {activeTab === "simulator" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-400" />
                  <span>Interactive Employee Attendance Flow Simulator</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simulate voice check-ins, SMS fallback, automated follow-ups, supervisor roll-calls, and physical RFID badges.
                </p>
              </div>

              {/* Language Selector for Voice */}
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium px-2">Voice AI Dialect:</span>
                {(["HINDI", "ENGLISH", "TAMIL", "TELUGU"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSimLang(lang)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      simLang === lang
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Ingestion Channel Trigger Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {[
                { id: "VOICE", label: "1. Voice / IVR Check-In", icon: PhoneCall },
                { id: "SMS", label: "2. SMS / USSD Fallback", icon: MessageSquare },
                { id: "AUTOFUP", label: "3. 09:20 AI Follow-Up", icon: PhoneForwarded },
                { id: "ROLLCALL", label: "4. Supervisor Landline", icon: Building2 },
                { id: "RFID", label: "5. RFID / Terminal", icon: CreditCard },
              ].map((ch) => {
                const Icon = ch.icon;
                const isSelected = simChannel === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => runSimulation(ch.id as any)}
                    disabled={simState === "IN_PROGRESS"}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isSelected && simState === "IN_PROGRESS"
                        ? "bg-indigo-950/80 border-indigo-500 shadow-lg shadow-indigo-500/20"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="w-4 h-4 text-indigo-400" />
                      {isSelected && simState === "IN_PROGRESS" && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-white mt-2">{ch.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Terminal Log Stream */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-slate-500 text-[11px]">
                <span className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      simState === "COMPLETED"
                        ? "bg-emerald-400"
                        : simState === "IDLE"
                        ? "bg-slate-600"
                        : "bg-amber-400 animate-ping"
                    }`}
                  />
                  EVENT EXECUTION & VALIDATION LOG
                </span>
                <span className="text-slate-400">
                  CHANNEL: {simChannel} • DIALECT: {simLang} • STATUS: {simState}
                </span>
              </div>

              {simLogs.length === 0 ? (
                <div className="py-10 text-center text-slate-500 italic space-y-2">
                  <Terminal className="w-8 h-8 text-slate-600 mx-auto" />
                  <p>Select any attendance flow above to trigger real-time voice recognition, SMS, or terminal validation.</p>
                </div>
              ) : (
                <div className="space-y-2.5 pt-2 max-h-[380px] overflow-y-auto pr-1">
                  {simLogs.map((log, idx) => (
                    <div key={idx} className="text-slate-200 leading-relaxed whitespace-pre-line">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 100-Location Grid & Heatmap */}
      {/* ========================================================================= */}
      {activeTab === "locations" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-400" />
                  <span>Centralized HR Location Heatmap (100 Locations / 1,000 Employees)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing {filteredSites.length} of 100 decentralized physical locations (~10 employees/site).
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    placeholder="Search site, city, supervisor..."
                    className="pl-8 pr-3 py-1.5 rounded-xl glass-input text-xs text-white placeholder-slate-500 w-44 sm:w-56"
                  />
                </div>

                <select
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl glass-input text-xs text-white"
                >
                  <option value="ALL" className="bg-slate-900">All Zones (5)</option>
                  <option value="North" className="bg-slate-900">North Zone</option>
                  <option value="South" className="bg-slate-900">South Zone</option>
                  <option value="East" className="bg-slate-900">East Zone</option>
                  <option value="West" className="bg-slate-900">West Zone</option>
                  <option value="Central" className="bg-slate-900">Central Zone</option>
                </select>

                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl glass-input text-xs text-white"
                >
                  <option value="ALL" className="bg-slate-900">All Statuses (100 Sites)</option>
                  <option value="OK" className="bg-slate-900">100% Verified (OK)</option>
                  <option value="LATE" className="bg-slate-900">Late Arrivals</option>
                  <option value="REVIEW" className="bg-slate-900">Review Required</option>
                </select>
              </div>
            </div>

            {/* Sites Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[560px] overflow-y-auto pr-1">
              {filteredSites.map((site: SiteData) => (
                <div
                  key={site.id}
                  onClick={() => setSelectedSite(site)}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all cursor-pointer space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-indigo-300">{site.id}</span>
                      <span className="text-xs text-slate-200 font-semibold truncate max-w-[130px]">
                        {site.city.split("(")[0]}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        site.status === "OK"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : site.status === "LATE"
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {site.status === "OK" ? "OK (100%)" : site.status === "LATE" ? "Late Checked" : "Review"}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Expected: <strong className="text-slate-200">{site.expected}</strong></span>
                    <span>Present: <strong className="text-emerald-400">{site.present}</strong></span>
                    {site.late > 0 && <span>Late: <strong className="text-amber-400">{site.late}</strong></span>}
                    {site.pending > 0 && <span>Pending: <strong className="text-rose-400">{site.pending}</strong></span>}
                  </div>

                  <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/60">
                    <span className="truncate max-w-[140px]">Supv: {site.supervisor}</span>
                    <span className="text-indigo-400 font-medium">{site.primaryChannel}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Site Detail Drilldown Modal */}
            {selectedSite && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-indigo-400" />
                      <div>
                        <h4 className="text-sm font-bold text-white">{selectedSite.name}</h4>
                        <p className="text-[11px] text-slate-400">{selectedSite.city} • Zone: {selectedSite.zone}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSite(null)}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Expected Roster</span>
                      <p className="font-bold text-white text-base">{selectedSite.expected} Employees</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">Verified Present</span>
                      <p className="font-bold text-emerald-400 text-base">{selectedSite.present} Employees</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location Supervisor:</span>
                      <span className="text-white font-medium">{selectedSite.supervisor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Supervisor Contact:</span>
                      <span className="text-indigo-300 font-mono">{selectedSite.supervisorPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Primary Channel:</span>
                      <span className="text-white font-medium">{selectedSite.primaryChannel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Security Level:</span>
                      <span className="text-emerald-400 font-medium">{selectedSite.securityLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Telco Geo-Anchor:</span>
                      <span className="text-slate-300 font-mono text-[10px]">{selectedSite.geoAnchor}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSite(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: State Machine & Daily Automation Timeline */}
      {/* ========================================================================= */}
      {activeTab === "statemachine" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <span>Attendance State Machine (Section 9)</span>
            </h3>

            {/* State Machine Flow Diagram matching Section 9 */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
              <pre className="text-[11px] sm:text-xs">{`
                ┌──────────────┐
                │   EXPECTED   │
                └──────┬───────┘
                       │
             valid check-in
                       ▼
                ┌──────────────┐
                │   PRESENT    │
                └──────┬───────┘
                       │
                   check-out
                       ▼
                ┌──────────────┐
                │  COMPLETED   │
                └──────────────┘

EXPECTED ── no check-in ──► PENDING

PENDING ── late confirmation ──► LATE

PENDING ── approved leave ──► EXCUSED

PRESENT / PENDING ── suspicious event ──► UNDER_REVIEW
              `}</pre>
            </div>

            {/* Daily Automation Workflow matching Section 10 */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Daily Automation Workflow (Section 10)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-400 font-mono text-xs">08:30 AM</span>
                    <Radio className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <p className="font-semibold text-white">Window Opens</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Employees check in via Voice, SMS, USSD, or on-site hardware. Events enter processing queue.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 font-mono text-xs">09:15 AM</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className="font-semibold text-white">Normal Cutoff</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Backend compares expected roster with verified check-ins and finds missing employees.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400 font-mono text-xs">09:20 AM</span>
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <p className="font-semibold text-white">Automated Follow-Up</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Voice / SMS exception handling asks missing employees naturally for status (present, late, leave).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 font-mono text-xs">09:30 AM</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="font-semibold text-white">HR Dashboard Updated</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Central HR view updated with organization-wide attendance, late flags, and excused leaves.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: Anti-Proxy & Location Security */}
      {/* ========================================================================= */}
      {activeTab === "security" && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Location Verification & Layered Identity (Sections 6, 7 & 17)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Making the workplace part of the attendance proof without relying on smartphone GPS.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-mono">
              <span>Zero Smartphone GPS • Layered Verification</span>
            </div>
          </div>

          {/* 4 Layers matching Section 7 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                Layer 1 — Registered Phone Number
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                The caller number (CLI/ANI) is mapped to an authoritative employee record in the database.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                Layer 2 — Personal PIN
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                The system can request a hashed personal PIN during the attendance interaction to prevent device sharing.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                Layer 3 — Optional Voice Verification
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                For high-security environments, a short voice sample can be compared with a registered voice profile.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                Layer 4 — Physical Terminal Verification
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                RFID or biometric terminals physically installed at the site provide strong on-site identity assurance.
              </p>
            </div>
          </div>

          {/* Location Verification Comparison matching Section 6 */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Location Verification Architecture (Section 6)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="font-bold text-white block">Preferred: Site-Attached Hardware</span>
                <p className="text-slate-300 leading-relaxed">
                  Terminal is physically installed at Site 42. Employee swipes badge or biometric reader. The attendance event is inherently associated with that physical site.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="font-bold text-white block">Lower-Cost: Site-Specific Telephony</span>
                <p className="text-slate-300 leading-relaxed">
                  Backend combines registered caller identity, destination/site identity, time, employee-to-site assignment, and personal PIN to verify attendance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: LLM HR Intelligence Assistant */}
      {/* ========================================================================= */}
      {activeTab === "assistant" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>LLM-Powered HR Assistant (Section 16)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Ask natural-language questions across all 100 locations and 1,000 employee records:
            </p>

            {/* Quick Suggestion Chips matching Section 16 examples */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                "Which locations have unusually high absenteeism today?",
                "Who has not checked in after the second reminder?",
                "Show me today's late arrivals at Site 42.",
                "Explain the architectural trade-offs between telephony and hardware.",
              ].map((queryText, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAskHr(queryText)}
                  className="px-3 py-1.5 rounded-xl text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                >
                  &quot;{queryText}&quot;
                </button>
              ))}
            </div>

            {/* Query Input Bar */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={hrQuery}
                onChange={(e) => setHrQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && hrQuery && handleAskHr(hrQuery)}
                placeholder="Ask any natural-language question about attendance, sites, or exceptions..."
                className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
              />
              <button
                type="button"
                onClick={() => hrQuery && handleAskHr(hrQuery)}
                disabled={isAnswering}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                Analyze
              </button>
            </div>

            {isAnswering && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Controlled analytics layer querying attendance database...</span>
              </div>
            )}

            {hrAnswer && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-line animate-in fade-in">
                {hrAnswer}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: End-to-End Scenario & Design Trade-offs */}
      {/* ========================================================================= */}
      {activeTab === "scenario" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* End-to-End Scenario matching Section 18 */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock3 className="w-5 h-5 text-cyan-400" />
              <span>Example End-to-End Scenario: Employee Raj at Site 42 (Section 18)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Shift: 09:00–18:00 • Assigned Location: Site 42 • Mechanism: Voice / RFID
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
                <span className="font-mono font-bold text-indigo-400 shrink-0">08:52 AM</span>
                <div>
                  <p className="font-semibold text-white">Raj arrives at Site 42</p>
                  <p className="text-slate-400">Arrives at assigned location and uses the configured attendance mechanism.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
                <span className="font-mono font-bold text-indigo-400 shrink-0">08:53 AM</span>
                <div>
                  <p className="font-semibold text-white">System receives event packet</p>
                  <p className="text-slate-400">
                    Employee identity: Raj | Location: Site 42 | Time: 08:53 | Source: Voice / RFID / Biometric.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
                <span className="font-mono font-bold text-emerald-400 shrink-0">08:53 AM</span>
                <div>
                  <p className="font-semibold text-white">Validation & State Transition</p>
                  <p className="text-slate-400">
                    Identity and shift rules are validated deterministically. Attendance state becomes <strong className="text-emerald-400">PRESENT</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
                <span className="font-mono font-bold text-amber-400 shrink-0">09:15 AM</span>
                <div>
                  <p className="font-semibold text-white">Cutoff Audit</p>
                  <p className="text-slate-400">System identifies employees without valid check-ins (e.g. 80 out of 1,000).</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
                <span className="font-mono font-bold text-cyan-400 shrink-0">09:20 AM</span>
                <div>
                  <p className="font-semibold text-white">AI Follow-Up</p>
                  <p className="text-slate-400">
                    Voice AI follows up with missing employees. One employee explains delay; LLM extracts <strong className="text-amber-400">LATE_ARRIVAL</strong>. Rules engine applies company policy.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
                <span className="font-mono font-bold text-emerald-400 shrink-0">09:30 AM</span>
                <div>
                  <p className="font-semibold text-white">HR Dashboard Updated</p>
                  <p className="text-slate-400">HR dashboard reflects updated organization-wide status across all 100 locations.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Design Trade-offs matching Section 19 */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-400" />
              <span>Design Trade-Offs (Section 19)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="font-bold text-white">Telephony vs. Hardware</span>
                <p className="text-slate-300 leading-relaxed">
                  Telephony is cheaper and easier to deploy but provides weaker physical-presence assurance. RFID/biometric hardware provides stronger physical presence but has deployment and maintenance costs.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="font-bold text-white">LLM vs. Deterministic Rules</span>
                <p className="text-slate-300 leading-relaxed">
                  LLMs make the interaction flexible and multilingual, but deterministic rules are more reliable for policy enforcement and auditability.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="font-bold text-white">Single Channel vs. Multi-Channel</span>
                <p className="text-slate-300 leading-relaxed">
                  A single channel is simpler, but multiple channels provide resilience when employees have connectivity or device problems.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="font-bold text-white">Centralized vs. Site Autonomy</span>
                <p className="text-slate-300 leading-relaxed">
                  A centralized platform gives HR one source of truth, while lightweight site-level buffering can improve resilience during temporary network failures.
                </p>
              </div>
            </div>
          </div>

          {/* Final Principle matching Section 20 */}
          <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Why This Solves the Challenge (Section 20)</span>
            </div>
            <p className="text-slate-200 leading-relaxed italic">
              &quot;Use the simplest available technology at the employee side, and put the intelligence and operational complexity in the centralized platform.&quot;
            </p>
            <p className="text-slate-400 leading-relaxed">
              The employee does not need a smartphone or an app. The system still gives HR a scalable, auditable, and intelligent attendance platform for 1,000 employees across 100 locations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
