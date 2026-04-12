"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Activity, RefreshCw } from "lucide-react";
import type { ActivityItem } from "./DashboardClient";

const typeBadgeConfig: Record<string, { label: string; color: string }> = {
  TASK_COMPLETED: { label: "Task", color: "bg-indigo-50 text-indigo-600" },
  PROJECT_CREATED: { label: "Project", color: "bg-amber-50 text-amber-600" },
  COMMENT: { label: "Comment", color: "bg-sky-50 text-sky-600" },
  DEPLOY: { label: "Deploy", color: "bg-purple-50 text-purple-600" },
  SYSTEM: { label: "System", color: "bg-emerald-50 text-emerald-600" },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface RecentActivityProps {
  data: ActivityItem[];
}

const RecentActivity = ({ data }: RecentActivityProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="rounded-none border border-border bg-white p-5  animate-fade-in-up animation-delay-400">
      {/* Header */}
      <div className="flex items-center justify-between relative">
        <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className={`rounded-lg p-1 transition-colors hover:bg-muted hover:text-foreground ${menuOpen ? "bg-muted text-foreground" : "text-muted-foreground"}`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-40 z-50 rounded-lg border border-border bg-white p-1 shadow-lg animate-in fade-in zoom-in-95">
              <button 
                onClick={() => {
                  setMenuOpen(false);
                  router.refresh();
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh Feed
              </button>
            </div>
          </>
        )}
      </div>

      {/* Activity List */}
      <div className="mt-4 space-y-0 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 mb-3 border border-gray-100">
              <Activity className="h-4 w-4 text-gray-400" />
            </div>
            <h3 className="text-[13px] font-semibold text-gray-900">No recent activity</h3>
            <p className="text-[11px] text-gray-500 mt-1 max-w-[200px] leading-relaxed mx-auto">
              When your team starts creating projects and adding tasks, their actions will appear here.
            </p>
          </div>
        ) : (
        data.map((activity) => {
          const badge = typeBadgeConfig[activity.type] ?? {
            label: activity.type,
            color: "bg-gray-50 text-gray-600",
          };
          const avatarSeed = activity.userEmail || activity.userName;

          return (
            <div
              key={activity.id}
              className="group flex gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/40"
            >
              {/* Avatar */}
              <img
                src={
                  activity.userImage ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`
                }
                alt=""
                className="h-8 w-8 shrink-0 rounded-full bg-muted"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {activity.userName}
                    </span>{" "}
                    {activity.description}
                  </p>
                  <span
                    className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground/60">
                  {timeAgo(activity.createdAt)}
                  {activity.projectName && (
                    <> · {activity.projectName}</>
                  )}
                </p>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
};

export default RecentActivity;