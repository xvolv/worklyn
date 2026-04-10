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
    const { title, projectId, status, priority, dueDate, assigneeId } = body;

    // Validate required fields
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    if (title.trim().length > 200) {
      return NextResponse.json(
        { error: "Task title must be under 200 characters" },
        { status: 400 }
      );
    }

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Get the project and verify workspace membership
    const project = await prisma.project.findFirst({
      where: { id: projectId },
      select: { id: true, name: true, workspaceId: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: project.workspaceId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this workspace" },
        { status: 403 }
      );
    }

    // Validate enum values
    const validStatuses = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
    const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

    const taskStatus = validStatuses.includes(status) ? status : "TODO";
    const taskPriority = validPriorities.includes(priority) ? priority : "MEDIUM";

    // If assigneeId provided, verify they're a workspace member
    if (assigneeId) {
      const assigneeMembership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: assigneeId,
            workspaceId: project.workspaceId,
          },
        },
      });

      if (!assigneeMembership) {
        return NextResponse.json(
          { error: "Assignee is not a member of this workspace" },
          { status: 400 }
        );
      }
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        status: taskStatus,
        priority: taskPriority,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null,
      },
      include: {
        assignee: { select: { name: true, email: true } },
      },
    });

    // Log the activity
    await prisma.activity.create({
      data: {
        type: "TASK_CREATED",
        description: `Created task "${task.title}" in ${project.name}`,
        userId: session.user.id,
        projectId: project.id,
        workspaceId: project.workspaceId,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
