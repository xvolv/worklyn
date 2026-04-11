"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  Filter,
  ListTodo,
  Loader2,
  Plus,
  Search,
  X,
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
  priority: string;
  status: string;
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

const statusIcon: Record<string, React.ReactNode> = {
  TODO: <Circle className="h-3 w-3 text-slate-400" />,
  IN_PROGRESS: <Loader2 className="h-3 w-3 text-indigo-500 animate-spin" />,
  IN_REVIEW: <Clock className="h-3 w-3 text-amber-500" />,
  DONE: <CheckCircle2 className="h-3 w-3 text-emerald-500" />,
};

const priorityDot: Record<string, string> = {
  LOW: "bg-blue-400",
  MEDIUM: "bg-amber-400",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
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

function formatDue(dateStr: string | null): { text: string; isOverdue: boolean } {
  if (!dateStr) return { text: "No date", isOverdue: false };
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < -1) return { text: `${Math.abs(days)}d overdue`, isOverdue: true };
  if (days < 0) return { text: "Yesterday", isOverdue: true };
  if (days === 0) return { text: "Today", isOverdue: false };
  if (days === 1) return { text: "Tomorrow", isOverdue: false };
  if (days <= 7) return { text: `In ${days} days`, isOverdue: false };
  return {
    text: new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    isOverdue: false,
  };
}

/* ------------------------------------------------------------------ */
/*  FILTER OPTIONS                                                    */
/* ------------------------------------------------------------------ */

const statusFilterOptions = ["All", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as const;
const priorityFilterOptions = ["All", "URGENT", "HIGH", "MEDIUM", "LOW"] as const;

type StatusFilter = (typeof statusFilterOptions)[number];
type PriorityFilter = (typeof priorityFilterOptions)[number];

/* ------------------------------------------------------------------ */
/*  STATUS DROPDOWN                                                   */
/* ------------------------------------------------------------------ */

const StatusDropdown = ({
  taskId,
  currentStatus,
  onUpdate,
}: {
  taskId: string;
  currentStatus: string;
  onUpdate: (taskId: string, newStatus: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors hover:ring-2 hover:ring-offset-1 hover:ring-indigo-200 ${
          statusStyles[currentStatus] ?? "bg-gray-50 text-gray-600 border-gray-200"
        }`}
      >
        {statusIcon[currentStatus]}
        {statusLabel[currentStatus] ?? currentStatus}
        <ChevronDown className="h-3 w-3 opacity-50" />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1 w-40 overflow-hidden rounded-xl border border-border bg-white shadow-lg animate-modal-in">
          {Object.entries(statusLabel).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                onUpdate(taskId, key);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                key === currentStatus
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {statusIcon[key]}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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
        t.project.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "All" || t.status === statusFilter;
      const matchesPriority =
        priorityFilter === "All" || t.priority === priorityFilter;
      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [initialTasks, query, statusFilter, priorityFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = initialTasks.length;
    const done = initialTasks.filter((t) => t.status === "DONE").length;
    const inProgress = initialTasks.filter((t) => t.status === "IN_PROGRESS").length;
    const overdue = initialTasks.filter((t) => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate).getTime() < Date.now() && t.status !== "DONE";
    }).length;
    return { total, done, inProgress, overdue };
  }, [initialTasks]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await fetch("/api/dashboard/tasks/" + taskId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } catch {
      // silent fail
    }
  };

  const selectedProjectName =
    projects.find((p) => p.id === selectedProjectId)?.name ?? "";

  const activeFilters =
    (statusFilter !== "All" ? 1 : 0) + (priorityFilter !== "All" ? 1 : 0);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track and manage work across all projects in this workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {projects.length > 0 && (
            <div className="flex items-center gap-0">
             
              <button
                onClick={() => setIsModalOpen(true)}
                className={`inline-flex h-10 items-center gap-2 bg-gray-800 px-4 text-sm font-semibold text-white shadow-sm hover:bg-gray-900 ${
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-none border border-border bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-none border border-border bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In Progress</p>
          <p className="mt-1 text-2xl font-bold text-indigo-600">{stats.inProgress}</p>
        </div>
        <div className="rounded-none border border-border bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completed</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{stats.done}</p>
        </div>
        <div className="rounded-none border border-border bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overdue</p>
          <p className={`mt-1 text-2xl font-bold ${stats.overdue > 0 ? "text-red-600" : "text-foreground"}`}>
            {stats.overdue}
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks by title or project..."
              className="h-10 w-full rounded-none border border-border bg-white pl-10 pr-4 text-sm text-foreground focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {activeFilters > 0 && (
            <button
              onClick={() => { setStatusFilter("All"); setPriorityFilter("All"); }}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters ({activeFilters})
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">Status</span>
          {statusFilterOptions.map((s) => {
            const active = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(active ? "All" : s)}
                className={`h-8 rounded-none border px-2.5 text-xs font-semibold transition-colors ${
                  active
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-border bg-white text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {s === "All" ? "All" : statusLabel[s] ?? s}
              </button>
            );
          })}

          <div className="h-5 w-px bg-border mx-1" />

          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">Priority</span>
          {priorityFilterOptions.map((p) => {
            const active = priorityFilter === p;
            return (
              <button
                key={p}
                onClick={() => setPriorityFilter(active ? "All" : p)}
                className={`h-8 rounded-none border px-2.5 text-xs font-semibold transition-colors ${
                  active
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-border bg-white text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {p === "All" ? "All" : priorityLabel[p] ?? p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_150px_110px_110px_130px] items-center gap-4 border-b border-border bg-muted/30 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <div>Task</div>
          <div>Project</div>
          <div>Assignee</div>
          <div>Due Date</div>
          <div className="text-right">Status</div>
        </div>

        {/* Task Rows */}
        <div className="divide-y divide-border">
          {filtered.map((t) => {
            const isDone = t.status === "DONE";
            const due = formatDue(t.dueDate);

            return (
              <div
                key={t.id}
                className={`grid grid-cols-[1fr_150px_110px_110px_130px] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/20 ${
                  isDone ? "opacity-60" : ""
                }`}
              >
                {/* Task title + priority */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleStatusChange(t.id, isDone ? "TODO" : "DONE")}
                      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors ${
                        isDone
                          ? "border-emerald-300 bg-emerald-100 text-emerald-600"
                          : "border-border bg-white text-transparent hover:border-emerald-300 hover:text-emerald-400"
                      }`}
                      aria-label="Toggle completed"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                    </button>
                    <div className="min-w-0">
                      <p
                        className={`truncate text-sm font-semibold ${
                          isDone
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }`}
                      >
                        {t.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${priorityDot[t.priority] ?? "bg-gray-400"}`} />
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {priorityLabel[t.priority] ?? t.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project */}
                <div className="truncate text-sm font-medium text-muted-foreground">
                  {t.project}
                </div>

                {/* Assignee */}
                <div className="flex items-center">
                  {t.assigneeName ? (
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white ${getAvatarColor(t.assigneeName)}`}
                      title={t.assigneeName}
                    >
                      {getInitials(t.assigneeName)}
                    </div>
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-400">
                      —
                    </div>
                  )}
                </div>

                {/* Due Date */}
                <div className={`text-sm font-medium ${due.isOverdue ? "text-red-600" : "text-muted-foreground"}`}>
                  {due.text}
                </div>

                {/* Status Dropdown */}
                <div className="flex justify-end">
                  <StatusDropdown
                    taskId={t.id}
                    currentStatus={t.status}
                    onUpdate={handleStatusChange}
                  />
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60">
                <ListTodo className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <p className="mt-4 text-sm font-semibold text-foreground">
                {initialTasks.length === 0 ? "No tasks yet" : "No tasks match your filters"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {initialTasks.length === 0
                  ? "Create your first task to start tracking work."
                  : "Try adjusting your search or filters."}
              </p>
              {initialTasks.length === 0 && projects.length > 0 && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 flex h-9 items-center gap-2 rounded-lg bg-gray-800 px-4 text-sm font-semibold text-white shadow-sm hover:bg-gray-900"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Task
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer count */}
      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {initialTasks.length} task{initialTasks.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Create Task Modal */}
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
