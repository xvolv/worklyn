import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ProjectBoard from "@/components/dashboard/ProjectBoard";

export default async function SingleProjectPage({
  params,
}: {
  params: Promise<{ slug: string; projectId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin");

  const { slug, projectId } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
  });

  if (!workspace) redirect("/workspace/new");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, email: true, image: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      milestones: {
        orderBy: { order: "asc" },
      },
      _count: { select: { tasks: true } },
    },
  });

  if (!project || project.workspaceId !== workspace.id) {
    redirect(`/w/${slug}/projects`);
  }

  const serialized = {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    progress: project.progress,
    dueDate: project.dueDate?.toISOString() ?? null,
    taskCount: project._count.tasks,
    milestones: project.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      dueDate: m.dueDate?.toISOString() ?? null,
      order: m.order,
    })),
    tasks: project.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      estimatedHours: t.estimatedHours,
      milestoneId: t.milestoneId,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate?.toISOString() ?? null,
      assigneeId: t.assignee?.id ?? null,
      assigneeName: t.assignee?.name ?? null,
      assigneeEmail: t.assignee?.email ?? null,
      assigneeImage: t.assignee?.image ?? null,
      commentCount: t._count.comments,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
  };

  return <ProjectBoard project={serialized} currentUserId={session.user.id} />;
}
