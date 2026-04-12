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
    const url = new URL(req.url);
    const cursor = url.searchParams.get("cursor");
    const limit = 50;

    const workspace = await prisma.workspace.findUnique({ where: { slug } });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Verify membership
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: workspace.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    const hasMore = messages.length > limit;
    const trimmed = hasMore ? messages.slice(0, limit) : messages;

    const serialized = trimmed.reverse().map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      author: {
        id: m.author.id,
        name: m.author.name,
        email: m.author.email,
        image: m.author.image,
      },
    }));

    return NextResponse.json({
      messages: serialized,
      nextCursor: hasMore ? trimmed[0]?.id : null,
    });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
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
    const { content } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.findUnique({ where: { slug } });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        workspaceId: workspace.id,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    const serialized = {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      author: {
        id: message.author.id,
        name: message.author.name,
        email: message.author.email,
        image: message.author.image,
      },
    };

    // Emit real-time event
    const io = (global as any).io;
    if (io) {
      io.emit(`chat:${workspace.id}`, serialized);
    }

    return NextResponse.json({ message: serialized }, { status: 201 });
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
