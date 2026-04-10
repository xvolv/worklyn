"use client";

import { useState } from "react";
import { MoreHorizontal, Plus, Clock, FolderKanban, ChevronDown } from "lucide-react";
import CreateTaskModal from "./CreateTaskModal";
import CreateProjectModal from "./CreateProjectModal";

/* ------------------------------------------------------------------ */
/*  TYPES                                                             */
/* ------------------------------------------------------------------ */

type TaskStatusKey = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

type TaskItem = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assigneeName: string | null;
  assigneeEmail: string | null;
};

type ProjectItem = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress: number;
  dueDate: string | null;
  taskCount: number;
  tasks: TaskItem[];
};

interface ProjectBoardProps {
  projects: ProjectItem[];
}

/* ------------------------------------------------------------------ */
/*  HELPERS                                                           */
/* ------------------------------------------------------------------ */

const priorityStyles: Record<string, string> = {
  URGENT: "bg-red-100 text-red-600",
  HIGH: "bg-red-100 text-red-600",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-blue-100 text-blue-600",
};

const statusColumns = [
  { key: "TODO" as TaskStatusKey, title: "To Do" },
  { key: "IN_PROGRESS" as TaskStatusKey, title: "In Progress", highlight: "bg-indigo-600 text-white" },
  { key: "IN_REVIEW" as TaskStatusKey, title: "In Review", highlight: "bg-amber-500 text-white" },
  { key: "DONE" as TaskStatusKey, title: "Done" },
];

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getInitials(name: string | null): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const avatarColors = [
  "bg-indigo-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-purple-500",
  "bg-teal-500",
];

function getAvatarColor(name: string | null): string {
  if (!name) return "bg-gray-400";
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

/* ------------------------------------------------------------------ */
/*  TASK CARD                                                         */
/* ------------------------------------------------------------------ */

const TaskCard = ({ task }: { task: TaskItem }) => {
  const days = daysUntil(task.dueDate);
  const isOverdue = days !== null && days < 0;

  return (
    <div className="group rounded-xl border border-border bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-indigo-200">
      {/* Priority Badge */}
      <span
        className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
          priorityStyles[task.priority] || "bg-gray-100 text-gray-500"
        }`}
      >
        {task.priority}
      </span>

      {/* Title */}
      <p className="mt-2.5 text-sm font-semibold leading-snug text-foreground">
        {task.title}
      </p>

      {/* Due date / progress */}
      {days !== null && (
        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className={`h-3 w-3 ${isOverdue ? "text-red-500" : ""}`} />
          <span className={isOverdue ? "text-red-500 font-medium" : ""}>
            {isOverdue
              ? `${Math.abs(days)}d overdue`
              : days === 0
              ? "Due today"
              : days === 1
              ? "Due tomorrow"
              : `${days}d left`}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div />
        {task.assigneeName && (
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white ${getAvatarColor(task.assigneeName)}`}
            title={task.assigneeName}
          >
            {getInitials(task.assigneeName)}
          </div>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  BOARD COLUMN                                                      */
/* ------------------------------------------------------------------ */

const BoardColumn = ({
  title,
  highlight,
  tasks,
  onAddTask,
}: {
  title: string;
  highlight?: string;
  tasks: TaskItem[];
  onAddTask: () => void;
}) => {
  return (
    <div className="flex flex-col">
      {/* Column Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          <span
            className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
              highlight || "bg-gray-100 text-muted-foreground"
            }`}
          >
            {tasks.length}
          </span>
        </div>
        <button className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-border text-xs text-muted-foreground">
            No tasks
          </div>
        )}
      </div>

      {/* Add Task */}
      <button
        onClick={onAddTask}
        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
      >
        <Plus className="h-4 w-4" />
        Add Task
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  PROJECT BOARD                                                     */
/* ------------------------------------------------------------------ */

const ProjectBoard = ({ projects }: ProjectBoardProps) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projects[0]?.id ?? null
  );

  // Task modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalDefaultStatus, setTaskModalDefaultStatus] =
    useState<TaskStatusKey>("TODO");
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Group tasks by status for the selected project
  const tasksByStatus = statusColumns.map((col) => ({
    ...col,
    tasks: selectedProject?.tasks.filter((t) => t.status === col.key) ?? [],
  }));

  const handleAddTask = (status: TaskStatusKey) => {
    setTaskModalDefaultStatus(status);
    setIsTaskModalOpen(true);
  };

  if (projects.length === 0) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-20">
          <FolderKanban className="h-12 w-12 text-muted-foreground/30" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">No projects yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first project to start organizing tasks.
          </p>
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="mt-5 flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>
        <CreateProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Projects</span>
            <span className="text-muted-foreground/50">&gt;</span>
            <span className="text-indigo-600">{selectedProject?.name}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {selectedProject?.name ?? "Select a project"}
          </h1>
          {selectedProject?.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedProject.description}
            </p>
          )}
        </div>

        {/* Project Selector + New Project */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedProjectId ?? ""}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="appearance-none rounded-lg border border-border bg-white py-2 pl-3 pr-8 text-sm font-medium text-foreground shadow-sm transition-all focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.taskCount} tasks)
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        {tasksByStatus.map((col) => (
          <BoardColumn
            key={col.key}
            title={col.title}
            highlight={col.highlight}
            tasks={col.tasks}
            onAddTask={() => handleAddTask(col.key)}
          />
        ))}
      </div>

      {/* Create Task Modal */}
      {selectedProject && (
        <CreateTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          defaultStatus={taskModalDefaultStatus}
        />
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </div>
  );
};

export default ProjectBoard;
