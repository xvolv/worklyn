import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const workspace = await prisma.workspace.findUnique({ where: { slug } });
    if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const count = await prisma.message.count({ where: { workspaceId: workspace.id } });
    return NextResponse.json({ count, workspaceId: workspace.id });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
