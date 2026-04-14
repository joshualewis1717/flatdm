import { prisma } from "@/lib/prisma";
import { sendMagicLinkEmail } from "@/lib/magic-links";
import { Role } from "@prisma/client";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

function getRegisterRoleFromEmail(email: string): Role {
  const [, domain = ""] = email.trim().toLowerCase().split("@");
  return domain.split(".")[0] === "gmail" ? Role.CONSULTANT : Role.LANDLORD;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const firstName = body?.firstName?.trim();
    const lastName = body?.lastName?.trim();
    const username = body?.username?.trim();
    const email = body?.email?.trim()?.toLowerCase();
    const password = body?.password;

    if (!firstName || !lastName || !username || !email || !password) 
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    
    if (typeof password !== "string" || password.length < 8)
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 400 }
      );

    if ((password.match(/\d/g) || []).length < 2) {                                                                    
      return NextResponse.json(                                                                                        
        { success: false, error: "Password must contain at least 2 numbers." },                                        
        { status: 400 }                                                                                                
      );                                                                                                               
    }    
    
    if (!/[!@#$%^&*(),.?":{}|<>£]/.test(password))
      return NextResponse.json(
        { success: false, error: "Password must contain at least 1 special character." },
        { status: 400 }
      );
    
    const selectedRole = getRegisterRoleFromEmail(email);

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { id: true },
    });

    if (existingUser) 
      return NextResponse.json(
        { success: false, error: "user with this email or username already exists" },
        { status: 409 }
      );
    
    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: { firstName, lastName, username, email, passwordHash, role: selectedRole, profile: { create: {} } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        role: true,
        emailVerified: true,
      },
    });

    const magicLinkResult = await sendMagicLinkEmail({
      user,
      type: "EMAIL_VERIFICATION",
      requestUrl: req.url,
    }).catch((error: unknown) => ({
      error: error instanceof Error ? error.message : "Failed to send verification email",
    }));

    return NextResponse.json({
      success: true,
      user,
      requiresEmailVerification: true,
      verificationEmailSent: !("error" in magicLinkResult),
      verificationEmailError: "error" in magicLinkResult ? magicLinkResult.error : undefined,
      previewUrl: "previewUrl" in magicLinkResult ? magicLinkResult.previewUrl : undefined,
      verificationLink: process.env.NODE_ENV === "production" || !("link" in magicLinkResult)
        ? undefined
        : magicLinkResult.link,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "failed to register user" }, { status: 500 });
  }
}
