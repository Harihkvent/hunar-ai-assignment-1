import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function getScoreBadgeColor(score: number): string {
  if (score >= 85) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (score >= 70) return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (score >= 50) return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-rose-500/15 text-rose-400 border-rose-500/30";
}

export function formatStatus(status?: string | null): string {
  if (!status) return "—";
  const formatted = status.replace(/_/g, " ").toLowerCase();
  return formatted
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getStatusBadgeColor(status: string): string {
  switch (status?.toUpperCase()) {
    case "COMPLETED":
    case "SHORTLISTED":
    case "ACTIVE":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "IN_PROGRESS":
    case "RINGING":
    case "INITIATED":
    case "SCREENING_SCHEDULED":
      return "bg-sky-500/15 text-sky-400 border-sky-500/30";
    case "NEEDS_REVIEW":
    case "PAUSED":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "REJECTED":
    case "FAILED":
    case "CANCELLED":
    case "CLOSED":
      return "bg-rose-500/15 text-rose-400 border-rose-500/30";
    case "APPLIED":
    default:
      return "bg-slate-500/15 text-slate-300 border-slate-500/30";
  }
}
