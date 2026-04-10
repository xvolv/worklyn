import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@prisma/client";

// ─── Dashboard Stats ───
export async function getDashboardStats(workspaceId: string) {
  const [totalProjects, activeTasks, completedTasks, teamMembers] =
    await Promise.all([
      prisma.project.count({ where: { workspaceId } }),
      prisma.task.count({
        where: {
          status: { not: TaskStatus.DONE },
          project: { workspaceId },
        },
      }),
      prisma.task.count({
        where: {
          status: TaskStatus.DONE,
          project: { workspaceId },
        },
      }),
      prisma.workspaceMember.count({ where: { workspaceId } }),
    ]);

  return {
    totalProjects,
    activeTasks,
    completedTasks,
    teamMembers,
  };
}

// ─── Recent Activity ───
export async function getRecentActivity(workspaceId: string, limit = 6) {
  const activities = await prisma.activity.findMany({
    where: { workspaceId },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      project: { select: { id: true, name: true } },
    },
  });

  return activities.map((a) => ({
    id: a.id,
    type: a.type,
    description: a.description,
    createdAt: a.createdAt.toISOString(),
    userName: a.user.name,
    userEmail: a.user.email,
    userImage: a.user.image,
    projectName: a.project?.name ?? null,
  }));
}

// ─── Upcoming Deadlines ───
export async function getUpcomingDeadlines(workspaceId: string, limit = 4) {
  const now = new Date();

  const tasks = await prisma.task.findMany({
    where: {
      status: { not: TaskStatus.DONE },
      dueDate: { not: null },
      project: { workspaceId },
    },
    orderBy: { dueDate: "asc" },
    take: limit,
    include: {
      project: { select: { name: true } },
    },
  });

  return tasks.map((t) => {
    const due = t.dueDate!;
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let urgency: "overdue" | "urgent" | "soon" | "upcoming";
    if (diffDays < 0) urgency = "overdue";
    else if (diffDays <= 1) urgency = "urgent";
    else if (diffDays <= 3) urgency = "soon";
    else urgency = "upcoming";

    let relativeDate: string;
    if (diffDays < 0) relativeDate = `${Math.abs(diffDays)}d overdue`;
    else if (diffDays === 0) relativeDate = "Today";
    else if (diffDays === 1) relativeDate = "Tomorrow";
    else if (diffDays <= 7) relativeDate = `In ${diffDays} days`;
    else relativeDate = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return {
      id: t.id,
      title: t.title,
      projectName: t.project.name,
      dueDate: relativeDate,
      urgency,
      priority: t.priority,
    };
  });
}

// ─── Performance Data (task completions by day) ───
export async function getPerformanceData(workspaceId: string, range: "7D" | "30D" | "90D" = "7D") {
  const now = new Date();
  const daysBack = range === "7D" ? 7 : range === "30D" ? 30 : 90;
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - daysBack);

  const allTasks = await prisma.task.findMany({
    where: {
      createdAt: { gte: startDate },
      project: { workspaceId },
    },
    select: { status: true, createdAt: true, updatedAt: true },
  });

  const completedTasks = await prisma.task.findMany({
    where: {
      status: TaskStatus.DONE,
      updatedAt: { gte: startDate },
      project: { workspaceId },
    },
    select: { updatedAt: true },
  });

  if (range === "7D") {
    const buckets: { day: string; tasks: number; completed: number }[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      buckets.push({
        day: dayNames[d.getDay()],
        tasks: allTasks.filter((t) => t.createdAt >= dayStart && t.createdAt < dayEnd).length,
        completed: completedTasks.filter((t) => t.updatedAt >= dayStart && t.updatedAt < dayEnd).length,
      });
    }
    return buckets;
  }

  if (range === "30D") {
    const buckets: { day: string; tasks: number; completed: number }[] = [];
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (w + 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      buckets.push({
        day: `Week ${4 - w}`,
        tasks: allTasks.filter((t) => t.createdAt >= weekStart && t.createdAt < weekEnd).length,
        completed: completedTasks.filter((t) => t.updatedAt >= weekStart && t.updatedAt < weekEnd).length,
      });
    }
    return buckets;
  }

  // 90D — monthly buckets
  const buckets: { day: string; tasks: number; completed: number }[] = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let m = 2; m >= 0; m--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 1);

    buckets.push({
      day: monthNames[monthStart.getMonth()],
      tasks: allTasks.filter((t) => t.createdAt >= monthStart && t.createdAt < monthEnd).length,
      completed: completedTasks.filter((t) => t.updatedAt >= monthStart && t.updatedAt < monthEnd).length,
    });
  }
  return buckets;
}

// ─── Featured Project ───
export async function getFeaturedProject(workspaceId: string) {
  const project = await prisma.project.findFirst({
    where: { status: "ACTIVE", workspaceId },
    orderBy: { updatedAt: "desc" },
    include: {
      tasks: { select: { status: true } },
    },
  });

  if (!project) return null;

  const taskBreakdown = {
    todo: project.tasks.filter((t) => t.status === TaskStatus.TODO).length,
    inProgress: project.tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.IN_REVIEW).length,
    done: project.tasks.filter((t) => t.status === TaskStatus.DONE).length,
  };
  const totalTasks = project.tasks.length;
  const progress = totalTasks > 0 ? Math.round((taskBreakdown.done / totalTasks) * 100) : 0;

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    progress,
    dueDate: project.dueDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" }) ?? null,
    imageUrl: project.imageUrl,
    taskBreakdown,
    totalTasks,
  };
}
