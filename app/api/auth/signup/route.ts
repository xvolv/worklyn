import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/backend/users/users.service";
import { signupSchema } from "@/backend/validators/auth";
import { ApiError } from "@/backend/errors/http";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    const result = await userService.signup(name, email, password);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Email already in use") {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
