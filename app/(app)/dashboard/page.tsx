"use client";

import { useSession } from "@/lib/auth/auth-client";
import StatsCards from "@/components/dashboard/StatsCards";
import FeaturedProject from "@/components/dashboard/FeaturedProject";
import RecentActivity from "@/components/dashboard/RecentActivity";
import UpcomingDeadlines from "@/components/dashboard/UpcomingDeadlines";
import PerformanceChart from "@/components/dashboard/PerformanceChart";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

const DashboardPage = () => {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Welcome Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {getGreeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDate()} — here&apos;s what&apos;s happening across your workspace.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">
        {/* Left Column */}
        <div className="space-y-5">
          <FeaturedProject />

          {/* Bottom Row */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <UpcomingDeadlines />
            <PerformanceChart />
          </div>
        </div>

        {/* Right Column */}
        <RecentActivity />
      </div>
    </div>
  );
};

export default DashboardPage;
