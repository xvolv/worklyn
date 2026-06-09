"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  Calendar,
  Clock,
  ChevronRight,
  ChevronDown,
  Trash2,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/components/layout/WorkspaceContext";
import { motion, AnimatePresence } from "framer-motion";

interface AIProjectPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GeneratedTask {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  estimatedHours: number;
  dayOffset: number;
  included?: boolean; // Client-only flag to toggle tasks
}

interface GeneratedMilestone {
  title: string;
  description: string;
  order: number;
  tasks: GeneratedTask[];
}

interface PlannedProject {
  name: string;
  description: string;
  milestones: GeneratedMilestone[];
}

const timelineOptions = [
  { value: 2, label: "2 Weeks (Rapid)" },
  { value: 4, label: "4 Weeks (Standard)" },
  { value: 8, label: "8 Weeks (Extended)" },
  { value: 12, label: "12 Weeks (Quarterly)" },
];

export default function AIProjectPlannerModal({
  isOpen,
  onClose,
}: AIProjectPlannerModalProps) {
  const router = useRouter();
  const workspace = useWorkspace();

  const [step, setStep] = useState<"INPUT" | "LOADING" | "PREVIEW" | "SUCCESS">("INPUT");
  const [prompt, setPrompt] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [loadingStepText, setLoadingStepText] = useState("Decomposing project scope...");
  const [plannedProject, setPlannedProject] = useState<PlannedProject | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // For editing the project name and description directly in preview
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && step === "INPUT") {
      setTimeout(() => promptInputRef.current?.focus(), 150);
    }
  }, [isOpen, step]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && step !== "LOADING" && !isSaving) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, step, isSaving]);

  const handleClose = () => {
    setStep("INPUT");
    setPrompt("");
    setDurationWeeks(4);
    setPlannedProject(null);
    setError(null);
    onClose();
  };

  // Simulate progress steps during AI API call to look premium
  const startLoadingAnimations = () => {
    const texts = [
      "Decomposing project scope...",
      "Drafting developmental milestones...",
      "Decomposing tasks & assigning estimated hours...",
      "Structuring timeline & priorities...",
      "Finalizing database schema configuration..."
    ];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < texts.length - 1) {
        currentIndex++;
        setLoadingStepText(texts[currentIndex]);
      }
    }, 1200);

    return () => clearInterval(interval);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setError(null);
    setStep("LOADING");
    setLoadingStepText("Connecting to Gemini AI...");
    const stopInterval = startLoadingAnimations();

    try {
      const res = await fetch("/api/dashboard/projects/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          durationWeeks,
          workspaceId: workspace.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate project plan");
      }

      const data = await res.json();
      
      // Initialize inclusion flag for UI checkbox control
      const projectWithFlags = {
        ...data.plan,
        milestones: data.plan.milestones.map((m: any) => ({
          ...m,
          tasks: m.tasks.map((t: any) => ({ ...t, included: true })),
        })),
      };

      setPlannedProject(projectWithFlags);
      setProjectName(projectWithFlags.name);
      setProjectDescription(projectWithFlags.description);
      setStep("PREVIEW");
    } catch (err: any) {
      setError(err.message || "Failed to contact Gemini planner.");
      setStep("INPUT");
    } finally {
      stopInterval();
    }
  };

  // Toggle individual task inclusion
  const handleToggleTask = (milestoneIdx: number, taskIdx: number) => {
    if (!plannedProject) return;
    const updated = { ...plannedProject };
    const task = updated.milestones[milestoneIdx].tasks[taskIdx];
    task.included = !task.included;
    setPlannedProject(updated);
  };

  // Edit task values in real time
  const handleEditTaskHours = (milestoneIdx: number, taskIdx: number, val: number) => {
    if (!plannedProject) return;
    const updated = { ...plannedProject };
    updated.milestones[milestoneIdx].tasks[taskIdx].estimatedHours = Math.max(1, val);
    setPlannedProject(updated);
  };

  const handleEditTaskTitle = (milestoneIdx: number, taskIdx: number, val: string) => {
    if (!plannedProject) return;
    const updated = { ...plannedProject };
    updated.milestones[milestoneIdx].tasks[taskIdx].title = val;
    setPlannedProject(updated);
  };

  // Save the modified plan to DB
  const handleSavePlan = async () => {
    if (!plannedProject || !projectName.trim()) return;
    setIsSaving(true);
    setError(null);

    // Filter out unincluded tasks
    const cleanedMilestones = plannedProject.milestones.map((m) => {
      // Calculate real dates based on relative offsets from today
      const today = new Date();
      
      const tasks = m.tasks
        .filter((t) => t.included !== false)
        .map((t) => {
          const taskDueDate = new Date();
          taskDueDate.setDate(today.getDate() + t.dayOffset);
          
          return {
            title: t.title,
            description: t.description,
            priority: t.priority,
            estimatedHours: t.estimatedHours,
            dueDate: taskDueDate.toISOString().split("T")[0],
          };
        });

      const milestoneDueDate = new Date();
      // Milestone due date = due date of its furthest task
      const maxOffset = m.tasks.reduce((max, t) => (t.dayOffset > max ? t.dayOffset : max), 0);
      milestoneDueDate.setDate(today.getDate() + maxOffset);

      return {
        title: m.title,
        description: m.description,
        order: m.order,
        dueDate: milestoneDueDate.toISOString().split("T")[0],
        tasks,
      };
    }).filter(m => m.tasks.length > 0); // Omit milestones with no active tasks

    const projectDueDate = new Date();
    projectDueDate.setDate(projectDueDate.getDate() + (durationWeeks * 7));

    try {
      const res = await fetch("/api/dashboard/projects/create-planned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
          dueDate: projectDueDate.toISOString().split("T")[0],
          workspaceId: workspace.id,
          milestones: cleanedMilestones,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create project");
      }

      setStep("SUCCESS");
      setTimeout(() => {
        router.refresh();
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save planned project.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[4px] transition-opacity duration-200"
        onClick={step !== "LOADING" && !isSaving ? handleClose : undefined}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`relative w-full ${
            step === "PREVIEW" ? "max-w-4xl" : "max-w-lg"
          } overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200">
                <Sparkles className="h-[18px] w-[18px] text-zinc-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {step === "PREVIEW" ? "Review Project Plan" : "Plan Project with Worklyn"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Powered by Gemini for {workspace.name}
                </p>
              </div>
            </div>
            {step !== "LOADING" && !isSaving && (
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-6">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* STAGE 1: INPUT */}
              {step === "INPUT" && (
                <motion.form
                  key="input"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleGenerate}
                  className="space-y-5"
                >
                  <div>
                    <label
                      htmlFor="ai-prompt"
                      className="mb-1.5 block text-sm font-semibold text-gray-700"
                    >
                      What are you building?
                    </label>
                    <textarea
                      ref={promptInputRef}
                      id="ai-prompt"
                      rows={4}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g. Build an Event Management Platform for a university with room bookings, email alerts, and custom approvals..."
                      className="w-full resize-none rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm placeholder:text-muted-foreground/60 transition-all focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                      maxLength={800}
                      required
                    />
                    <div className="mt-1 flex justify-between text-[11px] text-muted-foreground/60">
                      <span>Be specific about features to get better results.</span>
                      <span>{prompt.length}/800</span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      Project Timeline
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {timelineOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setDurationWeeks(opt.value)}
                          className={`flex h-11 items-center justify-center rounded-xl border text-xs font-semibold transition-all ${
                            durationWeeks === opt.value
                              ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm"
                              : "border-border hover:bg-gray-50 text-gray-600"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="h-10 rounded-xl px-4 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!prompt.trim()}
                      className="flex h-10 items-center gap-2 rounded-xl border border-zinc-300/80 bg-zinc-100 px-6 text-sm font-bold text-zinc-800 transition-all hover:bg-zinc-200/80 hover:border-zinc-400/80 disabled:opacity-50"
                    >
                      <Sparkles className="h-4 w-4 text-zinc-650" />
                      Generate Plan
                    </button>
                  </div>
                </motion.form>
              )}

              {/* STAGE 2: LOADING */}
              {step === "LOADING" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-zinc-50 border border-zinc-200">
                    <div className="absolute inset-0 rounded-full border-4 border-zinc-300/20 animate-pulse" />
                    <Loader2 className="h-10 w-10 text-zinc-500 animate-spin" />
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-gray-900">Worklyn is thinking...</h3>
                  <p className="mt-2 text-sm text-zinc-600 font-semibold animate-pulse">
                    {loadingStepText}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-xs text-center">
                    Worklyn is parsing your prompt to draft milestones, design workflows, and estimate project tasks.
                  </p>
                </motion.div>
              )}

              {/* STAGE 3: PREVIEW & CUSTOMIZE */}
              {step === "PREVIEW" && plannedProject && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
                >
                  {/* Project Details Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-border pb-5">
                    <div className="md:col-span-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="mt-1 h-10 w-full rounded-lg border border-border px-3 text-sm font-semibold focus:border-indigo-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Timeline Duration
                      </label>
                      <div className="mt-2 flex h-9 items-center gap-1.5 text-xs font-semibold text-indigo-700">
                        <Calendar className="h-4 w-4" />
                        <span>{durationWeeks} Weeks ({durationWeeks * 7} Days)</span>
                      </div>
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Project Description
                      </label>
                      <textarea
                        rows={2}
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        className="mt-1 w-full resize-none rounded-lg border border-border px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Milestones and Tasks Tree */}
                  <div>
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Generated Milestones & Tasks
                    </h3>
                    <div className="space-y-4">
                      {plannedProject.milestones.map((m, mIdx) => (
                        <div
                          key={mIdx}
                          className="rounded-xl border border-gray-100 bg-gray-50/50 p-4"
                        >
                          <div className="flex items-start justify-between mb-3 border-b border-gray-200/50 pb-2">
                            <div>
                              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                                Milestone {m.order || mIdx + 1}
                              </span>
                              <h4 className="text-sm font-bold text-gray-900 mt-0.5">
                                {m.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {m.description}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {m.tasks.map((t, tIdx) => (
                              <div
                                key={tIdx}
                                className={`flex items-center gap-3 p-2.5 rounded-lg border bg-white transition-colors ${
                                  t.included !== false
                                    ? "border-border"
                                    : "border-gray-100 opacity-50 bg-gray-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={t.included !== false}
                                  onChange={() => handleToggleTask(mIdx, tIdx)}
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />

                                <div className="flex-1 min-w-0">
                                  <input
                                    type="text"
                                    value={t.title}
                                    onChange={(e) => handleEditTaskTitle(mIdx, tIdx, e.target.value)}
                                    disabled={t.included === false}
                                    className="w-full bg-transparent text-xs font-bold text-gray-800 focus:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-300 rounded px-1.5 py-0.5"
                                  />
                                  <p className="text-[10px] text-muted-foreground truncate px-1.5">
                                    {t.description}
                                  </p>
                                </div>

                                {/* Task Details */}
                                <div className="flex items-center gap-2 text-[10px] shrink-0 font-semibold">
                                  {/* Priority indicator */}
                                  <span
                                    className={`rounded px-1.5 py-0.5 uppercase tracking-wide ${
                                      t.priority === "URGENT"
                                        ? "bg-red-50 text-red-600"
                                        : t.priority === "HIGH"
                                        ? "bg-amber-50 text-amber-600"
                                        : t.priority === "MEDIUM"
                                        ? "bg-indigo-50 text-indigo-600"
                                        : "bg-gray-50 text-gray-600"
                                    }`}
                                  >
                                    {t.priority}
                                  </span>

                                  {/* Est hours edit */}
                                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-200/60 rounded px-1.5 py-0.5">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <input
                                      type="number"
                                      value={t.estimatedHours}
                                      onChange={(e) =>
                                        handleEditTaskHours(mIdx, tIdx, parseInt(e.target.value, 10))
                                      }
                                      disabled={t.included === false}
                                      className="w-7 text-center bg-transparent focus:outline-none font-bold text-gray-700"
                                    />
                                    <span className="text-gray-400 font-normal">h</span>
                                  </div>

                                  {/* Day offset timeline */}
                                  <span className="text-gray-400 font-normal">
                                    Day {t.dayOffset}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-border flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => setStep("INPUT")}
                      className="h-10 rounded-xl px-4 text-sm font-medium text-muted-foreground hover:bg-muted"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSavePlan}
                      disabled={isSaving}
                      className="flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-6 text-sm font-bold text-white shadow-lg hover:bg-black disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving Plan...
                        </>
                      ) : (
                        "Create Project & Tasks"
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STAGE 4: SUCCESS */}
              {step === "SUCCESS" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                    <CheckCircle2 className="h-9 w-9 text-emerald-500 animate-bounce" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">Project Planned Successfully!</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Project, Milestones, and Tasks saved in workspace database.
                  </p>
                  <p className="mt-2 text-xs text-indigo-600 font-semibold animate-pulse">
                    Refreshing dashboard...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}
