import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getIO } from "@/lib/socket-io";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    // Get workspace + verify membership
    const workspace = await prisma.workspace.findUnique({
      where: { slug },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: workspace.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this workspace" },
        { status: 403 }
      );
    }

    // Get all members with user info
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    const serialized = members.map((m) => ({
      id: m.id,
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
    }));

    return NextResponse.json({ members: serialized });
  } catch (error) {
    console.error("Failed to fetch members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({ where: { slug } });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Verify caller is OWNER
    const callerMembership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: workspace.id,
        },
      },
    });

    if (!callerMembership || callerMembership.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only workspace owners can invite members" },
        { status: 403 }
      );
    }

    // Check if already a member
    const existing = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: workspace.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User is already a member" },
        { status: 409 }
      );
    }

    // Check if already has a pending invitation
    const existingInvite = await prisma.workspaceInvitation.findUnique({
      where: {
        workspaceId_invitedUserId: {
          workspaceId: workspace.id,
          invitedUserId: userId,
        },
      },
    });

    if (existingInvite && existingInvite.status === "PENDING") {
      return NextResponse.json(
        { error: "Invitation already sent" },
        { status: 409 }
      );
    }

    // Create or update invitation with inclusions for UI enrichment
    const invitation = await prisma.workspaceInvitation.upsert({
      where: {
        workspaceId_invitedUserId: {
          workspaceId: workspace.id,
          invitedUserId: userId,
        },
      },
      update: { status: "PENDING", invitedById: session.user.id },
      create: {
        workspaceId: workspace.id,
        invitedUserId: userId,
        invitedById: session.user.id,
      },
      include: {
        workspace: { select: { name: true, description: true } },
        invitedBy: { select: { name: true } },
      }
    });

    // Map to the interface expected by DashboardSidebar
    const sidebarInvitation = {
      id: invitation.id,
      workspaceId: invitation.workspaceId,
      workspaceName: invitation.workspace.name,
      workspaceDescription: invitation.workspace.description,
      invitedByName: invitation.invitedBy?.name || "Someone",
      createdAt: invitation.createdAt.toISOString(),
    };

    // Emit real-time invitation
    const io = getIO();
    if (io) {
      io.to(userId).emit("new-invitation", sidebarInvitation);
      console.log(`Emitted live enriched invitation to user room: ${userId}`);
    } else {
      console.warn("Socket.io instance not found in invitation API");
    }

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error("Failed to send invitation:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}

