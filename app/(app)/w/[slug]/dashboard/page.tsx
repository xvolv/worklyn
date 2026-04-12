import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getDashboardStats,
  getRecentActivity,
  getUpcomingDeadlines,
  getPerformanceData,
  getFeaturedProject,
} from "@/lib/data/dashboard";

import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin");

  const { slug } = await params;

  // Get the workspace
  const workspace = await prisma.workspace.findUnique({
    where: { slug },
  });

  if (!workspace) redirect("/workspace/new");

  const [stats, activities, deadlines, performanceData, featuredProject] =
    await Promise.all([
      getDashboardStats(workspace.id),
      getRecentActivity(workspace.id, 30),
      getUpcomingDeadlines(workspace.id, 4),
      getPerformanceData(workspace.id, "7D"),
      getFeaturedProject(workspace.id),
    ]);

  return (
    <DashboardClient
      userName={session?.user?.name ?? "there"}
      stats={stats}
      activities={activities}
      deadlines={deadlines}
      performanceData={performanceData}
      featuredProject={featuredProject}
    />
  );
}
