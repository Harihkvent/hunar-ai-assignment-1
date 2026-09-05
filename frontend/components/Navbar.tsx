"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  PhoneCall,
  Settings as SettingsIcon,
  Plus,
  Radio,
  UserSearch,
  Bot
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
    { href: "/attendance", label: "Attendance", icon: Radio },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#090a0f]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:border-indigo-400/50 transition-colors">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-sm text-white tracking-tight">Hunar.AI</span>
              <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">Recruiter</span>
            </div>
          </Link>

          {/* Minimalist Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/[0.05]">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white/[0.09] text-white shadow-xs"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : "text-zinc-400"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side Status & Action */}
        <div className="flex items-center gap-2.5">
          {/* Status Indicator */}
          <Link
            href="/settings"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                health?.hunar_api_connected
                  ? "bg-emerald-400"
                  : "bg-amber-400"
              }`}
            />
            <span className="text-zinc-300 text-[11px] font-medium hidden sm:inline">
              {health?.hunar_api_connected ? "Voice Live" : "API Connected"}
            </span>
          </Link>

          {/* Create Job CTA */}
          <Link
            href="/jobs/new"
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/50 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Job</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
