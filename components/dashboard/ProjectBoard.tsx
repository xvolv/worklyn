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
  status: string;
  priority: string;
  dueDate: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeEmail: string | null;
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
  TODO: "text-gray-500",
  IN_PROGRESS: "text-indigo-600",
  IN_REVIEW: "text-amber-500",
  DONE: "text-emerald-500",
};

const statusBorderColors: Record<string, string> = {
  TODO: "border-gray-200",
  IN_PROGRESS: "border-indigo-500",
  IN_REVIEW: "border-amber-400",
  DONE: "border-emerald-400",
};

const priorityStyles: Record<string, string> = {
  URGENT: "bg-rose-500 text-white",
  HIGH: "bg-indigo-400 text-white",
  MEDIUM: "bg-purple-200 text-purple-800",
  LOW: "bg-gray-100 text-gray-600",
};

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return "No due date";
  const date = new Date(dateStr);
  const diff = date.getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}`;
  if (days === 1) return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}`;
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
  onUpdateStatus,
  onOpenComments,
  onDeleteTask,
  isDeleting,
  isOwner,
}: {
  task: TaskItem;
  onUpdateStatus: (taskId: string, status: TaskStatusKey) => void;
  onOpenComments: (task: TaskItem) => void;
  onDeleteTask?: (taskId: string) => void;
  isDeleting: boolean;
  isOwner: boolean;
}) => {
  return (
    <div className="flex flex-col rounded-xl bg-white p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-shadow hover:shadow-[0_4px_15px_-4px_rgba(6,81,237,0.15)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${priorityStyles[task.priority] || "bg-gray-200 text-gray-700"}`}>
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

      <h3 className="text-[17px] font-bold text-gray-900 mb-4">{task.title}</h3>

      <div className="flex items-center justify-between mt-auto">
        <div 
          className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm ${getAvatarColor(task.assigneeName)}`}
          title={task.assigneeName || "Unassigned"}
        >
          {getInitials(task.assigneeName)}
        </div>
        
        <div className="flex items-center gap-4 text-gray-400">
          <button
            onClick={() => onOpenComments(task)}
            className="flex items-center gap-1.5 text-xs font-medium hover:text-gray-600 transition-colors"
            title="Comments"
          >
            <MessageSquare className="h-4 w-4" />
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
    <div className={`relative flex flex-col rounded-xl bg-white p-4 shadow-sm border-l-[3px] ${borderColor}`}>
      <div className="flex items-start justify-between gap-3">
        {/* Avatar Placeholder */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gray-100 text-[11px] font-bold text-gray-600">
          {getInitials(task.assigneeName)}
        </div>

        <div className="flex-1 min-w-0">
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
            <Trash2 className="h-4 w-4" />
          </button>
        )}
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
  
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [commentTask, setCommentTask] = useState<{ id: string; title: string } | null>(null);

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

  const handleQuickAdd = async (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (!quickTaskTitle.trim()) return;

    setIsCreatingTask(true);
    try {
      await fetch(`/api/dashboard/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quickTaskTitle,
          projectId: projectData.id,
          priority: "MEDIUM",
          assigneeId: currentUserId,
        }),
      });
      setQuickTaskTitle("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingTask(false);
    }
  };

  if (!projectData) return null;

  return (
    <div className="mx-auto w-full max-w-[1200px] font-sans text-gray-900 pb-10">
      
      {/* Top Header matching mockup */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600/80 mb-1 block">
            Executive Overview
          </span>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {projectData.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200/60 shadow-sm">
          <button className="rounded-full bg-white px-5 py-2 text-[13px] font-bold text-gray-900 shadow-sm">
            Personal View
          </button>
          <button className="rounded-full px-5 py-2 text-[13px] font-bold text-gray-500 hover:text-gray-900 transition-colors">
            Team View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        {/* Left Column: My Tasks */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-bold text-indigo-700">
                {myTasks.length} Active
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <button className="p-1.5 hover:text-gray-900 transition-colors"><Menu className="h-5 w-5" /></button>
              <button className="p-1.5 hover:text-gray-900 transition-colors"><Filter className="h-5 w-5" /></button>
            </div>
          </div>

          {/* Quick Add Form */}
          {isOwner && (
            <div className="mb-6 flex items-center rounded-xl bg-[#F8F9FC] px-4 py-3 border border-gray-50/50">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600">
                <Plus className="h-4 w-4 text-white" />
              </div>
              <input
                type="text"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                onKeyDown={handleQuickAdd}
                placeholder="Quickly add a task to 'My Tasks'..."
                className="ml-3 flex-1 bg-transparent text-[15px] font-medium text-gray-700 outline-none placeholder:text-gray-400"
                disabled={isCreatingTask}
              />
              <button 
                onClick={handleQuickAdd}
                className="ml-4 rounded-lg bg-gray-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-300 transition-colors"
              >
                Enter to Save
              </button>
            </div>
          )}

          {/* Tasks List */}
          <div className="flex flex-col gap-4">
            {myTasks.map((task) => (
              <MyTaskCard
                key={task.id}
                task={task}
                onUpdateStatus={handleUpdateTaskStatus}
                onOpenComments={(t: TaskItem) => setCommentTask({ id: t.id, title: t.title })}
                onDeleteTask={() => setTaskToDelete(task.id)}
                isDeleting={isDeleting}
                isOwner={isOwner}
              />
            ))}
            {myTasks.length === 0 && (
              <div className="py-12 text-center text-sm font-medium text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                You have no active tasks in this project.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Team Tasks */}
        <div className="lg:col-span-1 rounded-[24px] bg-[#F2F3F8] p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[22px] font-bold text-gray-800">Team Tasks</h2>
          </div>

          <div className="flex flex-col gap-4">
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
          <div className="mt-8 overflow-hidden rounded-2xl bg-indigo-900 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=600&auto=format&fit=crop" 
              alt="Team Graphic" 
              className="w-full h-36 object-cover opacity-60" 
            />
            <div className="absolute bottom-4 left-4 right-4 z-20">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/90 mb-1">Collaborative Pulse</h4>
              <p className="text-[10px] text-white/60 leading-tight">Your team is 65% through the current sprint.</p>
            </div>
          </div>
        </div>
      </div>

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
