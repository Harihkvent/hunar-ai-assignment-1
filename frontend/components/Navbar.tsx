"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  Briefcase,
  Users,
  PhoneCall,
  Settings as SettingsIcon,
  Activity,
  PlusCircle,
  Radio,
  UserSearch
} from "lucide-react";
import { api } from "../lib/api";
import { SystemHealth } from "../lib/types";

export default function Navbar() {
  const pathname = usePathname();
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    api.getSystemHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/sourcing", label: "People Search", icon: UserSearch },
    { href: "/candidates", label: "Candidates", icon: Users },
    { href: "/interviews", label: "Screening Console", icon: PhoneCall },
    { href: "/attendance", label: "Attendance System", icon: Radio },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">Hunar.AI</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Hiring Assistant
                </span>
              </div>
              <p className="text-[11px] text-slate-400">AI Voice Screening & Evaluation</p>
            </div>
          </Link>

          {/* Nav items */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side status & action */}
        <div className="flex items-center gap-3">
          {/* Provider connectivity status badge */}
          <Link
            href="/settings"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                health?.hunar_api_connected
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
              }`}
            />
            <span className="text-slate-300">
              {health?.hunar_api_connected ? "Hunar Voice Live" : "API Connected"}
            </span>
          </Link>

          {/* Quick Create Job */}
          <Link
            href="/jobs/new"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/25 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Job</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
