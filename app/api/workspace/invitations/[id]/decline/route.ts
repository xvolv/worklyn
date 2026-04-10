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

    await prisma.workspaceInvitation.update({
      where: { id },
      data: { status: "DECLINED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to decline invitation:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
