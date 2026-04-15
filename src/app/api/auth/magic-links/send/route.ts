import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMagicLinkEmail, type MagicLinkTypeValue } from "@/lib/magic-links";

const ALLOWED_TYPES: MagicLinkTypeValue[] = ["EMAIL_VERIFICATION", "PASSWORD_RESET"];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body?.email?.trim()?.toLowerCase();
    const type = body?.type;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required" },
        { status: 400 }
      );
    }

    if (typeof type !== "string" || !ALLOWED_TYPES.includes(type as MagicLinkTypeValue)) {
      return NextResponse.json(
        { success: false, error: "Invalid magic link type" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        isDeleted: true,
      },
    });

    const genericMessage = type === "EMAIL_VERIFICATION"
      ? "If the account can be verified, a verification email has been sent"
      : "If the account exists, a password reset email has been sent";

    if (!user || user.isDeleted) {
      return NextResponse.json({ success: true, message: genericMessage });
    }

    if (type === "EMAIL_VERIFICATION" && user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "This email address is already verified",
      });
    }

    const result = await sendMagicLinkEmail({
      user,
      type,
    });

    return NextResponse.json({
      success: true,
      message: genericMessage,
      previewUrl: result.previewUrl,
      expiresAt: result.expiresAt,
      link: process.env.NODE_ENV === "production" ? undefined : result.link,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
