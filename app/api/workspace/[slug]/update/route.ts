import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const newSlug = formData.get("slug") as string;
    const description = formData.get("description") as string | null;
    const image = formData.get("image") as File | null;

    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId: session.user.id,
        workspace: { slug },
      },
    });

    if (!membership || membership.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized. Must be workspace owner." }, { status: 403 });
    }

    if (!name || !newSlug) {
      return NextResponse.json({ error: "Name and Slug are required" }, { status: 400 });
    }

    // Check if new slug is taken by someone else
    if (slug !== newSlug) {
      const existing = await prisma.workspace.findUnique({
        where: { slug: newSlug }
      });
      if (existing) {
        return NextResponse.json({ error: "Workspace URL slug is already taken" }, { status: 400 });
      }
    }

    let imageUrl: string | undefined = undefined;
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      try {
        imageUrl = await uploadImageToCloudinary(buffer, "worklyn/workspaces", {
          aspectRatio: "1:1"
        });
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
      }
    }

    const updated = await prisma.workspace.update({
      where: { slug },
      data: {
        name,
        slug: newSlug,
        description,
        ...(imageUrl && { imageUrl })
      },
    });

    return NextResponse.json({ success: true, workspace: updated });
  } catch (error) {
    console.error("Failed to update workspace:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
