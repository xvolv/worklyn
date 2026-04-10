import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/layout/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin");

  // Fetch all workspaces the user belongs to, with projects
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: session.user.id },
    include: {
      workspace: {
        include: {
          projects: {
            select: { id: true, name: true, status: true },
            orderBy: { updatedAt: "desc" },
          },
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  // Fetch pending invitations
  const pendingInvitations = await prisma.workspaceInvitation.findMany({
    where: { invitedUserId: session.user.id, status: "PENDING" },
    include: {
      workspace: { select: { id: true, name: true } },
      invitedBy: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const workspaces = memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    slug: m.workspace.slug,
    role: m.role,
    memberCount: m.workspace._count.members,
    projects: m.workspace.projects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
    })),
  }));

  const invitations = pendingInvitations.map((inv) => ({
    id: inv.id,
    workspaceId: inv.workspace.id,
    workspaceName: inv.workspace.name,
    invitedByName: inv.invitedBy.name,
    createdAt: inv.createdAt.toISOString(),
  }));

  return (
    <AppShell workspaces={workspaces} invitations={invitations}>
      {children}
    </AppShell>
  );
}
