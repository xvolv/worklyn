import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { inviteCode } = body;

    if (!inviteCode || typeof inviteCode !== "string") {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    // Find workspace by invite code
    const workspace = await prisma.workspace.findUnique({
      where: { inviteCode },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Invalid invite link" },
        { status: 404 }
      );
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
      return NextResponse.json({
        workspace,
        alreadyMember: true,
      });
    }

    // Add user as MEMBER
    await prisma.workspaceMember.create({
      data: {
        userId: session.user.id,
        workspaceId: workspace.id,
        role: "MEMBER",
      },
    });

    // Log the activity
    await prisma.activity.create({
      data: {
        type: "MEMBER_JOINED",
        description: `joined the workspace`,
        userId: session.user.id,
        workspaceId: workspace.id,
      },
    });

    return NextResponse.json({ workspace, joined: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to join workspace:", error);
    return NextResponse.json(
      { error: "Failed to join workspace" },
      { status: 500 }
    );
  }
}
