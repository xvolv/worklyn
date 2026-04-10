import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const teamMembers = [
  { name: "Sarah M.", avatar: "sarah" },
  { name: "Jordan K.", avatar: "jordan" },
  { name: "Alex T.", avatar: "alex" },
  { name: "Maya R.", avatar: "maya" },
];

const taskBreakdown = [
  { label: "To Do", count: 8, color: "bg-gray-300" },
  { label: "In Progress", count: 12, color: "bg-indigo-500" },
  { label: "Done", count: 18, color: "bg-emerald-500" },
];

const FeaturedProject = () => {
  const total = taskBreakdown.reduce((s, t) => s + t.count, 0);
  const progress = Math.round(
    (taskBreakdown.find((t) => t.label === "Done")!.count / total) * 100
  );

  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-900 shadow-sm animate-fade-in-up animation-delay-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5">
        <h2 className="text-sm font-semibold text-gray-200">Featured Project</h2>
        <Link
          href="#"
          className="flex items-center gap-1 text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
        >
          View Board
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Hero Image */}
      <div className="mx-5 mt-4 mb-5 relative overflow-hidden rounded-lg h-[200px]">
        <Image
          src="/featured-project-hero.png"
          alt="Q3 Market Strategy"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent" />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Priority Project
          </p>
          <h3 className="mt-0.5 text-lg font-bold text-white">
            Q3 Market Strategy
          </h3>
        </div>
      </div>

      {/* Bottom section */}
      <div className="px-6 pb-5 space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-400">Progress</span>
            <span className="font-semibold text-white">{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Task breakdown bar */}
        <div className="flex h-1.5 overflow-hidden rounded-full">
          {taskBreakdown.map((t) => (
            <div
              key={t.label}
              className={`${t.color} transition-all duration-300`}
              style={{ width: `${(t.count / total) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex items-center gap-4">
          {taskBreakdown.map((t) => (
            <div key={t.label} className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <span className={`h-1.5 w-1.5 rounded-full ${t.color}`} />
              {t.label} ({t.count})
            </div>
          ))}
        </div>

        {/* Team + info row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex -space-x-2">
            {teamMembers.map((m) => (
              <img
                key={m.avatar}
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.avatar}`}
                alt={m.name}
                className="h-7 w-7 rounded-full ring-2 ring-gray-900"
              />
            ))}
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-700 text-[10px] font-semibold text-gray-300 ring-2 ring-gray-900">
              +3
            </div>
          </div>
          <span className="text-[11px] text-gray-500">Due Oct 30</span>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProject;
