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

type TaskPriority = "High" | "Medium" | "Low";
type TaskStatus = "To Do" | "In Progress" | "Done";

type TaskItem = {
  id: string;
  title: string;
  project: string;
  assignee: { initials: string; color: string };
  due: string;
  priority: TaskPriority;
  status: TaskStatus;
  completed: boolean;
};

const priorityStyles: Record<TaskPriority, string> = {
  High: "bg-red-50 text-red-700 border-red-100",
  Medium: "bg-amber-50 text-amber-700 border-amber-100",
  Low: "bg-blue-50 text-blue-700 border-blue-100",
};

const statusStyles: Record<TaskStatus, string> = {
  "To Do": "bg-slate-50 text-slate-700 border-slate-200",
  "In Progress": "bg-indigo-50 text-indigo-700 border-indigo-100",
  Done: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

const seedTasks: TaskItem[] = [
  {
    id: "T-1042",
    title: "Design tasks page table + filters",
    project: "Workspace Redesign",
    assignee: { initials: "AK", color: "bg-indigo-600" },
    due: "Tomorrow",
    priority: "High",
    status: "In Progress",
    completed: false,
  },
  {
    id: "T-1043",
    title: "Implement status chips + sort interactions",
    project: "Workspace Redesign",
    assignee: { initials: "SM", color: "bg-amber-500" },
    due: "Fri",
    priority: "Medium",
    status: "To Do",
    completed: false,
  },
  {
    id: "T-1044",
    title: "Hook tasks to API + prisma model",
    project: "Core Platform",
    assignee: { initials: "LP", color: "bg-rose-500" },
    due: "Next week",
    priority: "High",
    status: "To Do",
    completed: false,
  },
  {
    id: "T-1045",
    title: "Review accessibility for table contrast",
    project: "Design System",
    assignee: { initials: "TW", color: "bg-slate-700" },
    due: "Today",
    priority: "Low",
    status: "Done",
    completed: true,
  },
];

const TasksPageClient = () => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TaskStatus | "All">("All");
  const [priority, setPriority] = useState<TaskPriority | "All">("All");
  const [tasks, setTasks] = useState<TaskItem[]>(seedTasks);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.project.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);
      const matchesStatus = status === "All" || t.status === status;
      const matchesPriority = priority === "All" || t.priority === priority;
      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [tasks, query, status, priority]);

  const toggleCompleted = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      ),
    );
  };

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
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            New Task
          </button>
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
        {([
          "All",
          "To Do",
          "In Progress",
          "Done",
        ] as const).map((s) => {
          const active = status === s;
          return (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`h-9 rounded-xl border px-3 text-sm font-semibold transition-colors ${
                active
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-border bg-white text-muted-foreground hover:bg-muted"
              }`}
            >
              {s}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          {(["All", "High", "Medium", "Low"] as const).map((p) => {
            const active = priority === p;
            return (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`h-9 rounded-xl border px-3 text-sm font-semibold transition-colors ${
                  active
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-border bg-white text-muted-foreground hover:bg-muted"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="grid grid-cols-[120px_1fr_170px_120px_120px_110px] items-center gap-4 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <div>ID</div>
          <div>Task</div>
          <div>Project</div>
          <div>Assignee</div>
          <div>Due</div>
          <div className="text-right">Status</div>
        </div>

        <div className="divide-y divide-border">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="grid grid-cols-[120px_1fr_170px_120px_120px_110px] items-center gap-4 px-5 py-4"
            >
              <div className="text-sm font-semibold text-muted-foreground">
                {t.id}
              </div>

              <div className="min-w-0">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleCompleted(t.id)}
                    className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md border ${
                      t.completed
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
                        t.completed
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      }`}
                    >
                      {t.title}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex h-6 items-center rounded-full border px-2 text-xs font-semibold ${
                          priorityStyles[t.priority]
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm font-semibold text-foreground">
                {t.project}
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${t.assignee.color}`}
                >
                  {t.assignee.initials}
                </div>
              </div>

              <div className="text-sm font-semibold text-muted-foreground">
                {t.due}
              </div>

              <div className="flex justify-end">
                <span
                  className={`inline-flex h-7 items-center rounded-full border px-2 text-xs font-semibold ${
                    statusStyles[t.status]
                  }`}
                >
                  {t.status}
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-sm font-medium text-muted-foreground">
              No tasks match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksPageClient;
