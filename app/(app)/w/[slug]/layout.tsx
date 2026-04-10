import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WorkspaceProvider } from "@/components/layout/WorkspaceContext";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin");

  const { slug } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
  });

  if (!workspace) redirect("/dashboard");

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: workspace.id,
      },
    },
  });

  if (!membership) redirect("/dashboard");

  return (
    <WorkspaceProvider
      value={{
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        inviteCode: workspace.inviteCode,
        role: membership.role,
      }}
    >
      {children}
    </WorkspaceProvider>
  );
}
