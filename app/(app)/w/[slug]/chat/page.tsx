import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import WorkspaceChat from "@/components/chat/WorkspaceChat";

export default async function ChatPage({
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

  if (!workspace) redirect("/dashboard");

  return (
    <WorkspaceChat
      workspaceSlug={slug}
      workspaceId={workspace.id}
      workspaceName={workspace.name}
      currentUserId={session.user.id}
    />
  );
}
