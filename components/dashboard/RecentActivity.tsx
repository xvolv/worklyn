import { MoreHorizontal } from "lucide-react";

const activities = [
  {
    dotColor: "bg-indigo-500",
    content: (
      <>
        <span className="font-semibold">Alex</span> completed{" "}
        <span className="font-semibold">&quot;Mobile Login&quot;</span> component
      </>
    ),
    time: "2 mins ago",
  },
  {
    dotColor: "bg-orange-400",
    content: (
      <>
        New project <span className="font-semibold">&quot;Q3 Strategy&quot;</span>{" "}
        was created by <span className="font-semibold">Sarah M.</span>
      </>
    ),
    time: "45 mins ago",
  },
  {
    dotColor: "bg-gray-400",
    content: (
      <>
        <span className="font-semibold">Jordan</span> left a comment on{" "}
        <span className="font-semibold">Asset #442</span>
      </>
    ),
    time: "3 hours ago",
    quote:
      '"The contrast ratio needs to be at least 4.5:1 for accessibility."',
  },
  {
    dotColor: "bg-green-500",
    content: (
      <>
        System update: <span className="font-semibold">Weekly Summary</span>{" "}
        report generated
      </>
    ),
    time: "5 hours ago",
  },
];

const RecentActivity = () => {
  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
        <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Activity List */}
      <div className="mt-5 space-y-5">
        {activities.map((activity, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center pt-1.5">
              <div className={`h-2 w-2 rounded-full ${activity.dotColor}`} />
              {i < activities.length - 1 && (
                <div className="mt-1 w-px flex-1 bg-border" />
              )}
            </div>
            <div className="flex-1 pb-1">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {activity.content}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/70">
                {activity.time}
              </p>
              {activity.quote && (
                <div className="mt-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                  <p className="text-xs italic leading-relaxed text-muted-foreground">
                    {activity.quote}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <button className="mt-5 w-full rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
        Load Older Activity
      </button>
    </div>
  );
};

export default RecentActivity;