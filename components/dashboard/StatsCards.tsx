"use client";

import { useEffect, useState, useRef } from "react";
import {
  FolderKanban,
  Zap,
  CheckCircle2,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

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
            // ease-out cubic
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
        <linearGradient id={`spark-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#spark-${color})`} />
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

/* ─── Stats data ─── */
const stats = [
  {
    label: "Total Projects",
    value: 12,
    change: 12,
    trend: "up" as const,
    icon: FolderKanban,
    iconBg: "bg-indigo-50 text-indigo-600",
    sparkColor: "#6366f1",
    sparkData: [4, 6, 5, 8, 7, 10, 12],
  },
  {
    label: "Active Tasks",
    value: 48,
    change: 0,
    trend: "flat" as const,
    icon: Zap,
    iconBg: "bg-amber-50 text-amber-600",
    sparkColor: "#d97706",
    sparkData: [42, 45, 48, 46, 47, 48, 48],
  },
  {
    label: "Completed",
    value: 156,
    change: 24,
    trend: "up" as const,
    icon: CheckCircle2,
    iconBg: "bg-emerald-50 text-emerald-600",
    sparkColor: "#10b981",
    sparkData: [90, 105, 118, 130, 138, 147, 156],
  },
  {
    label: "Team Members",
    value: 8,
    change: -2,
    trend: "down" as const,
    icon: Users,
    iconBg: "bg-sky-50 text-sky-600",
    sparkColor: "#0ea5e9",
    sparkData: [10, 10, 9, 9, 8, 8, 8],
  },
];

const trendConfig = {
  up: { icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  down: { icon: TrendingDown, color: "text-red-500", bg: "bg-red-50" },
  flat: { icon: Minus, color: "text-gray-400", bg: "bg-gray-100" },
};

const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, i) => {
        const { value, ref } = useCountUp(stat.value);
        const tc = trendConfig[stat.trend];

        return (
          <div
            ref={ref}
            key={stat.label}
            className={`group relative overflow-hidden rounded-xl border border-border bg-white p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up animation-delay-${(i + 1) * 100}`}
          >
            {/* Top row: icon + trend */}
            <div className="flex items-center justify-between">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.iconBg}`}>
                <stat.icon className="h-[18px] w-[18px]" />
              </div>
              {stat.change !== 0 && (
                <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tc.color} ${tc.bg}`}>
                  <tc.icon className="h-3 w-3" />
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>

            {/* Value */}
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {value.toLocaleString()}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </div>
              <Sparkline data={stat.sparkData} color={stat.sparkColor} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;