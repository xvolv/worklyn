"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  ChevronRight,
  ChevronDown,
  Users,
  Settings,
  HelpCircle,
  Headphones,
  Plus,
  X,
  Building2,
  FolderKanban,
  Bell,
  Check,
  XCircle,
  Loader2,
  Activity,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  LogOut,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { useEffect } from "react";
import { useSocket } from "@/lib/socket";
import ConfirmDeleteModal from "@/components/dashboard/ConfirmDeleteModal";
import CreateTaskModal from "@/components/dashboard/CreateTaskModal";
import type { SidebarWorkspace, SidebarInvitation } from "./AppShell";

interface DashboardSidebarProps {
  workspaces: SidebarWorkspace[];
  invitations: SidebarInvitation[];
  currentUserId: string;
}

const cardColors = [
  "bg-indigo-500", "bg-rose-500", "bg-emerald-500", "bg-amber-500",
  "bg-sky-500", "bg-purple-500", "bg-teal-500", "bg-orange-500",
];

function getColor(name: string): string {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return cardColors[hash % cardColors.length];
}

const DashboardSidebar = ({ workspaces, invitations: invitationsProp, currentUserId }: DashboardSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, width, isDragging, close, startDrag } = useSidebar();
  const { on, emit } = useSocket();

  const [localInvitations, setLocalInvitations] = useState<SidebarInvitation[]>(invitationsProp);

  // Sync with prop changes
  useEffect(() => {
    setLocalInvitations(invitationsProp);
  }, [invitationsProp]);

  // Handle Socket.IO real-time updates
  useEffect(() => {
    if (currentUserId) {
      emit("join", currentUserId);
    }

    const cleanup = on("new-invitation", (inv: SidebarInvitation) => {
      setLocalInvitations(prev => {
        if (prev.some(p => p.id === inv.id)) return prev;
        return [inv, ...prev];
      });
    });

    return cleanup;
  }, [on, emit, currentUserId]);

  const ownWorkspaces = workspaces.filter(w => w.role === "OWNER");
  const joinedWorkspaces = workspaces.filter(w => w.role !== "OWNER");

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    // Auto-expand the internal workspace items the user is currently traversing
    const initial: Record<string, boolean> = {};
    for (const ws of workspaces) {
      if (pathname.startsWith(`/w/${ws.slug}`)) {
        initial[ws.id] = true;
      }
    }
    return initial;
  });

  const [showOwnWorkspaces, setShowOwnWorkspaces] = useState<boolean>(() => {
    // Auto-expand folder category if currently inside one
    return ownWorkspaces.some(ws => pathname.startsWith(`/w/${ws.slug}`)) || true; // Defaulting to true as standard UX
  });

  const [showJoinedWorkspaces, setShowJoinedWorkspaces] = useState<boolean>(() => {
    return joinedWorkspaces.some(ws => pathname.startsWith(`/w/${ws.slug}`));
  });

  const [showInvitations, setShowInvitations] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<SidebarWorkspace | null>(null);
  const [isDeletingWs, setIsDeletingWs] = useState(false);

  const [activeProjectMenu, setActiveProjectMenu] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  
  const [projectForTask, setProjectForTask] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const [workspaceToLeave, setWorkspaceToLeave] = useState<SidebarWorkspace | null>(null);
  const [isLeavingWs, setIsLeavingWs] = useState(false);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleInviteResponse = async (invitationId: string, action: "accept" | "decline") => {
    setRespondingTo(invitationId);
    try {
      await fetch(`/api/workspace/invitations/${invitationId}/${action}`, {
        method: "POST",
      });
      // Optimistically remove from state
      setLocalInvitations(prev => prev.filter(i => i.id !== invitationId));
      router.refresh();
    } catch {
      // silent
    } finally {
      setRespondingTo(null);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceToDelete) return;
    setIsDeletingWs(true);
    try {
      const res = await fetch(`/api/workspace/${workspaceToDelete.slug}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete workspace");
      
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete workspace.");
    } finally {
      setIsDeletingWs(false);
      setWorkspaceToDelete(null);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeletingProject(true);
    try {
      const res = await fetch(`/api/dashboard/projects/${projectToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      router.refresh();
    } catch (e) {
      alert("Error deleting project");
    } finally {
      setIsDeletingProject(false);
      setProjectToDelete(null);
    }
  };

  const handleLeaveWorkspace = async () => {
    if (!workspaceToLeave) return;
    setIsLeavingWs(true);
    try {
      const res = await fetch(`/api/workspace/${workspaceToLeave.slug}/members/${workspaceToLeave.membershipId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to leave workspace");
      
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to leave workspace.");
    } finally {
      setIsLeavingWs(false);
      setWorkspaceToLeave(null);
    }
  };

  // Helper renderer for individual workspaces to keep JSX clean
  const renderWorkspace = (ws: SidebarWorkspace) => {
    const isExpanded = expanded[ws.id] ?? false;
    const isActiveWs = pathname.startsWith(`/w/${ws.slug}`);

    return (
      <div key={ws.id} className="relative">
    
        <div className="group flex w-full items-center justify-between rounded-lg hover:bg-muted/50 transition-colors">
          {/* Workspace header left / click to expand */}
          <button
            onClick={() => toggleExpand(ws.id)}
            className={`flex flex-1 items-center gap-2 px-2 py-1.5 text-sm font-semibold transition-colors focus:outline-none ${
              isActiveWs
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
            <div className={`flex h-5 w-5 items-center justify-center rounded ${getColor(ws.name)}`}>
              <Building2 className="h-3 w-3 text-white" />
            </div>
            <span className="truncate">{ws.name}</span>
          </button>

          {/* Right side interactions (3 dots) */}
          <div className="relative flex items-center pr-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveMenu(activeMenu === ws.id ? null : ws.id);
              }}
              className={`rounded-md p-1 transition-colors opacity-50 hover:bg-muted-foreground/10 hover:text-foreground ${
                activeMenu === ws.id ? "text-foreground bg-muted-foreground/10" : "text-muted-foreground opacity-0 group-hover:opacity-100"
              }`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {/* Dropdown Menu */}
            {activeMenu === ws.id && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(null);
                  }}
                />
                <div className="absolute right-0 top-full mt-1 w-48 z-50 rounded-lg border border-border bg-white p-1 shadow-lg animate-in fade-in zoom-in-95">
                  {ws.role === "OWNER" && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveMenu(null);
                        // Using router.push since it's a URL-based trigger
                        router.push(`/w/${ws.slug}/projects?new=true`);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <Plus className="h-4 w-4 shrink-0" />
                      New Project
                    </button>
                  )}

                  {ws.role === "OWNER" && (
                    <>
                      <div className="my-1 h-px bg-border/60" />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveMenu(null);
                          setWorkspaceToDelete(ws);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 shrink-0" />
                        Delete Workspace
                      </button>
                    </>
                  )}

                  {ws.role !== "OWNER" && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveMenu(null);
                        setWorkspaceToLeave(ws);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      Leave Workspace
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="ml-5 border-l border-border/60 pl-2 space-y-0.5 py-1">
            <Link
              href={`/w/${ws.slug}/dashboard`}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors ${
                pathname === `/w/${ws.slug}/dashboard`
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Activity className="h-3.5 w-3.5 shrink-0" />
              Workspace Overview
            </Link>

            {/* Projects section */}
            <div className="flex items-center justify-between px-2 pt-2 pb-0.5">
              <Link
                href={`/w/${ws.slug}/projects`}
                className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  pathname === `/w/${ws.slug}/projects`
                    ? "text-indigo-600"
                    : "text-muted-foreground/70 hover:text-muted-foreground"
                }`}
              >
                Projects
              </Link>
              {ws.role === "OWNER" && (
                <Link
                  href={`/w/${ws.slug}/projects?new=true`}
                  className="rounded p-0.5 text-muted-foreground/60 hover:bg-muted hover:text-foreground"
                  title="New project"
                >
                  <Plus className="h-3 w-3" />
                </Link>
              )}
            </div>

            {ws.projects.length > 0 ? (
              ws.projects.map((proj) => (
                <div key={proj.id} className="group relative flex items-center justify-between rounded-md transition-colors hover:bg-muted">
                  <Link
                    href={`/w/${ws.slug}/projects/${proj.id}`}
                    className={`flex flex-1 items-center gap-2 px-2 py-1.5 text-[13px] font-medium transition-colors ${
                      pathname === `/w/${ws.slug}/projects/${proj.id}`
                        ? "bg-indigo-50 text-indigo-700 rounded-md"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <FolderKanban className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{proj.name}</span>
                  </Link>
                  
                  {/* Project 3-dots Menu (Only for Owners) */}
                  {ws.role === "OWNER" && (
                    <div className="relative pr-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveProjectMenu(activeProjectMenu === proj.id ? null : proj.id);
                        }}
                        className={`rounded hover:bg-muted-foreground/10 p-1 ${
                          activeProjectMenu === proj.id ? "text-foreground bg-muted-foreground/10" : "text-muted-foreground opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </button>

                      {activeProjectMenu === proj.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveProjectMenu(null);
                            }}
                          />
                          <div className="absolute right-0 top-full mt-1 w-40 z-50 rounded-lg border border-border bg-white p-1 shadow-lg animate-in fade-in zoom-in-95">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveProjectMenu(null);
                                setProjectForTask({ id: proj.id, name: proj.name, slug: ws.slug });
                                setIsTaskModalOpen(true);
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5 shrink-0" />
                              Add Task
                            </button>

                            <div className="my-1 h-px bg-border/60" />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveProjectMenu(null);
                                setProjectToDelete({ id: proj.id, name: proj.name });
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5 shrink-0" />
                              Delete Project
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="px-2 py-1 text-[11px] text-muted-foreground/60 italic">
                No projects yet
              </p>
            )}

            <Link
              href={`/w/${ws.slug}/members`}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors ${
                pathname === `/w/${ws.slug}/members`
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Users className="h-3.5 w-3.5 shrink-0" />
              Members
            </Link>

                    <Link
                      href={`/w/${ws.slug}/chat`}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors ${
                        pathname === `/w/${ws.slug}/chat`
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                      Chat
                    </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-[2px] lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-white ${
          isDragging ? "" : "transition-transform duration-300 ease-in-out"
        } ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: `${width}px` }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <Link href="/dashboard">
            <Image
              className="cursor-pointer h-8 w-32 object-cover"
              src="/logos/logo.svg"
              alt="Worklyn"
              width={128}
              height={32}
            />
            <span>
              <div className="relative left-24 w-16 border  border-gray-500 bg-red-500 text-red-500"></div>
            </span>
          </Link>
        
          <button
            onClick={close}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global nav */}
        <nav className="px-3 space-y-0.5 pb-2">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/dashboard"
                ? "bg-gray-50 text-gray-700"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <LayoutDashboard className="h-[18px] w-[18px] shrink-0" />
            Overview
          </Link>
          <Link
            href="/tasks"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/tasks"
                ? "bg-indigo-50 text-indigo-700"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <CheckSquare className="h-[18px] w-[18px] shrink-0" />
            My Tasks
          </Link>
        </nav>

        {/* Workspaces VSCode Layout */}
        <div className="flex-1 overflow-y-auto w-full flex flex-col custom-scrollbar">
          
          {/* OWN WORKSPACES */}
          {ownWorkspaces.length > 0 && (
            <div className="flex flex-col border-t border-border">
              <button
                onClick={() => setShowOwnWorkspaces(!showOwnWorkspaces)}
                className="group flex w-full items-center justify-between bg-muted/20 px-4 py-1 hover:bg-muted/50 transition-colors focus:outline-none"
              >
                <div className="flex items-center gap-1.5 focus:outline-none">
                  {showOwnWorkspaces ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                    Own Workspaces
                  </span>
                </div>
                <Link
                  href="/workspace/new"
                  className="rounded px-1.5 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                  title="Create Workspace"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Plus className="h-3 w-3" />
                </Link>
              </button>
              
              {showOwnWorkspaces && (
                <div className="px-3 py-2 space-y-1 bg-white">
                  {ownWorkspaces.map(renderWorkspace)}
                </div>
              )}
            </div>
          )}

          {/* JOINED WORKSPACES */}
          {joinedWorkspaces.length > 0 && (
            <div className="flex flex-col border-t border-border">
              <button
                onClick={() => setShowJoinedWorkspaces(!showJoinedWorkspaces)}
                className="group flex w-full items-center px-4 py-1 bg-muted/20 hover:bg-muted/50 transition-colors focus:outline-none"
              >
                <div className="flex items-center gap-1.5 focus:outline-none">
                  {showJoinedWorkspaces ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                    Joined Workspaces
                  </span>
                </div>
              </button>
              
              {showJoinedWorkspaces && (
                <div className="px-3 py-2 space-y-1 bg-white">
                  {joinedWorkspaces.map(renderWorkspace)}
                </div>
              )}
            </div>
          )}
          
          {/* Empty Space Filler (to push items up like VSCode) */}
          <div className="flex-1 bg-white border-t border-border" />
        </div>

        {/* Bottom section */}
        <div className="border-t border-border px-3 py-3 space-y-0.5">
          {/* Invitations */}
          <div>
            <button
              onClick={() => setShowInvitations(!showInvitations)}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-2">
                {showInvitations ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                )}
                <Bell className="h-[18px] w-[18px] shrink-0 text-gray-600" />
              </div>
              <span>Invitations</span>
              {localInvitations.length > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white">
                  {localInvitations.length}
                </span>
              )}
            </button>

            {showInvitations && (
              <div className="ml-3 mt-1 space-y-2 pb-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                {localInvitations.length > 0 ? (
                  localInvitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <p className="text-xs font-semibold text-foreground">
                        {inv.workspaceName}
                      </p>
                      {inv.workspaceDescription && (
                        <div className="mt-1 max-h-20 overflow-y-auto pr-1 custom-scrollbar">
                          <p className="text-[10px] text-muted-foreground italic border-l-2 border-border pl-2 py-0.5 leading-relaxed break-words">
                            "{inv.workspaceDescription}"
                          </p>
                        </div>
                      )}
                      <p className="mt-1.5 text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-indigo-400" />
                        Invited by {inv.invitedByName}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => handleInviteResponse(inv.id, "accept")}
                          disabled={respondingTo === inv.id}
                          className="flex h-7 items-center gap-1 rounded-md bg-emerald-600 px-2.5 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {respondingTo === inv.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          Accept
                        </button>
                        <button
                          onClick={() => handleInviteResponse(inv.id, "decline")}
                          disabled={respondingTo === inv.id}
                          className="flex h-7 items-center gap-1 rounded-md border border-border bg-white px-2.5 text-[11px] font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50"
                        >
                          <XCircle className="h-3 w-3" />
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-none   bg-muted/96 p-1 text-center">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      No pending invitations
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <Link
            href="/settings"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/settings"
                ? "bg-indigo-50 text-indigo-700"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Settings className="h-[18px] w-[18px] shrink-0" />
            Settings
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <HelpCircle className="h-[18px] w-[18px] shrink-0" />
            Help
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Headphones className="h-[18px] w-[18px] shrink-0" />
            Support
          </Link>
        </div>

        {/* Drag Handle */}
        <div
          className="absolute inset-y-0 -right-[3px] w-[6px] cursor-col-resize group z-40"
          onMouseDown={startDrag}
        >
          <div className="h-full w-[2px] mx-auto transition-colors group-hover:bg-indigo-400 group-active:bg-indigo-500" />
        </div>
      </aside>

      <ConfirmDeleteModal
        isOpen={!!workspaceToDelete}
        onClose={() => !isDeletingWs && setWorkspaceToDelete(null)}
        onConfirm={handleDeleteWorkspace}
        title="Delete Workspace"
        itemName={workspaceToDelete?.name}
        description="Are you absolutely sure you want to delete this workspace? All data including projects, tasks, and members will be permanently erased. This action cannot be undone."
        isDeleting={isDeletingWs}
      />

      <ConfirmDeleteModal
        isOpen={!!projectToDelete}
        onClose={() => !isDeletingProject && setProjectToDelete(null)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        itemName={projectToDelete?.name}
        description="Are you sure you want to delete this project? All associated tasks, activities, and comments will be permanently erased. This action cannot be undone."
        isDeleting={isDeletingProject}
      />

      {projectForTask && (
        <CreateTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setTimeout(() => setProjectForTask(null), 200);
          }}
          projectId={projectForTask.id}
          projectName={projectForTask.name}
          workspaceSlug={projectForTask.slug}
          defaultStatus="TODO"
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!workspaceToLeave}
        onClose={() => !isLeavingWs && setWorkspaceToLeave(null)}
        onConfirm={handleLeaveWorkspace}
        title="Leave Workspace"
        itemName={workspaceToLeave?.name}
        description="Are you sure you want to leave this workspace? You will lose access to all its projects and tasks. You will need a new invite to rejoin."
        isDeleting={isLeavingWs}
      />
    </>
  );
};

export default DashboardSidebar;
