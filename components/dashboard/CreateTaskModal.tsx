"use client";

import { useState, useRef, useEffect, useCallback, useContext } from "react";
import {
  X,
  ListTodo,
  Calendar,
  Loader2,
  Sparkles,
  CheckCircle2,
  Flag,
  ChevronDown,
  UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { WorkspaceContext } from "@/components/layout/WorkspaceContext";

type TaskStatusKey = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
type PriorityKey = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type WorkspaceMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
};

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  defaultStatus: TaskStatusKey;
  workspaceSlug?: string;
}

const statusOptions: { key: TaskStatusKey; label: string }[] = [
  { key: "TODO", label: "To Do" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "IN_REVIEW", label: "In Review" },
  { key: "DONE", label: "Done" },
];

const priorityOptions: { key: PriorityKey; label: string }[] = [
  { key: "LOW", label: "Low" },
  { key: "MEDIUM", label: "Medium" },
  { key: "HIGH", label: "High" },
  { key: "URGENT", label: "Urgent" },
];

const avatarColors = [
  "bg-indigo-500", "bg-amber-500", "bg-rose-500", "bg-emerald-500",
  "bg-sky-500", "bg-purple-500", "bg-teal-500", "bg-orange-500",
];

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string): string {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  defaultStatus,
  workspaceSlug,
}: CreateTaskModalProps) {
  const router = useRouter();
  const ctx = useContext(WorkspaceContext);
  
  const effectiveSlug = workspaceSlug || ctx?.slug;
  const titleInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatusKey>(defaultStatus);
  const [priority, setPriority] = useState<PriorityKey>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Fetch workspace members when modal opens
  useEffect(() => {
    if (isOpen && members.length === 0 && effectiveSlug) {
      setLoadingMembers(true);
      fetch(`/api/workspace/${effectiveSlug}/members`)
        .then((res) => res.json())
        .then((data) => {
          if (data.members) setMembers(data.members);
        })
        .catch(() => {})
        .finally(() => setLoadingMembers(false));
    }
  }, [isOpen, effectiveSlug, members.length]);

  // Reset the default status when it changes
  useEffect(() => {
    if (isOpen) {
      setStatus(defaultStatus);
    }
  }, [defaultStatus, isOpen]);

  // Focus the title input when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    setIsClosing(true);
    setTimeout(() => {
      setTitle("");
      setPriority("MEDIUM");
      setDueDate("");
      setAssigneeId("");
      setError(null);
      setSuccess(false);
      setIsClosing(false);
      onClose();
    }, 200);
  }, [isSubmitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Task title is required");
      titleInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/dashboard/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          projectId,
          status,
          priority,
          dueDate: dueDate || null,
          assigneeId: assigneeId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create task");
      }

      setSuccess(true);

      setTimeout(() => {
        router.refresh();
        handleClose();
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const titleCharCount = title.trim().length;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-[3px] transition-opacity duration-200 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className={`relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-200 ${
            isClosing
              ? "scale-95 opacity-0"
              : "scale-100 opacity-100 animate-modal-in"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success Overlay */}
          {success && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm animate-modal-in">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 animate-bounce" />
              </div>
              <p className="mt-4 text-lg font-semibold text-foreground">
                Task Created!
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Added to {projectName}
              </p>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                <Sparkles className="h-[18px] w-[18px] text-indigo-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  New Task
                </h2>
                <p className="text-xs text-muted-foreground">
                  Add to{" "}
                  <span className="font-medium text-indigo-600">
                    {projectName}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5">
            {/* Error Banner */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fade-in-up">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Task Title */}
              <div>
                <label
                  htmlFor="task-title"
                  className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
                >
                  <ListTodo className="h-3.5 w-3.5 text-muted-foreground" />
                  Task Title
                  <span className="text-red-500">*</span>
                </label>
                <input
                  ref={titleInputRef}
                  id="task-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Design the landing page hero section"
                  maxLength={200}
                  className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  disabled={isSubmitting}
                />
                <div className="mt-1 flex justify-end">
                  <span
                    className={`text-[11px] ${
                      titleCharCount > 160
                        ? "text-amber-500"
                        : "text-muted-foreground/50"
                    }`}
                  >
                    {titleCharCount}/200
                  </span>
                </div>
              </div>

              {/* Status + Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="task-status" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      id="task-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as TaskStatusKey)}
                      className="h-10 w-full appearance-none rounded-lg border border-border bg-muted/30 px-3 pr-8 text-sm text-foreground transition-all focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      disabled={isSubmitting}
                    >
                      {statusOptions.map((s) => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label htmlFor="task-priority" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      id="task-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as PriorityKey)}
                      className="h-10 w-full appearance-none rounded-lg border border-border bg-muted/30 px-3 pr-8 text-sm text-foreground transition-all focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      disabled={isSubmitting}
                    >
                      {priorityOptions.map((p) => (
                        <option key={p.key} value={p.key}>{p.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Assignee + Due Date */}
              <div className="grid grid-cols-2 gap-3">
                {/* Assign To */}
                <div>
                  <label htmlFor="task-assignee" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <UserCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    Assign to
                  </label>
                  <div className="relative">
                    <select
                      id="task-assignee"
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="h-10 w-full appearance-none rounded-lg border border-border bg-muted/30 px-3 pr-8 text-sm text-foreground transition-all focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      disabled={isSubmitting || loadingMembers}
                    >
                      <option value="">Unassigned</option>
                      {members.map((m) => (
                        <option key={m.userId} value={m.userId}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label htmlFor="task-due-date" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Due Date
                  </label>
                  <input
                    id="task-due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm text-foreground transition-all focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="h-10 rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="flex h-10 items-center gap-2 rounded-lg bg-gray-800 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Task"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
