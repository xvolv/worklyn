import { CalendarClock } from "lucide-react";

const deadlines = [
  {
    title: "UI Audit Report",
    date: "Tomorrow, 10:00 AM",
    dotColor: "bg-red-500",
  },
  {
    title: "User Testing Phase 1",
    date: "Oct 24, 2023",
    dotColor: "bg-orange-500",
  },
];

const UpcomingDeadlines = () => {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
          <CalendarClock className="h-4 w-4" />
        </div>
        <h3 className="text-[15px] font-bold text-foreground">
          Upcoming Deadlines
        </h3>
      </div>

      {/* List */}
      <div className="mt-5 space-y-4">
        {deadlines.map((d) => (
          <div key={d.title} className="flex items-start gap-3">
            <div
              className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${d.dotColor}`}
            />
            <div>
              <p className="text-sm font-semibold text-foreground">{d.title}</p>
              <p className="text-xs text-muted-foreground">{d.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingDeadlines;
