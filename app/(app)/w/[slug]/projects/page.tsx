import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ProjectsIndexClient from "@/components/dashboard/ProjectsIndexClient";

export default async function ProjectsPage({
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

  const projects = await prisma.project.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { tasks: true } },
    },
  });

  const serialized = projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    progress: p.progress,
    dueDate: p.dueDate?.toISOString() ?? null,
    taskCount: p._count.tasks,
  }));

  return <ProjectsIndexClient projects={serialized} />;
}
