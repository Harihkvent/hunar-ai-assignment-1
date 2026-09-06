"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  ArrowLeft,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Bot,
  Sliders,
  HelpCircle,
  Loader2
} from "lucide-react";
import { api } from "../../../lib/api";

export default function NewJobPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [location, setLocation] = useState("Bengaluru, India (Hybrid)");
  const [description, setDescription] = useState("");
  const [experienceMin, setExperienceMin] = useState(3);
  const [experienceMax, setExperienceMax] = useState(6);

  // Skills input
  const [requiredSkillInput, setRequiredSkillInput] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([
    "Python",
    "FastAPI",
    "PostgreSQL",
    "REST APIs"
  ]);

  const [preferredSkillInput, setPreferredSkillInput] = useState("");
  const [preferredSkills, setPreferredSkills] = useState<string[]>([
    "Docker",
    "Redis",
    "AWS"
  ]);

  // Questions
  const [questions, setQuestions] = useState<string[]>([
    "Can you describe your hands-on experience building production backend services with FastAPI and Python?",
    "How do you design database schemas and optimize SQL query execution in PostgreSQL?",
    "What is your current notice period and compensation expectation?"
  ]);
  const [newQuestionInput, setNewQuestionInput] = useState("");

  // Voice Persona Settings
  const [voicePersona, setVoicePersona] = useState("NEHA");
  const [personaName, setPersonaName] = useState("Aria");
  const [language, setLanguage] = useState("ENGLISH");
  const [syncHunarAgent, setSyncHunarAgent] = useState(true);

  const addRequiredSkill = () => {
    if (requiredSkillInput.trim() && !requiredSkills.includes(requiredSkillInput.trim())) {
      setRequiredSkills([...requiredSkills, requiredSkillInput.trim()]);
      setRequiredSkillInput("");
    }
  };

  const removeRequiredSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const addPreferredSkill = () => {
    if (preferredSkillInput.trim() && !preferredSkills.includes(preferredSkillInput.trim())) {
      setPreferredSkills([...preferredSkills, preferredSkillInput.trim()]);
      setPreferredSkillInput("");
    }
  };

  const removePreferredSkill = (skill: string) => {
    setPreferredSkills(preferredSkills.filter((s) => s !== skill));
  };

  const addQuestion = () => {
    if (newQuestionInput.trim()) {
      setQuestions([...questions, newQuestionInput.trim()]);
      setNewQuestionInput("");
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  const generateDefaultQuestionsForTitle = async () => {
    if (!title.trim()) {
      alert("Please enter a Job Title first so AI can tailor the screening questions.");
      return;
    }
    setIsGeneratingQuestions(true);
    try {
      const res = await api.generateQuestions({
        title,
        description,
        required_skills: requiredSkills,
        experience_min: experienceMin,
        experience_max: experienceMax,
      });
      if (res.recommended_questions && res.recommended_questions.length > 0) {
        setQuestions(res.recommended_questions);
      }
    } catch (e) {
      // Fallback
      setQuestions([
        `How many years of relevant experience do you have with ${requiredSkills.slice(0, 2).join(" and ") || "this tech stack"}?`,
        `Can you discuss a complex project you developed recently for a ${title} role?`,
        "What is your current notice period and target CTC?"
      ]);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg("Please fill in the job title and description.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const newJob = await api.createJob({
        title,
        department,
        location,
        description,
        experience_min: experienceMin,
        experience_max: experienceMax,
        required_skills: requiredSkills,
        preferred_skills: preferredSkills,
        interview_questions: questions,
        voice_persona: voicePersona,
        persona_name: personaName,
        language: language,
        sync_hunar_agent: syncHunarAgent,
      });

      router.push(`/jobs/${newJob.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create job.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/jobs"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Create New Job & Voice Agent
            </h1>
            <p className="text-xs text-slate-400">
              Configure hiring role details and automated AI screening questions.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all active:scale-95"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Provisioning Agent...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Save & Publish Job</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Form Sections */}
      <div className="space-y-6">
        {/* Basic Role Details */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <span>Position Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Job Title *
              </label>
              <input
                suppressHydrationWarning
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Department
              </label>
              <input
                suppressHydrationWarning
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Engineering, Product, Operations..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Location & Work Model
              </label>
              <input
                suppressHydrationWarning
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote, Bengaluru, Hybrid..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
              />
            </div>

            <div className="sm:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Min Experience (Years)
                </label>
                <input
                  suppressHydrationWarning
                  type="number"
                  min="0"
                  max="20"
                  value={experienceMin}
                  onChange={(e) => setExperienceMin(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Max Experience (Years)
                </label>
                <input
                  suppressHydrationWarning
                  type="number"
                  min="0"
                  max="30"
                  value={experienceMax}
                  onChange={(e) => setExperienceMax(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Role Description & Expectations *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe key responsibilities, team impact, and required technical proficiencies..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Skills & Tagging */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Technical Skills Matrix</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Required Core Skills
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  suppressHydrationWarning
                  type="text"
                  value={requiredSkillInput}
                  onChange={(e) => setRequiredSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRequiredSkill();
                    }
                  }}
                  placeholder="Add skill (e.g. Next.js, Python, System Design)..."
                  className="flex-1 px-3.5 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={addRequiredSkill}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {requiredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeRequiredSkill(skill)}
                      className="hover:text-rose-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Preferred / Good-to-Have Skills
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  suppressHydrationWarning
                  type="text"
                  value={preferredSkillInput}
                  onChange={(e) => setPreferredSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPreferredSkill();
                    }
                  }}
                  placeholder="Add preferred skill..."
                  className="flex-1 px-3.5 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={addPreferredSkill}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {preferredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removePreferredSkill(skill)}
                      className="hover:text-rose-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Voice Screening Questions */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Voice Screening Questions</span>
            </h3>
            <button
              type="button"
              onClick={generateDefaultQuestionsForTitle}
              disabled={isGeneratingQuestions}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingQuestions ? "animate-spin text-amber-400" : "text-indigo-400"}`} />
              <span>{isGeneratingQuestions ? "Generating AI Questions..." : "✨ Auto-Generate with AI"}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            The AI agent asks these questions one-by-one during the first-round voice phone screening.
          </p>

          <div className="space-y-2.5">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200"
              >
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-indigo-400 shrink-0">{idx + 1}.</span>
                  <span>{q}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(idx)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              suppressHydrationWarning
              type="text"
              value={newQuestionInput}
              onChange={(e) => setNewQuestionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addQuestion();
                }
              }}
              placeholder="Add custom question (e.g. Describe your experience with Microservices architecture)..."
              className="flex-1 px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
            />
            <button
              type="button"
              onClick={addQuestion}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20"
            >
              Add Question
            </button>
          </div>
        </div>

        {/* Hunar Voice Agent Persona Settings */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Hunar.AI Voice Persona Configuration</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Voice Persona Model
              </label>
              <select
                suppressHydrationWarning
                value={voicePersona}
                onChange={(e) => setVoicePersona(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
              >
                {["NEHA", "ROY", "ZOE", "SAM", "MIRA", "EESHA"].map((p) => (
                  <option key={p} value={p} className="bg-slate-900 text-white">
                    {p} (Professional Voice)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Agent Display Name
              </label>
              <input
                suppressHydrationWarning
                type="text"
                value={personaName}
                onChange={(e) => setPersonaName(e.target.value)}
                placeholder="Aria"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Conversation Language
              </label>
              <select
                suppressHydrationWarning
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
              >
                {[
                  "ENGLISH",
                  "HINDI",
                  "TAMIL",
                  "TELUGU",
                  "KANNADA",
                  "MARATHI",
                  "MALAYALAM",
                  "GUJARATI",
                  "BENGALI",
                  "SPANISH"
                ].map((l) => (
                  <option key={l} value={l} className="bg-slate-900 text-white">
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer pt-2">
            <input
              suppressHydrationWarning
              type="checkbox"
              checked={syncHunarAgent}
              onChange={(e) => setSyncHunarAgent(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
            />
            <span className="text-xs text-slate-300 font-medium">
              Automatically create & sync voice agent on Hunar.AI Voice API backend
            </span>
          </label>
        </div>
      </div>
    </form>
  );
}
