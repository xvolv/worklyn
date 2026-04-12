import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const body = await req.json();
    const { status, assigneeId } = body;

    // Validate status if provided
    const validStatuses = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Find task and verify workspace membership
    const task = await prisma.task.findFirst({
      where: { id: taskId },
      include: { project: { select: { workspaceId: true } } },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: task.project.workspaceId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this workspace" },
        { status: 403 }
      );
    }

    // Role-based restrictions
    if (membership.role !== "OWNER") {
      if (task.assigneeId !== session.user.id) {
        return NextResponse.json(
          { error: "Members can only update tasks assigned to them" },
          { status: 403 }
        );
      }
      if (assigneeId !== undefined && assigneeId !== task.assigneeId) {
        return NextResponse.json(
          { error: "Members cannot reassign tasks" },
          { status: 403 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: { select: { name: true, email: true } }
      }
    });

    const serialized = {
      id: updated.id,
      title: updated.title,
      status: updated.status,
      priority: updated.priority,
      dueDate: updated.dueDate?.toISOString() ?? null,
      assigneeName: updated.assignee?.name ?? null,
      assigneeEmail: updated.assignee?.email ?? null,
      projectId: updated.projectId,
    };

    const io = (global as any).io;
    if (io) {
      io.emit("task-updated", serialized);
    }

    return NextResponse.json({ task: updated });
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: task.project.workspaceId,
        },
      },
    });

    if (!membership || membership.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only workspace owners can delete tasks" },
        { status: 403 }
      );
    }

    // Capture project details for real-time before delete
    const projectId = task.projectId;

    await prisma.task.delete({
      where: { id: taskId },
    });

    const io = (global as any).io;
    if (io) {
      io.emit("task-deleted", { taskId, projectId });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
