import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { PROFILE_DATABASE_ERROR_MESSAGE } from "@/lib/profile";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const body = await req.json();

    const firstName = body?.firstName?.trim();
    const lastName = body?.lastName?.trim();
    const username = body?.username?.trim();
    const email = body?.email?.trim()?.toLowerCase();
    const phone = body?.phone?.trim() || null;
    const description = body?.description?.trim() || null
    const bio = body?.bio?.trim() || null;

    if (!firstName || !lastName || !username || !email) {
      return NextResponse.json(
        { success: false, error: "First name, last name, username, and email are required." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        id: { not: userId },
        OR: [{ email }, { username }],
      },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "That email or username is already in use." },
        { status: 409 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        username,
        email,
        profile: {
          upsert: {
            create: { phone, description, bio },
            update: { phone, description, bio },

          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json(
      { success: false, error: PROFILE_DATABASE_ERROR_MESSAGE },
      { status: 500 }
    );
  }
}
