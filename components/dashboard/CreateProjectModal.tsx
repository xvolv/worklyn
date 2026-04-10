"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Folder,
  Calendar,
  FileText,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/components/layout/WorkspaceContext";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
}: CreateProjectModalProps) {
  const router = useRouter();
  const workspace = useWorkspace();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "ARCHIVED">("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Focus the name input when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setTimeout(() => nameInputRef.current?.focus(), 100);
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
      setName("");
      setDescription("");
      setDueDate("");
      setStatus("ACTIVE");
      setError(null);
      setSuccess(false);
      setIsClosing(false);
      onClose();
    }, 200);
  }, [isSubmitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Project name is required");
      nameInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/dashboard/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          dueDate: dueDate || null,
          status,
          workspaceId: workspace.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create project");
      }

      setSuccess(true);

      // Brief success animation, then close
      setTimeout(() => {
        router.refresh();
        handleClose();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const nameCharCount = name.trim().length;

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
                Project Created!
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Redirecting to dashboard...
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
                  New Project
                </h2>
                <p className="text-xs text-muted-foreground">
                  Create a new project in{" "}
                  <span className="font-medium text-indigo-600">
                    {workspace.name}
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
              {/* Project Name */}
              <div>
                <label
                  htmlFor="project-name"
                  className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
                >
                  <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                  Project Name
                  <span className="text-red-500">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Website Redesign"
                  maxLength={100}
                  className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  disabled={isSubmitting}
                />
                <div className="mt-1 flex justify-end">
                  <span
                    className={`text-[11px] ${
                      nameCharCount > 80
                        ? "text-amber-500"
                        : "text-muted-foreground/50"
                    }`}
                  >
                    {nameCharCount}/100
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="project-description"
                  className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
                >
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  Description
                  <span className="text-xs font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="project-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the project goals and scope..."
                  rows={3}
                  maxLength={500}
                  className="w-full resize-none rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  disabled={isSubmitting}
                />
              </div>

              {/* Due Date & Status — side by side */}
              <div className="grid grid-cols-2 gap-3">
                {/* Due Date */}
                <div>
                  <label
                    htmlFor="project-due-date"
                    className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
                  >
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    Due Date
                  </label>
                  <input
                    id="project-due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm text-foreground transition-all focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="project-status"
                    className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
                  >
                    Status
                  </label>
                  <select
                    id="project-status"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "ACTIVE" | "ARCHIVED")
                    }
                    className="h-10 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm text-foreground transition-all focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    disabled={isSubmitting}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
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
                disabled={isSubmitting || !name.trim()}
                className="flex h-10 items-center gap-2 rounded-lg bg-gray-800 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
