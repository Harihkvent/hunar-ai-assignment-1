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
  Bot,
  ChevronDown,
  LogOut,
  UserCheck,
  Shield
} from "lucide-react";
import { api } from "../lib/api";
import { SystemHealth } from "../lib/types";
import { useAuth, DEMO_USERS } from "../lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const { user, logout, switchUser } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

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

        {/* Right Side Status & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Indicator */}
          <Link
            href="/settings"
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
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

          {/* User Auth Profile Dropdown */}
          <div className="relative">
            {user ? (
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover border border-indigo-500/40"
                />
                <div className="text-left hidden lg:block">
                  <div className="text-[11px] font-bold text-slate-200 leading-tight truncate max-w-[90px]">
                    {user.name.split(" ")[0]}
                  </div>
                  <div className="text-[9px] text-indigo-400 font-medium leading-none truncate max-w-[90px]">
                    {user.roleTitle.split(" ")[0]}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-indigo-300 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Dropdown Menu */}
            {showUserMenu && user && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel border border-slate-800 bg-slate-900/95 shadow-2xl p-2 z-50 space-y-2 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setShowUserMenu(false)}
              >
                {/* Active User Card */}
                <div className="p-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-indigo-500/40"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">{user.name}</div>
                      <div className="text-[10px] text-indigo-300 font-medium truncate">{user.roleTitle}</div>
                    </div>
                  </div>
                </div>

                {/* Switch Workspace Role */}
                <div className="px-2 pt-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Switch Active Role
                  </div>
                  <div className="space-y-1">
                    {DEMO_USERS.map((demo) => (
                      <button
                        key={demo.id}
                        type="button"
                        onClick={() => {
                          switchUser(demo.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                          user.id === demo.id
                            ? "bg-indigo-600/20 text-white font-bold"
                            : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        <span className="truncate">{demo.name}</span>
                        <span className="text-[10px] text-slate-400">{demo.roleTitle.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <Link
                    href="/login"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Workspace Switcher</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
