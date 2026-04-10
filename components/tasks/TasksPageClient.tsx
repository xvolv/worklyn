"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import CreateTaskModal from "@/components/dashboard/CreateTaskModal";

/* ------------------------------------------------------------------ */
/*  TYPES                                                             */
/* ------------------------------------------------------------------ */

type TaskItem = {
  id: string;
  title: string;
  project: string;
  projectId: string;
  assigneeName: string | null;
  assigneeImage: string | null;
  dueDate: string | null;
  priority: string; // "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  status: string;   // "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE"
};

type ProjectOption = {
  id: string;
  name: string;
};

interface TasksPageClientProps {
  tasks: TaskItem[];
  projects: ProjectOption[];
}

/* ------------------------------------------------------------------ */
/*  DISPLAY MAPPINGS                                                  */
/* ------------------------------------------------------------------ */

const priorityLabel: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const statusLabel: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const priorityStyles: Record<string, string> = {
  LOW: "bg-blue-50 text-blue-700 border-blue-100",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-100",
  HIGH: "bg-red-50 text-red-700 border-red-100",
  URGENT: "bg-rose-50 text-rose-700 border-rose-100",
};

const statusStyles: Record<string, string> = {
  TODO: "bg-slate-50 text-slate-700 border-slate-200",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-100",
  IN_REVIEW: "bg-amber-50 text-amber-700 border-amber-100",
  DONE: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

const avatarColors = [
  "bg-indigo-600",
  "bg-amber-500",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-slate-700",
];

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string | null): string {
  if (!name) return "bg-gray-400";
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

function formatDue(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < -1) return `${Math.abs(days)}d overdue`;
  if (days < 0) return "Yesterday";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 7) return `In ${days} days`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  FILTER OPTIONS                                                    */
/* ------------------------------------------------------------------ */

const statusFilterOptions = ["All", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as const;
const priorityFilterOptions = ["All", "HIGH", "URGENT", "MEDIUM", "LOW"] as const;

type StatusFilter = (typeof statusFilterOptions)[number];
type PriorityFilter = (typeof priorityFilterOptions)[number];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                         */
/* ------------------------------------------------------------------ */

const TasksPageClient = ({ tasks: initialTasks, projects }: TasksPageClientProps) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("All");

  // New Task modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id ?? ""
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialTasks.filter((t) => {
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.project.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "All" || t.status === statusFilter;
      const matchesPriority =
        priorityFilter === "All" || t.priority === priorityFilter;
      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [initialTasks, query, statusFilter, priorityFilter]);

  const handleToggleStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";
    try {
      await fetch("/api/dashboard/tasks/" + taskId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } catch {
      // silent fail for now
    }
  };

  const selectedProjectName =
    projects.find((p) => p.id === selectedProjectId)?.name ?? "";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Workspace</span>
            <span className="text-muted-foreground/50">&gt;</span>
            <span className="text-indigo-600">Tasks</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track work across projects, owners, and due dates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-foreground shadow-sm hover:bg-muted">
            <Filter className="h-4 w-4" />
            Filters
          </button>

          {/* New Task — pick project first if multiple */}
          {projects.length > 0 && (
            <div className="flex items-center gap-0">
              {projects.length > 1 && (
                <div className="relative">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="h-10 appearance-none rounded-l-lg border border-r-0 border-border bg-white pl-3 pr-7 text-sm font-medium text-foreground shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              )}
              <button
                onClick={() => setIsModalOpen(true)}
                className={`inline-flex h-10 items-center gap-2 bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 ${
                  projects.length > 1 ? "rounded-r-lg" : "rounded-lg"
                }`}
              >
                <Plus className="h-4 w-4" />
                New Task
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks by title, project, or ID..."
            className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-sm text-foreground shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-foreground shadow-sm hover:bg-muted">
            <SlidersHorizontal className="h-4 w-4" />
            Sort
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-foreground shadow-sm hover:bg-muted">
            <Calendar className="h-4 w-4" />
            This week
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {statusFilterOptions.map((s) => {
          const active = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`h-9 rounded-xl border px-3 text-sm font-semibold transition-colors ${
                active
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-border bg-white text-muted-foreground hover:bg-muted"
              }`}
            >
              {s === "All" ? "All" : statusLabel[s] ?? s}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          {priorityFilterOptions.map((p) => {
            const active = priorityFilter === p;
            return (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`h-9 rounded-xl border px-3 text-sm font-semibold transition-colors ${
                  active
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-border bg-white text-muted-foreground hover:bg-muted"
                }`}
              >
                {p === "All" ? "All" : priorityLabel[p] ?? p}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_170px_120px_120px_110px] items-center gap-4 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <div>Task</div>
          <div>Project</div>
          <div>Assignee</div>
          <div>Due</div>
          <div className="text-right">Status</div>
        </div>

        <div className="divide-y divide-border">
          {filtered.map((t) => {
            const isDone = t.status === "DONE";
            return (
              <div
                key={t.id}
                className="grid grid-cols-[1fr_170px_120px_120px_110px] items-center gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleStatus(t.id, t.status)}
                      className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md border ${
                        isDone
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-border bg-white text-transparent hover:bg-muted"
                      }`}
                      aria-label="Toggle completed"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <div className="min-w-0">
                      <div
                        className={`truncate text-sm font-semibold ${
                          isDone
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }`}
                      >
                        {t.title}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex h-6 items-center rounded-full border px-2 text-xs font-semibold ${
                            priorityStyles[t.priority] ??
                            "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {priorityLabel[t.priority] ?? t.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-sm font-semibold text-foreground">
                  {t.project}
                </div>

                <div className="flex items-center gap-2">
                  {t.assigneeName ? (
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${getAvatarColor(
                        t.assigneeName
                      )}`}
                      title={t.assigneeName}
                    >
                      {getInitials(t.assigneeName)}
                    </div>
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-400">
                      —
                    </div>
                  )}
                </div>

                <div className="text-sm font-semibold text-muted-foreground">
                  {formatDue(t.dueDate)}
                </div>

                <div className="flex justify-end">
                  <span
                    className={`inline-flex h-7 items-center rounded-full border px-2 text-xs font-semibold ${
                      statusStyles[t.status] ??
                      "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    {statusLabel[t.status] ?? t.status}
                  </span>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-sm font-medium text-muted-foreground">
              No tasks match your filters.
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal — reuse from dashboard */}
      {selectedProjectId && (
        <CreateTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          projectId={selectedProjectId}
          projectName={selectedProjectName}
          defaultStatus="TODO"
        />
      )}
    </div>
  );
};

export default TasksPageClient;
