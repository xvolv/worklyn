"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const dailyData = [
  { day: "Mon", tasks: 12, completed: 8 },
  { day: "Tue", tasks: 18, completed: 14 },
  { day: "Wed", tasks: 15, completed: 12 },
  { day: "Thu", tasks: 22, completed: 18 },
  { day: "Fri", tasks: 28, completed: 24 },
  { day: "Sat", tasks: 14, completed: 10 },
  { day: "Sun", tasks: 8, completed: 6 },
];

const weeklyData = [
  { day: "Week 1", tasks: 68, completed: 52 },
  { day: "Week 2", tasks: 85, completed: 70 },
  { day: "Week 3", tasks: 74, completed: 62 },
  { day: "Week 4", tasks: 92, completed: 80 },
];

const monthlyData = [
  { day: "Jan", tasks: 280, completed: 220 },
  { day: "Feb", tasks: 310, completed: 265 },
  { day: "Mar", tasks: 295, completed: 240 },
  { day: "Apr", tasks: 340, completed: 290 },
  { day: "May", tasks: 320, completed: 280 },
  { day: "Jun", tasks: 360, completed: 310 },
];

const ranges = [
  { key: "7D", label: "7D", data: dailyData },
  { key: "30D", label: "30D", data: weeklyData },
  { key: "90D", label: "90D", data: monthlyData },
] as const;

type RangeKey = (typeof ranges)[number]["key"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 space-y-0.5">
        <p className="text-xs">
          <span className="inline-block h-2 w-2 rounded-full bg-indigo-500 mr-1.5" />
          Tasks: <span className="font-semibold">{payload[0]?.value}</span>
        </p>
        <p className="text-xs">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-1.5" />
          Done: <span className="font-semibold">{payload[1]?.value}</span>
        </p>
      </div>
    </div>
  );
};

const PerformanceChart = () => {
  const [activeRange, setActiveRange] = useState<RangeKey>("7D");
  const currentData = ranges.find((r) => r.key === activeRange)!.data;

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm animate-fade-in-up animation-delay-400">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Performance</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Task completion trends
          </p>
        </div>
        <div className="flex rounded-lg border border-border p-0.5">
          {ranges.map((r) => (
            <button
              key={r.key}
              onClick={() => setActiveRange(r.key)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                activeRange === r.key
                  ? "bg-foreground text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="mt-4 h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="taskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="doneGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="tasks"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#taskGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#6366f1" }}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#doneGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#10b981" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          Total Tasks
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Completed
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
