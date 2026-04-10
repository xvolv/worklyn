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
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import type { SidebarWorkspace, SidebarInvitation } from "./AppShell";

interface DashboardSidebarProps {
  workspaces: SidebarWorkspace[];
  invitations: SidebarInvitation[];
}

const cardColors = [
  "bg-indigo-500", "bg-rose-500", "bg-emerald-500", "bg-amber-500",
  "bg-sky-500", "bg-purple-500", "bg-teal-500", "bg-orange-500",
];

function getColor(name: string): string {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return cardColors[hash % cardColors.length];
}

const DashboardSidebar = ({ workspaces, invitations }: DashboardSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, width, isDragging, close, startDrag } = useSidebar();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    // Auto-expand the workspace the user is currently in
    const initial: Record<string, boolean> = {};
    for (const ws of workspaces) {
      if (pathname.startsWith(`/w/${ws.slug}`)) {
        initial[ws.id] = true;
      }
    }
    return initial;
  });
  const [showInvitations, setShowInvitations] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleInviteResponse = async (invitationId: string, action: "accept" | "decline") => {
    setRespondingTo(invitationId);
    try {
      await fetch(`/api/workspace/invitations/${invitationId}/${action}`, {
        method: "POST",
      });
      router.refresh();
    } catch {
      // silent
    } finally {
      setRespondingTo(null);
    }
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
                ? "bg-indigo-50 text-indigo-700"
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

        <div className="mx-4 h-px bg-border" />

        {/* Workspaces */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="flex items-center justify-between px-2 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Workspaces
            </span>
            <Link
              href="/workspace/new"
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Create workspace"
            >
              <Plus className="h-3.5 w-3.5" />
            </Link>
          </div>

          {workspaces.length === 0 && (
            <div className="px-2 py-4 text-center">
              <p className="text-xs text-muted-foreground">No workspaces yet</p>
              <Link
                href="/workspace/new"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <Plus className="h-3 w-3" />
                Create one
              </Link>
            </div>
          )}

          {workspaces.map((ws) => {
            const isExpanded = expanded[ws.id] ?? false;
            const isActiveWs = pathname.startsWith(`/w/${ws.slug}`);

            return (
              <div key={ws.id}>
                {/* Workspace header */}
                <button
                  onClick={() => toggleExpand(ws.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors ${
                    isActiveWs
                      ? "text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                  {ws.role === "OWNER" && (
                    <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                      own
                    </span>
                  )}
                </button>

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
                      <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
                      Dashboard
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
                      <Link
                        href={`/w/${ws.slug}/projects`}
                        className="rounded p-0.5 text-muted-foreground/60 hover:bg-muted hover:text-foreground"
                        title="New project"
                      >
                        <Plus className="h-3 w-3" />
                      </Link>
                    </div>

                    {ws.projects.length > 0 ? (
                      ws.projects.map((proj) => (
                        <Link
                          key={proj.id}
                          href={`/w/${ws.slug}/projects`}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <FolderKanban className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{proj.name}</span>
                        </Link>
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
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom section */}
        <div className="border-t border-border px-3 py-3 space-y-0.5">
          {/* Invitations */}
          {invitations.length > 0 && (
            <div>
              <button
                onClick={() => setShowInvitations(!showInvitations)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Bell className="h-[18px] w-[18px] shrink-0 text-indigo-600" />
                Invitations
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white">
                  {invitations.length}
                </span>
              </button>

              {showInvitations && (
                <div className="ml-3 mt-1 space-y-2 pb-2">
                  {invitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <p className="text-xs font-semibold text-foreground">
                        {inv.workspaceName}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
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
                  ))}
                </div>
              )}
            </div>
          )}

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
    </>
  );
};

export default DashboardSidebar;
