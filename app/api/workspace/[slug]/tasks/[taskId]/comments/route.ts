import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; taskId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;

    const comments = await prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    const serialized = comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      author: {
        id: c.author.id,
        name: c.author.name,
        email: c.author.email,
        image: c.author.image,
      },
    }));

    return NextResponse.json({ comments: serialized });
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; taskId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        taskId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    const serialized = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      author: {
        id: comment.author.id,
        name: comment.author.name,
        email: comment.author.email,
        image: comment.author.image,
      },
    };

    // Emit real-time event
    const io = (global as any).io;
    if (io) {
      io.emit(`comment-added:${taskId}`, serialized);
    }

    return NextResponse.json({ comment: serialized }, { status: 201 });
  } catch (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
