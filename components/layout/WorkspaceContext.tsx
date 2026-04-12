"use client";

import { createContext, useContext } from "react";

export type WorkspaceContextValue = {
  id: string;
  name: string;
  slug: string;
  inviteCode: string;
  role: string; // "OWNER" | "MEMBER"
};

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  value,
  children,
}: {
  value: WorkspaceContextValue;
  children: React.ReactNode;
}) {
  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return ctx;
}
