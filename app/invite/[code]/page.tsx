import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InviteClient from "./InviteClient";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // Check if invite code is valid
  const workspace = await prisma.workspace.findUnique({
    where: { inviteCode: code },
    select: { id: true, name: true, slug: true },
  });

  if (!workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6fa] p-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
            <h1 className="text-xl font-bold text-foreground">Invalid Invite Link</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This invite link is no longer valid or has expired.
            </p>
            <a
              href="/signin"
              className="mt-6 inline-flex h-10 items-center rounded-lg bg-gray-800 px-5 text-sm font-semibold text-white hover:bg-gray-900"
            >
              Go to Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    // Not logged in — redirect to signup with invite code
    redirect(`/signup?invite=${code}`);
  }

  // Check if already a member
  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: workspace.id,
      },
    },
  });

  if (existingMember) {
    redirect(`/w/${workspace.slug}/dashboard`);
  }

  // Show the join confirmation page
  return (
    <InviteClient
      workspaceName={workspace.name}
      workspaceSlug={workspace.slug}
      inviteCode={code}
    />
  );
}
