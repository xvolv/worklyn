import { BarChart3 } from "lucide-react";

const bars = [
  { height: 55, day: "M" },
  { height: 35, day: "T" },
  { height: 75, day: "W" },
  { height: 45, day: "T" },
  { height: 85, day: "F" },
  { height: 60, day: "S" },
  { height: 40, day: "S" },
];

const PerformanceChart = () => {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
          <BarChart3 className="h-4 w-4" />
        </div>
        <h3 className="text-[15px] font-bold text-foreground">Performance</h3>
      </div>

      {/* Bar Chart */}
      <div className="mt-5 flex items-end justify-between gap-2 h-[100px]">
        {bars.map((bar, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full max-w-[28px] rounded-t-md bg-indigo-500/80 transition-all hover:bg-indigo-600"
              style={{ height: `${bar.height}%` }}
            />
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Activity levels (Last 7 Days)
      </p>
    </div>
  );
};

export default PerformanceChart;
