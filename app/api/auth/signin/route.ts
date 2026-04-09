import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/backend/users/users.service";
import { signinSchema } from "@/backend/validators/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const validation = signinSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    const result = await userService.signin(email, password);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
