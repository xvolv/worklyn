import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const FeaturedProject = () => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-900 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5">
        <h2 className="text-lg font-bold text-foreground">Featured Project</h2>
        <Link
          href="#"
          className="flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
        >
          View Board
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Hero Card */}
      <div className="mx-6 mt-4 mb-6 relative overflow-hidden rounded-xl h-[260px]">
        <Image
          src="/featured-project-hero.png"
          alt="Q3 Market Strategy"
          fill
          className="object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-300">
            Priority Project
          </p>
          <h3 className="mt-1 text-xl font-bold text-white">
            Q3 Market Strategy
          </h3>
          {/* Progress bar */}
          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: "65%" }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-300">65%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProject;
