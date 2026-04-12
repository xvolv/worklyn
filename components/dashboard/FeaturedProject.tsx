import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { FeaturedProjectData } from "./DashboardClient";

interface FeaturedProjectProps {
  data: FeaturedProjectData;
}

const FeaturedProject = ({ data }: FeaturedProjectProps) => {
  const total = data.totalTasks || 1;
  const breakdown = [
    { label: "To Do", count: data.taskBreakdown.todo, color: "bg-gray-300" },
    { label: "In Progress", count: data.taskBreakdown.inProgress, color: "bg-indigo-500" },
    { label: "Done", count: data.taskBreakdown.done, color: "bg-emerald-500" },
  ];

  return (
    <div className="relative overflow-hidden rounded-none bg-gray-800 shadow-sm animate-fade-in-up animation-delay-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5">
        <h2 className="text-sm font-semibold text-gray-200">Featured Project</h2>
      </div>

      {/* Hero Image */}
      <div className="mx-5 mt-4 mb-5 relative overflow-hidden rounded-none h-[200px]">
        <Image
          src={data.imageUrl || "/featured-project-hero.png"}
          alt={data.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Priority Project
          </p>
          <h3 className="mt-0.5 text-lg font-bold text-white">{data.name}</h3>
        </div>
      </div>

      {/* Bottom section */}
      <div className="px-6 pb-5 space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-400">Progress</span>
            <span className="font-semibold text-white">{data.progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-700"
              style={{ width: `${data.progress}%` }}
            />
          </div>
        </div>

        {/* Task breakdown bar */}
        <div className="flex h-1.5 overflow-hidden rounded-full">
          {breakdown.map((t) => (
            <div
              key={t.label}
              className={`${t.color} transition-all duration-300`}
              style={{ width: `${(t.count / total) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex items-center gap-4">
          {breakdown.map((t) => (
            <div key={t.label} className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <span className={`h-1.5 w-1.5 rounded-full ${t.color}`} />
              {t.label} ({t.count})
            </div>
          ))}
        </div>

        {/* Info row */}
        <div className="flex items-center justify-end pt-1">
          {data.dueDate && (
            <span className="text-[11px] text-gray-500">Due {data.dueDate}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedProject;
