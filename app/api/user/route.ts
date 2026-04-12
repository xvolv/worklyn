import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const image = formData.get("image") as File | null;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let imageUrl: string | undefined = undefined;
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      try {
        imageUrl = await uploadImageToCloudinary(buffer, "worklyn/users", {
          aspectRatio: "1:1",
          gravity: "face"
        });
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        name: name.trim(),
        ...(imageUrl && { image: imageUrl })
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
