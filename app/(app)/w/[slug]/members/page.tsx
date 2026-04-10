import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import MembersPageClient from "@/components/members/MembersPageClient";

export default async function MembersPage({
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

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  // Get task counts per member
  const taskCounts = await prisma.task.groupBy({
    by: ["assigneeId"],
    where: {
      project: { workspaceId: workspace.id },
      assigneeId: { not: null },
    },
    _count: true,
  });

  const taskCountMap = new Map(
    taskCounts.map((tc) => [tc.assigneeId, tc._count])
  );

  const serialized = members.map((m) => ({
    id: m.id,
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    image: m.user.image,
    role: m.role,
    joinedAt: m.joinedAt.toISOString(),
    taskCount: taskCountMap.get(m.user.id) ?? 0,
  }));

  return <MembersPageClient members={serialized} />;
}
