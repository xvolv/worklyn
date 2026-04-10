"use client";

import { useState } from "react";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

export type SidebarWorkspace = {
  id: string;
  name: string;
  slug: string;
  role: string;
  memberCount: number;
  projects: { id: string; name: string; status: string }[];
};

export type SidebarInvitation = {
  id: string;
  workspaceId: string;
  workspaceName: string;
  invitedByName: string;
  createdAt: string;
};

interface AppShellProps {
  workspaces: SidebarWorkspace[];
  invitations: SidebarInvitation[];
  children: React.ReactNode;
}

function ShellInner({
  workspaces,
  invitations,
  children,
}: AppShellProps) {
  const { isOpen, width, isDragging } = useSidebar();

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <DashboardSidebar workspaces={workspaces} invitations={invitations} />

      <div
        className={`flex flex-1 flex-col ${isDragging ? "" : "transition-[margin] duration-300 ease-in-out"}`}
        style={{ marginLeft: isOpen ? `${width}px` : 0 }}
      >
        <DashboardHeader invitationCount={invitations.length} />
        <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
      </div>
    </div>
  );
}

export default function AppShell(props: AppShellProps) {
  return (
    <SidebarProvider>
      <ShellInner {...props} />
    </SidebarProvider>
  );
}
