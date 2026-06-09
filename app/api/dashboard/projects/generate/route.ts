import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { generateProjectPlan } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, durationWeeks, workspaceId } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Project prompt is required" },
        { status: 400 }
      );
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 }
      );
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
        { error: "Only workspace owners can plan projects" },
        { status: 403 }
      );
    }

    const targetWeeks = typeof durationWeeks === "number" && durationWeeks > 0 ? durationWeeks : 4;

    const plan = await generateProjectPlan(prompt, targetWeeks);

    return NextResponse.json({ plan }, { status: 200 });
  } catch (error: any) {
    console.error("Plan generation failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate project plan" },
      { status: 500 }
    );
  }
}
