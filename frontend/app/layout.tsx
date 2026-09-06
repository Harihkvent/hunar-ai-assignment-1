import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../lib/auth";

export const metadata: Metadata = {
  title: "Hunar.AI — AI Hiring Assistant & Voice Screening",
  description:
    "AI-powered voice screening interview platform for HR and recruiters with automated structured evaluations and candidate scorecards.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-[#090d16] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200"
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-slate-800/60 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>Hunar.AI Voice Screening Assistant • Assignment 1</span>
              <span>FastAPI + Next.js + TypeScript + Hunar External Voice API</span>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
