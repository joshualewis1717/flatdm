import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


/* Send Message */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = Number(session?.user?.id);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); /* user not logged in */
    }

    const { conversationId, content } = await req.json();

    /* reject if empty message, bad conversation */
    if (!conversationId || !content?.trim()) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    /* verify user-conversation */
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: Number(conversationId),
        OR: [{ userAId: userId }, { userBId: userId }],
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    /* create message for DB */
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        conversationId: Number(conversationId),
        senderId: userId,
      },
    });

    /* return message to frontend if all checked out */
    return NextResponse.json({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      senderId: message.senderId,
      isOwn: true,
    });
  } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* Fetch/Refresh Current Conversation Messages */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = Number(session?.user?.id);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = Number(searchParams.get("conversationId"));

    /* verify conversation exists server-side */
    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
    }

    /* verify user is part of conversation */
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ userAId: userId }, { userBId: userId }],
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    /* query DB for messages */
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    /* format for frontend and GUI */
    return NextResponse.json(
      messages.map((m) => ({
        id: m.id,
        content: m.content,
        createdAt: m.createdAt,
        senderId: m.senderId,
        isOwn: m.senderId === userId,
      }))
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}