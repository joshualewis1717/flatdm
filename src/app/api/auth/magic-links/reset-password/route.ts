import { NextResponse } from "next/server";
import { resetPasswordWithMagicLink } from "@/lib/magic-links";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body?.token?.trim();
    const password = body?.password;

    if (!token) {
      return NextResponse.json({ success: false, error: "Token is required" }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const result = await resetPasswordWithMagicLink({ token, password });
    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: `Magic link is ${result.reason}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to reset password" },
      { status: 500 }
    );
  }
}
