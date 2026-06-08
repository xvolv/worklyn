import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { chatWithProject } from "@/lib/gemini";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Chat messages are required" }, { status: 400 });
    }

    // 1. Fetch project details and verify existence
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        description: true,
        workspaceId: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 2. Verify workspace membership
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
        { error: "Access denied. You are not a member of this workspace." },
        { status: 403 }
      );
    }

    // 3. Fetch Milestones
    const milestones = await prisma.milestone.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        dueDate: true,
      },
    });

    // 4. Fetch Tasks with Assignee Details
    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        estimatedHours: true,
        milestoneId: true,
        assignee: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Serialize assignee names directly
    const serializedTasks = tasks.map(t => ({
      ...t,
      assigneeName: t.assignee?.name || null,
      assigneeEmail: t.assignee?.email || null,
      assignee: undefined,
    }));

    // 5. Query Gemini project health assistant
    const reply = await chatWithProject(
      project.name,
      project.description,
      milestones,
      serializedTasks,
      messages
    );

    return NextResponse.json({ reply }, { status: 200 });
  } catch (error) {
    console.error("Project health chat failed:", error);
    return NextResponse.json(
      { error: "Failed to query project health assistant" },
      { status: 500 }
    );
  }
}
