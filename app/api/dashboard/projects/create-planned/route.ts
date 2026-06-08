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
    const { name, description, dueDate, workspaceId, milestones } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
    }

    // Verify workspace membership and OWNER role
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId,
        },
      },
    });

    if (!membership || membership.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only workspace owners can create planned projects" },
        { status: 403 }
      );
    }

    // Use a transaction to guarantee all items are created or none
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the project
      const project = await tx.project.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          workspaceId,
          createdById: session.user.id,
        },
      });

      // 2. Loop and create Milestones and Tasks
      if (Array.isArray(milestones)) {
        for (const mInput of milestones) {
          const milestone = await tx.milestone.create({
            data: {
              title: mInput.title.trim(),
              description: mInput.description?.trim() || null,
              order: typeof mInput.order === "number" ? mInput.order : 0,
              projectId: project.id,
              dueDate: mInput.dueDate ? new Date(mInput.dueDate) : null,
            },
          });

          if (Array.isArray(mInput.tasks)) {
            for (const tInput of mInput.tasks) {
              await tx.task.create({
                data: {
                  title: tInput.title.trim(),
                  description: tInput.description?.trim() || null,
                  estimatedHours: typeof tInput.estimatedHours === "number" ? tInput.estimatedHours : null,
                  priority: tInput.priority || "MEDIUM",
                  status: "TODO",
                  projectId: project.id,
                  milestoneId: milestone.id,
                  dueDate: tInput.dueDate ? new Date(tInput.dueDate) : null,
                },
              });
            }
          }
        }
      }

      // 3. Log Project Creation Activity
      await tx.activity.create({
        data: {
          type: "PROJECT_CREATED",
          description: `Created AI-planned project "${project.name}"`,
          userId: session.user.id,
          projectId: project.id,
          workspaceId,
        },
      });

      return project;
    });

    return NextResponse.json({ project: result }, { status: 201 });
  } catch (error) {
    console.error("Failed to save planned project:", error);
    return NextResponse.json(
      { error: "Failed to save planned project" },
      { status: 500 }
    );
  }
}
