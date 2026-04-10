import { CalendarClock, Clock, AlertTriangle } from "lucide-react";
import type { DeadlineItem } from "./DashboardClient";

const urgencyConfig = {
  overdue: { dot: "bg-red-600", label: "Overdue", labelColor: "bg-red-50 text-red-600" },
  urgent: { dot: "bg-red-500", label: "Urgent", labelColor: "bg-red-50 text-red-600" },
  soon: { dot: "bg-amber-500", label: "Soon", labelColor: "bg-amber-50 text-amber-600" },
  upcoming: { dot: "bg-sky-500", label: "", labelColor: "" },
};

interface UpcomingDeadlinesProps {
  data: DeadlineItem[];
}

const UpcomingDeadlines = ({ data }: UpcomingDeadlinesProps) => {
  return (
    <div className="rounded-none border border-border bg-white p-5  animate-fade-in-up animation-delay-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <CalendarClock className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Upcoming Deadlines
          </h3>
        </div>
        {data.length > 0 && (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
            {data.length} pending
          </span>
        )}
      </div>

      {/* List */}
      <div className="mt-4 space-y-1">
        {data.map((d) => {
          const uc = urgencyConfig[d.urgency];
          return (
            <div
              key={d.id}
              className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/40"
            >
              <div className={`h-2 w-2 shrink-0 rounded-full ${uc.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">
                  {d.title}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {d.projectName} · {d.dueDate}
                </p>
              </div>
              {uc.label && (
                <span
                  className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${uc.labelColor}`}
                >
                  {uc.label}
                </span>
              )}
            </div>
          );
        })}
        {data.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No upcoming deadlines
          </p>
        )}
      </div>
    </div>
  );
};

export default UpcomingDeadlines;
