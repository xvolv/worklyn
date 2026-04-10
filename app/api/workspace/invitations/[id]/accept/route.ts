import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const invitation = await prisma.workspaceInvitation.findFirst({
      where: { id, invitedUserId: session.user.id, status: "PENDING" },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Accept: create membership + update invitation status
    await prisma.$transaction([
      prisma.workspaceMember.create({
        data: {
          userId: session.user.id,
          workspaceId: invitation.workspaceId,
          role: "MEMBER",
        },
      }),
      prisma.workspaceInvitation.update({
        where: { id },
        data: { status: "ACCEPTED" },
      }),
      prisma.activity.create({
        data: {
          type: "MEMBER_JOINED",
          description: "joined the workspace",
          userId: session.user.id,
          workspaceId: invitation.workspaceId,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to accept invitation:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
