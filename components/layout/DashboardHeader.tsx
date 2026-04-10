"use client";
import { useSession } from "@/lib/auth/auth-client";

import { Search, Bell, MessageSquare } from "lucide-react";

const DashboardHeader = () => {
  const { data: session, isPending } = useSession();
  const userEmail = session?.user?.email;
  const avatarUrl = userEmail
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail}`
    : "";
  return (
    // the header has to be sticky to the top
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-white px-8">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search tasks, projects, or team..."
          className="h-10 w-full rounded-lg border border-border bg-muted/40 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <MessageSquare className="h-5 w-5" />
        </button>
        <button className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          Feedback
        </button>
        <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-indigo-100">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="User avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-500 to-gray-600 text-xs font-bold text-white">
              {session?.user?.name?.[0]?.toUpperCase() || "-"}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
