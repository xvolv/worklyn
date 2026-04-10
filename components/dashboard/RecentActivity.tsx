import { MoreHorizontal } from "lucide-react";

const activities = [
  {
    type: "task",
    typeBadge: "Task",
    typeBadgeColor: "bg-indigo-50 text-indigo-600",
    avatar: "alex",
    content: (
      <>
        <span className="font-semibold text-foreground">Alex</span> completed{" "}
        <span className="font-medium text-foreground">&quot;Mobile Login&quot;</span> component
      </>
    ),
    time: "2 mins ago",
  },
  {
    type: "project",
    typeBadge: "Project",
    typeBadgeColor: "bg-amber-50 text-amber-600",
    avatar: "sarah",
    content: (
      <>
        <span className="font-semibold text-foreground">Sarah M.</span> created project{" "}
        <span className="font-medium text-foreground">&quot;Q3 Strategy&quot;</span>
      </>
    ),
    time: "45 mins ago",
  },
  {
    type: "comment",
    typeBadge: "Comment",
    typeBadgeColor: "bg-sky-50 text-sky-600",
    avatar: "jordan",
    content: (
      <>
        <span className="font-semibold text-foreground">Jordan</span> commented on{" "}
        <span className="font-medium text-foreground">Asset #442</span>
      </>
    ),
    time: "3 hours ago",
    quote:
      '"The contrast ratio needs to be at least 4.5:1 for accessibility."',
  },
  {
    type: "system",
    typeBadge: "System",
    typeBadgeColor: "bg-emerald-50 text-emerald-600",
    avatar: "system",
    content: (
      <>
        <span className="font-medium text-foreground">Weekly Summary</span> report generated
        automatically
      </>
    ),
    time: "5 hours ago",
  },
  {
    type: "deploy",
    typeBadge: "Deploy",
    typeBadgeColor: "bg-purple-50 text-purple-600",
    avatar: "maya",
    content: (
      <>
        <span className="font-semibold text-foreground">Maya R.</span> deployed{" "}
        <span className="font-medium text-foreground">v2.4.1</span> to production
      </>
    ),
    time: "Yesterday",
  },
  {
    type: "task",
    typeBadge: "Task",
    typeBadgeColor: "bg-indigo-50 text-indigo-600",
    avatar: "cameron",
    content: (
      <>
        <span className="font-semibold text-foreground">Cameron</span> moved{" "}
        <span className="font-medium text-foreground">&quot;Auth Flow&quot;</span> to review
      </>
    ),
    time: "Yesterday",
  },
];

const RecentActivity = () => {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm animate-fade-in-up animation-delay-400">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
        <button className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Activity List */}
      <div className="mt-4 space-y-0">
        {activities.map((activity, i) => (
          <div
            key={i}
            className="group flex gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/40"
          >
            {/* Avatar */}
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.avatar}`}
              alt=""
              className="h-8 w-8 shrink-0 rounded-full bg-muted"
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {activity.content}
                </p>
                <span
                  className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${activity.typeBadgeColor}`}
                >
                  {activity.typeBadge}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground/60">
                {activity.time}
              </p>
              {activity.quote && (
                <div className="mt-1.5 rounded-md border border-border bg-muted/30 px-2.5 py-1.5">
                  <p className="text-[11px] italic leading-relaxed text-muted-foreground">
                    {activity.quote}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <button className="mt-3 w-full rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        View All Activity
      </button>
    </div>
  );
};

export default RecentActivity;