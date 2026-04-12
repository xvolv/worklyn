import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getIO } from "@/lib/socket-io";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; memberId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, memberId } = await params;

    const workspace = await prisma.workspace.findUnique({
      where: { slug },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const callerMembership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: workspace.id,
        },
      },
    });

    if (!callerMembership) {
      return NextResponse.json(
        { error: "Not a member" },
        { status: 403 }
      );
    }

    const targetMembership = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMembership) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Only owners can remove others, and members can remove themselves
    if (callerMembership.role !== "OWNER" && targetMembership.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Only workspace owners can remove other members" },
        { status: 403 }
      );
    }

    // Don't allow removing the last owner (unless we want to force full deletion)
    if (targetMembership.role === "OWNER") {
      const ownerCount = await prisma.workspaceMember.count({
        where: { workspaceId: workspace.id, role: "OWNER" },
      });
      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last owner of the workspace" },
          { status: 400 }
        );
      }
    }

    await prisma.workspaceMember.delete({
      where: { id: memberId },
    });

    // Notify the Owner
    try {
      // Find the Owner(s) of the workspace
      const owners = await prisma.workspaceMember.findMany({
        where: { 
          workspaceId: workspace.id,
          role: "OWNER"
        }
      });

      // Create a notification for each owner
      // (Unless the member who left WAS the owner themselves - though we gate that above)
      console.log(`Found ${owners.length} owners for workspace ${workspace.id}`);
      for (const owner of owners) {
        if (owner.userId !== targetMembership.userId) {
          console.log(`Creating notification for owner ${owner.userId}`);
          const notification = await prisma.notification.create({
            data: {
              type: "MEMBER_LEFT",
              message: `${targetMembership.user.name} has left the workspace.`,
              userId: owner.userId,
              workspaceId: workspace.id,
            }
          });

          // Emit real-time notification
          const io = getIO();
          if (io) {
            io.to(owner.userId).emit("new-notification", notification);
            console.log(`Emitted live notification to user room: ${owner.userId}`);
          } else {
            console.warn("Socket.io instance not found in API route");
          }
        }
      }
    } catch (notifyError) {
      console.error("Failed to create notification:", notifyError);
      // Don't fail the member deletion just because notification failed
    }

    // Log the activity
    await prisma.activity.create({
      data: {
        type: "MEMBER_LEFT" as any, // Cast to any in case generate hasn't finished
        description: `left the workspace`,
        userId: targetMembership.userId,
        workspaceId: workspace.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
