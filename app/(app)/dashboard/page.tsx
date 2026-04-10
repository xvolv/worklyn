import StatsCards from "@/components/dashboard/StatsCards";
import FeaturedProject from "@/components/dashboard/FeaturedProject";
import RecentActivity from "@/components/dashboard/RecentActivity";
import UpcomingDeadlines from "@/components/dashboard/UpcomingDeadlines";
import PerformanceChart from "@/components/dashboard/PerformanceChart";

const DashboardPage = () => {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Workspace Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, Alex. Here&apos;s what&apos;s happening across your
          teams today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <StatsCards />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        {/* Left Column */}
        <div className="space-y-6">
          <FeaturedProject />

          {/* Bottom Row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
