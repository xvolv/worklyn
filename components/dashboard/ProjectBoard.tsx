"use client";

import { MoreHorizontal, Plus, MessageSquare, AlignLeft, Clock } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  DATA                                                              */
/* ------------------------------------------------------------------ */

type Task = {
  id: number;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW" | "SUCCESS" | "COMPLETED";
  comments?: number;
  attachments?: number;
  progress?: number; // 0-100
  daysLeft?: number;
  avatar: string; // initials
  avatarColor: string;
};

type Column = {
  title: string;
  count: number;
  highlight?: string; // bg color for count badge
  tasks: Task[];
};

const columns: Column[] = [
  {
    title: "To Do",
    count: 4,
    tasks: [
      {
        id: 1,
        title: "Define information architecture for new mobile dashboard",
        priority: "HIGH",
        attachments: 2,
        avatar: "JD",
        avatarColor: "bg-amber-500",
      },
      {
        id: 2,
        title: "Research accessibility guidelines for dark mode palette",
        priority: "MEDIUM",
        comments: 5,
        avatar: "SM",
        avatarColor: "bg-green-500",
      },
      {
        id: 3,
        title: "Update typography scale in Figma master file",
        priority: "LOW",
        avatar: "AK",
        avatarColor: "bg-amber-500",
      },
    ],
  },
  {
    title: "In Progress",
    count: 2,
    highlight: "bg-indigo-600 text-white",
    tasks: [
      {
        id: 4,
        title: "Drafting system for atmospheric depth & tonal layering",
        priority: "HIGH",
        progress: 65,
        daysLeft: 2,
        avatar: "LP",
        avatarColor: "bg-amber-500",
      },
      {
        id: 5,
        title: "Client feedback session for the new atelier concept",
        priority: "MEDIUM",
        attachments: 12,
        avatar: "RN",
        avatarColor: "bg-rose-500",
      },
    ],
  },
  {
    title: "Done",
    count: 8,
    tasks: [
      {
        id: 6,
        title: "Initial brand exploration & discovery phase",
        priority: "SUCCESS",
        avatar: "TW",
        avatarColor: "bg-gray-700",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  HELPERS                                                           */
/* ------------------------------------------------------------------ */

const priorityStyles: Record<string, string> = {
  HIGH: "bg-red-100 text-red-600",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-blue-100 text-blue-600",
  SUCCESS: "bg-green-100 text-green-700",
  COMPLETED: "bg-gray-100 text-gray-500",
};

/* ------------------------------------------------------------------ */
/*  TASK CARD                                                         */
/* ------------------------------------------------------------------ */

const TaskCard = ({ task }: { task: Task }) => {
  const isInProgress = task.progress !== undefined;

  return (
    <div className="group rounded-xl border border-border bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-indigo-200">
      {/* Priority Badge */}
      <span
        className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${priorityStyles[task.priority]}`}
      >
        {task.priority === "SUCCESS" ? "Success" : task.priority === "COMPLETED" ? "Completed" : task.priority}
      </span>

      {/* Title */}
      <p className="mt-2.5 text-sm font-semibold leading-snug text-foreground">
        {task.title}
      </p>

      {/* Progress Bar (In Progress column only) */}
      {isInProgress && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-indigo-500"
              style={{ width: `${task.progress}%` }}
            />
          </div>
          {task.daysLeft !== undefined && (
            <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {task.daysLeft} days left
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {task.attachments !== undefined && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <AlignLeft className="h-3 w-3" />
              {task.attachments}
            </span>
          )}
          {task.comments !== undefined && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              {task.comments}
            </span>
          )}
        </div>
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white ${task.avatarColor}`}
        >
          {task.avatar}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  BOARD COLUMN                                                      */
/* ------------------------------------------------------------------ */

const BoardColumn = ({ column }: { column: Column }) => {
  return (
    <div className="flex flex-col">
      {/* Column Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-foreground">{column.title}</h3>
          <span
            className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
              column.highlight || "bg-gray-100 text-muted-foreground"
            }`}
          >
            {column.count}
          </span>
        </div>
        <button className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-3">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {/* Add Task */}
      <button className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600">
        <Plus className="h-4 w-4" />
        Add Task
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  PROJECT BOARD                                                     */
/* ------------------------------------------------------------------ */

const ProjectBoard = () => {
  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Breadcrumb & Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Projects</span>
            <span className="text-muted-foreground/50">&gt;</span>
            <span className="text-indigo-600">Workspace Redesign</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            Workspace Redesign
          </h1>
        </div>

        {/* Avatars */}
        <div className="flex items-center -space-x-2">
          {["bg-indigo-500", "bg-amber-500", "bg-rose-500"].map((c, i) => (
            <div
              key={i}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-white ${c}`}
            >
              {["AK", "SM", "LP"][i]}
            </div>
          ))}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-muted-foreground ring-2 ring-white">
            +4
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {columns.map((col) => (
          <BoardColumn key={col.title} column={col} />
        ))}
      </div>
    </div>
  );
};

export default ProjectBoard;
