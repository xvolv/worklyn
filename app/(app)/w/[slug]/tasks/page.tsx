import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import TasksPageClient from "@/components/tasks/TasksPageClient";

export default async function TasksPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin");

  const { slug } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
  });

  if (!workspace) redirect("/workspace/new");

  const tasks = await prisma.task.findMany({
    where: {
      project: { workspaceId: workspace.id },
    },
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { name: true } },
      assignee: { select: { name: true, email: true, image: true } },
    },
  });

  const projects = await prisma.project.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const serialized = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    project: t.project.name,
    projectId: t.projectId,
    assigneeName: t.assignee?.name ?? null,
    assigneeImage: t.assignee?.image ?? null,
    dueDate: t.dueDate?.toISOString() ?? null,
    priority: t.priority,
    status: t.status,
  }));

  return <TasksPageClient tasks={serialized} projects={projects} />;
}
