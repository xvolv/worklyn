"use client";

import { useEffect, useState, useRef } from "react";
import {
  FolderKanban,
  Zap,
  CheckCircle2,
  Users,
} from "lucide-react";
import type { DashboardStats } from "./DashboardClient";

/* ─── Animated counter hook ─── */
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

/* ─── Sparkline (tiny inline SVG) ─── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  const fillPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#spark-${color.replace("#", "")})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Card config ─── */
const cardConfig = [
  {
    key: "totalProjects" as const,
    label: "Total Projects",
    icon: FolderKanban,
    iconBg: "bg-indigo-50 text-indigo-600",
    sparkColor: "#6366f1",
  },
  {
    key: "activeTasks" as const,
    label: "Active Tasks",
    icon: Zap,
    iconBg: "bg-amber-50 text-amber-600",
    sparkColor: "#d97706",
  },
  {
    key: "completedTasks" as const,
    label: "Completed",
    icon: CheckCircle2,
    iconBg: "bg-emerald-50 text-emerald-600",
    sparkColor: "#10b981",
  },
  {
    key: "teamMembers" as const,
    label: "Team Members",
    icon: Users,
    iconBg: "bg-sky-50 text-sky-600",
    sparkColor: "#0ea5e9",
  },
];

// Generate a small fake sparkline from a value (just for visual interest)
function generateSparkData(val: number): number[] {
  const points = 7;
  const result: number[] = [];
  for (let i = 0; i < points - 1; i++) {
    // Progress from ~30% to ~90% of val, then back to val at the end
    const t = i / (points - 2); // 0 to 1
    let value = val * (0.3 + t * 0.6);
    // Add a small deterministic wiggle using sine of index
    value += val * 0.05 * Math.sin(i * 1.5);
    result.push(Math.round(value));
  }
  result.push(val); // last point = val
  return result;
}

interface StatsCardsProps {
  data: DashboardStats;
}

function StatCard({ config, value, index }: { config: typeof cardConfig[number]; value: number; index: number }) {
  const { value: animatedValue, ref } = useCountUp(value);

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-none border border-border bg-white p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up animation-delay-${(index + 1) * 100}`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.iconBg}`}>
          <config.icon className="h-[18px] w-[18px]" />
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {animatedValue.toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{config.label}</p>
        </div>
        <Sparkline data={generateSparkData(value)} color={config.sparkColor} />
      </div>
    </div>
  );
}

const StatsCards = ({ data }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cardConfig.map((config, i) => (
        <StatCard key={config.key} config={config} value={data[config.key]} index={i} />
      ))}
    </div>
  );
};

export default StatsCards;