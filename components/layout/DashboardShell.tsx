"use client";

import { SidebarProvider, useSidebar } from "./SidebarContext";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

function ShellInner({ children }: { children: React.ReactNode }) {
  const { isOpen, width, isDragging } = useSidebar();

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Area — shifts based on sidebar width */}
      <div
        className={`flex flex-1 flex-col ${isDragging ? "" : "transition-[margin] duration-300 ease-in-out"}`}
        style={{ marginLeft: isOpen ? `${width}px` : 0 }}
      >
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ShellInner>{children}</ShellInner>
    </SidebarProvider>
  );
}
