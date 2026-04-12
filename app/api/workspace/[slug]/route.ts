import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    const workspace = await prisma.workspace.findUnique({
      where: { slug },
      include: { members: true },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const membership = workspace.members.find(
      (m) => m.userId === session.user.id
    );

    if (!membership || membership.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only owners can delete the workspace" },
        { status: 403 }
      );
    }

    await prisma.workspace.delete({
      where: { id: workspace.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete workspace:", error);
    return NextResponse.json(
      { error: "Failed to delete workspace" },
      { status: 500 }
    );
  }
}
