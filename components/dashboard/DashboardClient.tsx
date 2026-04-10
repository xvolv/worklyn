"use client";

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

export interface DashboardStats {
  totalProjects: number;
  activeTasks: number;
  completedTasks: number;
  teamMembers: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  userName: string;
  userEmail: string;
  userImage: string | null;
  projectName: string | null;
}

export interface DeadlineItem {
  id: string;
  title: string;
  projectName: string;
  dueDate: string;
  urgency: "overdue" | "urgent" | "soon" | "upcoming";
  priority: string;
}

export interface PerformanceDataPoint {
  day: string;
  tasks: number;
  completed: number;
}

export interface FeaturedProjectData {
  id: string;
  name: string;
  description: string | null;
  progress: number;
  dueDate: string | null;
  imageUrl: string | null;
  taskBreakdown: { todo: number; inProgress: number; done: number };
  totalTasks: number;
}

interface DashboardClientProps {
  userName: string;
  stats: DashboardStats;
  activities: ActivityItem[];
  deadlines: DeadlineItem[];
  performanceData: PerformanceDataPoint[];
  featuredProject: FeaturedProjectData | null;
}

export default function DashboardClient({
  userName,
  stats,
  activities,
  deadlines,
  performanceData,
  featuredProject,
}: DashboardClientProps) {
  const firstName = userName.split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Welcome Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {getGreeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDate()} {" "} here&apos;s what&apos;s happening across your workspace.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards data={stats} />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">
        {/* Left Column */}
        <div className="space-y-5">
          {featuredProject && <FeaturedProject data={featuredProject} />}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <UpcomingDeadlines data={deadlines} />
            <PerformanceChart initialData={performanceData} />
          </div>
        </div>

        {/* Right Column */}
        <RecentActivity data={activities} />
      </div>
    </div>
  );
}
