"use client";

import { useState, useEffect } from "react";
import { Plus, MessageSquare, Paperclip, Eye, Menu, Filter, FolderKanban, ChevronDown, Trash2 } from "lucide-react";
import { useWorkspace } from "../layout/WorkspaceContext";
import { useSocket } from "@/lib/socket";
import CreateProjectModal from "./CreateProjectModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import TaskComments from "@/components/chat/TaskComments";

/* ------------------------------------------------------------------ */
/*  TYPES                                                             */
/* ------------------------------------------------------------------ */

type TaskStatusKey = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

type TaskItem = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeEmail: string | null;
  assigneeImage?: string | null;
  commentCount?: number;
  createdAt?: string;
  updatedAt?: string;
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
  project: ProjectItem;
  currentUserId: string;
}

/* ------------------------------------------------------------------ */
/*  HELPERS                                                           */
/* ------------------------------------------------------------------ */

const statusDisplay: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "Review",
  DONE: "Done",
};

const statusColors: Record<string, string> = {
  TODO: "text-gray-600",
  IN_PROGRESS: "text-gray-600",
  IN_REVIEW: "text-gray-600",
  DONE: "text-gray-600",
};

const statusBorderColors: Record<string, string> = {
  TODO: "border-gray-200",
  IN_PROGRESS: "border-gray-200",
  IN_REVIEW: "border-gray-200",
  DONE: "border-gray-200",
};

const priorityStyles: Record<string, string> = {
  URGENT: "text-gray-800",
  HIGH: "text-gray-600",
  MEDIUM: "text-gray-500",
  LOW: "text-gray-400",
};

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return "No due date";
  const date = new Date(dateStr);
  const diff = date.getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  if (days === 1) return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  if (days < 0) return `Overdue`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function getInitials(name: string | null): string {
  if (!name) return "??";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const avatarColors = [
  "bg-indigo-300",
  "bg-amber-300",
  "bg-rose-300",
  "bg-emerald-300",
  "bg-sky-300",
  "bg-purple-300",
];

function getAvatarColor(name: string | null): string {
  if (!name) return "bg-gray-300";
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

/* ------------------------------------------------------------------ */
/*  MY TASK CARD                                                      */
/* ------------------------------------------------------------------ */

const MyTaskCard = ({
  task,
  unreadCount,
  onUpdateStatus,
  onOpenComments,
  onDeleteTask,
  isDeleting,
  isOwner,
}: {
  task: TaskItem;
  unreadCount: number;
  onUpdateStatus: (taskId: string, status: TaskStatusKey) => void;
  onOpenComments: (task: TaskItem) => void;
  onDeleteTask?: (taskId: string) => void;
  isDeleting: boolean;
  isOwner: boolean;
}) => {
  return (
    <div className="flex flex-col rounded-none bg-white p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-shadow hover:shadow-[0_4px_15px_-4px_rgba(6,81,237,0.15)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-bold tracking-wider uppercase ${priorityStyles[task.priority] || "text-gray-500"}`}>
            {task.priority}
          </span>
          <span className="text-xs font-medium text-gray-500">
            {task.dueDate ? `Due ${formatDueDate(task.dueDate)}` : ""}
          </span>
        </div>
        <div className="relative">
          <select
            value={task.status}
            onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatusKey)}
            className="appearance-none rounded-full bg-gray-100 py-1 pl-3 pr-8 text-xs font-semibold text-gray-700 outline-none hover:bg-gray-200 cursor-pointer"
          >
            {Object.entries(statusDisplay).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      <h3 className="text-[17px] font-bold text-gray-900 mb-1">{task.title}</h3>
      {task.description && (
        <p className="text-[13px] text-gray-500 line-clamp-2 mb-4 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto">
        {/* <div
          className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm ${getAvatarColor(task.assigneeName)}`}
          title={task.assigneeName || "Unassigned"}
        >
          {getInitials(task.assigneeName)}
        </div> */}

        <div className="flex items-center gap-4 text-gray-400">
          <button
            onClick={() => onOpenComments(task)}
            className="flex items-center hover:text-gray-600 transition-colors relative"
            title="Comments"
          >
            <MessageSquare className="h-4 w-4" />
            {unreadCount > 0 ? (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white shadow-sm">
                {unreadCount}
              </span>
            ) : null}
          </button>
          {onDeleteTask && isOwner && (
            <button
              onClick={() => onDeleteTask(task.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Delete task"
              disabled={isDeleting}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  TEAM TASK CARD                                                    */
/* ------------------------------------------------------------------ */

const TeamTaskCard = ({
  task,
  onDeleteTask,
  isDeleting,
  isOwner,
}: {
  task: TaskItem;
  onDeleteTask?: (taskId: string) => void;
  isDeleting: boolean;
  isOwner: boolean;
}) => {
  const borderColor = statusBorderColors[task.status] || "border-gray-200";
  const stColor = statusColors[task.status] || "text-gray-500";

  return (
    // must be scrollable
    <div className={`relative flex flex-col rounded-none bg-white p-4 shadow-sm border-l-[3px] ${borderColor}  `}>
      <div className="flex items-start justify-between gap-3">
        {/* Avatar Render */}
        <img 
          src={task.assigneeImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assigneeEmail || task.assigneeName || 'user'}`} 
          alt={task.assigneeName || "Avatar"} 
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] object-cover bg-indigo-50" 
          loading="lazy"
        />

        <div className="flex-1 min-w-0 ">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[9px] font-bold uppercase tracking-wider ${stColor}`}>
              {statusDisplay[task.status] || task.status}
            </span>
            <span className="text-[10px] font-medium text-gray-400">
              {timeAgo(task.updatedAt || task.dueDate)}
            </span>
          </div>
          <h4 className="text-sm font-bold text-gray-900 leading-tight mb-2 truncate">
            {task.title}
          </h4>
          <div className="flex items-center gap-2">
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-600 uppercase tracking-widest">
              Team
            </span>
            <span className="text-[10px] italic text-gray-400 truncate">
              Assigned to {task.assigneeName || "Unassigned"}
            </span>
          </div>
        </div>
        {onDeleteTask && isOwner && (
          <button
            onClick={() => onDeleteTask(task.id)}
            disabled={isDeleting}
            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete Task"
          >
            <Trash2 className="absolute top-14 right-1 h-4 w-4  text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  KANBAN TASK CARD                                                  */
/* ------------------------------------------------------------------ */

const KanbanTaskCard = ({
  task,
  unreadCount,
  onUpdateStatus,
  onOpenComments,
  onDeleteTask,
  isOwner,
  isDeleting
}: {
  task: TaskItem;
  unreadCount: number;
  onUpdateStatus: (taskId: string, status: TaskStatusKey) => void;
  onOpenComments: (task: TaskItem) => void;
  onDeleteTask?: (taskId: string) => void;
  isOwner: boolean;
  isDeleting: boolean;
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)}
      className="bg-white p-3.5 rounded-none shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-gray-100 mb-3 cursor-grab active:cursor-grabbing hover:shadow-[0_4px_15px_-4px_rgba(6,81,237,0.15)] hover:-translate-y-0.5 transition-all animate-fade-in-up group flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold tracking-wider uppercase ${priorityStyles[task.priority] || "text-gray-500"}`}>
          {task.priority}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDeleteTask && isOwner && (
            <button onClick={() => onDeleteTask(task.id)} className="p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded transition-colors" disabled={isDeleting}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <h4 className="text-[13px] font-bold text-gray-800 leading-snug tracking-tight mt-1">{task.title}</h4>
      {task.description && (
        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mt-0.5">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-50/80">
        <div className="flex items-center gap-1.5">
          <img 
            src={task.assigneeImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assigneeEmail || task.assigneeName || 'user'}`}
            alt={task.assigneeName || "Avatar"} 
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-sm ring-2 ring-white object-cover bg-indigo-50" 
            title={task.assigneeName || "Unassigned"}
            loading="lazy"
          />
          <span className="text-[10px] font-semibold text-gray-600 truncate max-w-[90px]">
            {task.assigneeName || "Unassigned"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-gray-400">
          {task.dueDate && <span className="text-[10px] font-medium text-gray-400">{formatDueDate(task.dueDate)}</span>}
          <button onClick={() => onOpenComments(task)} className="flex items-center hover:text-gray-600 transition-colors relative" title="Comments">
            <MessageSquare className="h-3.5 w-3.5" />
            {unreadCount > 0 ? (
              <span className="absolute -top-1.5 -right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 px-0.5 text-[8px] font-bold text-white ring-1 ring-white shadow-sm">
                {unreadCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  PROJECT BOARD                                                     */
/* ------------------------------------------------------------------ */

const ProjectBoard = ({ project: initialProject, currentUserId }: ProjectBoardProps) => {
  const workspace = useWorkspace();
  const isOwner = workspace.role === "OWNER";

  const [projectData, setProjectData] = useState<ProjectItem>(initialProject);
  const [viewMode, setViewMode] = useState<"PERSONAL" | "TEAM">("PERSONAL");
  const [filterBy, setFilterBy] = useState<"ALL" | TaskStatusKey>("ALL");
  const [sortBy, setSortBy] = useState<"DEFAULT" | "DUE_DATE" | "PRIORITY">("DEFAULT");

  const [isDeleting, setIsDeleting] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [commentTask, setCommentTask] = useState<{ id: string; title: string } | null>(null);

  const [readReceipts, setReadReceipts] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`wk_read_${currentUserId}`);
      if (stored) setReadReceipts(JSON.parse(stored));
    } catch {}
  }, [currentUserId]);

  const handleOpenComments = (task: TaskItem) => {
    setCommentTask({ id: task.id, title: task.title });
    
    // Clear notification specifically for this task exactly as requested
    const count = task.commentCount || 0;
    const nextR = { ...readReceipts, [task.id]: count };
    setReadReceipts(nextR);
    try {
      localStorage.setItem(`wk_read_${currentUserId}`, JSON.stringify(nextR));
    } catch {}
  };

  const getUnreadCount = (task: TaskItem) => {
    const total = task.commentCount || 0;
    if (total === 0) return 0;
    const read = readReceipts[task.id] || 0;
    
    // Self healing: if they deleted comments and total drops below read
    if (total < read) {
      setTimeout(() => {
        setReadReceipts(prev => {
          const updated = { ...prev, [task.id]: total };
          try { localStorage.setItem(`wk_read_${currentUserId}`, JSON.stringify(updated)); } catch {}
          return updated;
        });
      }, 0);
      return 0;
    }
    return total - read;
  };

  const { on } = useSocket();

  useEffect(() => {
    const cleanupUpdated = on("task-updated", (updatedTask: TaskItem & { projectId: string }) => {
      setProjectData((prev) => {
        if (prev.id !== updatedTask.projectId) return prev;

        const taskExists = prev.tasks.some((t) => t.id === updatedTask.id);
        const newTasks = taskExists
          ? prev.tasks.map((t) => t.id === updatedTask.id ? { ...t, ...updatedTask } : t)
          : [updatedTask, ...prev.tasks];

        return { ...prev, tasks: newTasks };
      });
    });

    const cleanupDeleted = on("task-deleted", (payload: { taskId: string, projectId: string }) => {
      setProjectData((prev) => {
        if (prev.id !== payload.projectId) return prev;
        return { ...prev, tasks: prev.tasks.filter(t => t.id !== payload.taskId) };
      });
    });

    return () => {
      cleanupUpdated();
      cleanupDeleted();
    };
  }, [on]);

  // Partition logic
  const tasks = projectData.tasks || [];
  const myTasks = tasks.filter((t) => t.assigneeId === currentUserId);
  const teamTasks = tasks.filter((t) => t.assigneeId !== currentUserId);

  // Sorting and Filtering logic
  let displayMyTasks = [...myTasks];
  
  if (filterBy !== "ALL") {
    displayMyTasks = displayMyTasks.filter(t => t.status === filterBy);
  }

  if (sortBy === "DUE_DATE") {
    displayMyTasks.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  } else if (sortBy === "PRIORITY") {
    const pWeight = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    displayMyTasks.sort((a, b) => 
      (pWeight[b.priority as keyof typeof pWeight] || 0) - (pWeight[a.priority as keyof typeof pWeight] || 0)
    );
  }

  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatusKey) => {
    try {
      await fetch(`/api/dashboard/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/dashboard/tasks/${taskToDelete}`, { method: "DELETE" });
      if (!res.ok) alert("Failed to delete task");
    } catch (e) {
      alert("Error deleting task");
    } finally {
      setIsDeleting(false);
      setTaskToDelete(null);
    }
  };

  if (!projectData) return null;

  return (
    <div className="mx-auto w-full max-w-[1200px] font-sans text-gray-900 pb-10">

      {/* Top Header matching mockup */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600/80 mb-1 block">
            Executive Overview
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {projectData.name.toUpperCase() }
            </h1>
          </div>
        </div>

        <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200/60 shadow-sm">
          <button
            onClick={() => setViewMode("PERSONAL")}
            className={`rounded-full px-5 py-2 text-[13px] font-bold transition-colors ${viewMode === "PERSONAL" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
          >
            Personal View
          </button>
          <button
            onClick={() => setViewMode("TEAM")}
            className={`rounded-full px-5 py-2 text-[13px] font-bold transition-colors ${viewMode === "TEAM" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
          >
            Team View
          </button>
        </div>
      </div>

      {viewMode === "PERSONAL" && (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3 animate-fade-in-up">
          {/* Left Column: My Tasks */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-bold text-indigo-700">
                  {displayMyTasks.length} {filterBy !== "ALL" ? "Filtered" : "Active"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <button 
                  onClick={() => {
                    const nextSort = sortBy === "DEFAULT" ? "PRIORITY" : sortBy === "PRIORITY" ? "DUE_DATE" : "DEFAULT";
                    setSortBy(nextSort);
                  }}
                  className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-colors ${sortBy !== "DEFAULT" ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"}`}
                  title="Toggle Sort"
                >
                  <Menu className="h-4 w-4" />
                  <span>{sortBy === "DEFAULT" ? "Sort" : sortBy === "PRIORITY" ? "Priority" : "Due Date"}</span>
                </button>
                <button 
                  onClick={() => {
                    const statuses: ("ALL" | TaskStatusKey)[] = ["ALL", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
                    const nextIdx = (statuses.indexOf(filterBy) + 1) % statuses.length;
                    setFilterBy(statuses[nextIdx]);
                  }}
                  className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-colors ${filterBy !== "ALL" ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"}`}
                  title="Toggle Filter"
                >
                  <Filter className="h-4 w-4" />
                  <span>{filterBy === "ALL" ? "Filter" : statusDisplay[filterBy] || filterBy}</span>
                </button>
              </div>
            </div>

            {/* Tasks List */}
            <div className="flex flex-col gap-4 max-h-[calc(100vh-310px)] overflow-y-auto pr-2 pb-4 custom-scrollbar">
              {displayMyTasks.map((task) => (
                <MyTaskCard
                  key={task.id}
                  task={task}
                  unreadCount={getUnreadCount(task)}
                  onUpdateStatus={handleUpdateTaskStatus}
                  onOpenComments={() => handleOpenComments(task)}
                  onDeleteTask={() => setTaskToDelete(task.id)}
                  isDeleting={isDeleting}
                  isOwner={isOwner}
                  
                />
              ))}
              {displayMyTasks.length === 0 && (
                <div className="py-12 text-center text-sm font-medium text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  {filterBy !== "ALL" ? "No tasks match this filter." : "You have no active tasks in this project."}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Team Tasks */}
          <div className="lg:col-span-1 rounded-[24px] bg-[#F2F3F8] p-6 lg:p-8 flex flex-col max-h-[calc(100vh-140px)]">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h2 className="text-[22px] font-bold text-gray-800">Team Tasks</h2>
            </div>

            <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-2 pb-2 custom-scrollbar overflow-y-scroll ">
              {teamTasks.map((task) => (
                <TeamTaskCard
                  key={task.id}
                  task={task}
                  onDeleteTask={() => setTaskToDelete(task.id)}
                  isDeleting={false}
                  isOwner={isOwner}
                />
              ))}
              {teamTasks.length === 0 && (
                <div className="py-8 text-center text-[13px] font-medium text-gray-500">
                  No active team tasks.
                </div>
              )}
            </div>

            {/* Placeholder Graphic for UI Polish */}
            <div className="mt-6 overflow-hidden rounded-2xl bg-indigo-900 relative shrink-0">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <img
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=600&auto=format&fit=crop"
                alt="Team Graphic"
                className="w-full h-36 object-cover opacity-60"
              />
              <div className="absolute bottom-4 left-4 right-4 z-20">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/90 mb-1">Collaborative Pulse</h4>
                <p className="text-[10px] text-white/60 leading-tight">Your team is
                  {teamTasks.length} tasks away from the current sprint.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === "TEAM" && (
        <div className="flex gap-6 h-[calc(100vh-220px)] overflow-x-auto pb-4 custom-scrollbar animate-fade-in-up">
          {[
            { key: "TODO" as TaskStatusKey, label: "To Do", dot: "bg-gray-400", bg: "bg-gray-50/50" },
            { key: "IN_PROGRESS" as TaskStatusKey, label: "In Progress", dot: "bg-indigo-500", bg: "bg-indigo-50/30" },
            { key: "IN_REVIEW" as TaskStatusKey, label: "Review", dot: "bg-amber-500", bg: "bg-amber-50/30" },
            { key: "DONE" as TaskStatusKey, label: "Done", dot: "bg-emerald-500", bg: "bg-emerald-50/30" },
          ].map((col) => {
            const colTasks = tasks.filter(t => t.status === col.key);
            return (
              <div
                key={col.key}
                className={`flex-1 min-w-[280px] max-w-[350px] rounded-none p-5 flex flex-col border-x-2 border-dashed border-gray-300 ${col.bg}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId = e.dataTransfer.getData("taskId");
                  if (taskId) handleUpdateTaskStatus(taskId, col.key);
                }}
              >
                <div className="flex items-center justify-between mb-5 px-1">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-2.5 w-2.5 rounded-full shadow-sm ${col.dot}`} />
                    <h3 className="text-[14px] font-bold text-gray-800">{col.label}</h3>
                    <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-gray-500 shadow-sm border border-gray-100">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1">
                  {colTasks.map(task => (
                    <KanbanTaskCard
                      key={task.id}
                      task={task}
                      unreadCount={getUnreadCount(task)}
                      onUpdateStatus={handleUpdateTaskStatus}
                      onOpenComments={() => handleOpenComments(task)}
                      onDeleteTask={() => setTaskToDelete(task.id)}
                      isOwner={isOwner}
                      isDeleting={isDeleting}
                    />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="h-28 rounded-xl border-2 border-dashed border-gray-200/60 flex flex-col items-center justify-center text-gray-400 bg-white/30">
                      <span className="text-[11px] font-medium">Drop tasks here</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!taskToDelete}
        onClose={() => !isDeleting && setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        description="Are you sure you want to delete this task? All associated comments and activities will be permanently erased. This action cannot be undone."
        isDeleting={isDeleting}
      />

      {/* Task Comments Panel */}
      {commentTask && (
        <TaskComments
          taskId={commentTask.id}
          taskTitle={commentTask.title}
          workspaceSlug={workspace.slug}
          currentUserId={currentUserId}
          onClose={() => setCommentTask(null)}
        />
      )}
    </div>
  );
};

export default ProjectBoard;
