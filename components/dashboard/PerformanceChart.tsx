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
import type { PerformanceDataPoint } from "./DashboardClient";
import { useWorkspace } from "@/components/layout/WorkspaceContext";

const ranges = ["7D", "30D", "90D"] as const;
type RangeKey = (typeof ranges)[number];

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
        {payload[1] && (
          <p className="text-xs">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-1.5" />
            Done: <span className="font-semibold">{payload[1]?.value}</span>
          </p>
        )}
      </div>
    </div>
  );
};

interface PerformanceChartProps {
  initialData: PerformanceDataPoint[];
}

const PerformanceChart = ({ initialData }: PerformanceChartProps) => {
  const workspace = useWorkspace();
  const [activeRange, setActiveRange] = useState<RangeKey>("7D");
  const [chartData, setChartData] = useState<PerformanceDataPoint[]>(initialData);
  const [loading, setLoading] = useState(false);

  const handleRangeChange = async (range: RangeKey) => {
    if (range === activeRange) return;
    setActiveRange(range);
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/performance?range=${range}&workspaceId=${workspace.id}`);
      if (res.ok) {
        const data = await res.json();
        setChartData(data);
      }
    } catch {
      // Keep current data on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-none border border-border bg-white p-5  animate-fade-in-up animation-delay-400">
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
              key={r}
              onClick={() => handleRangeChange(r)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                activeRange === r
                  ? "bg-foreground text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className={`mt-4 h-[200px] transition-opacity ${loading ? "opacity-50" : ""}`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
