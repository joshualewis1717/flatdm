import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const jsonError = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

async function getUserId() {
  const session = await auth();
  const userId = Number(session?.user?.id);

  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

async function getConversation(conversationId: number, userId: number) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ userAId: userId }, { userBId: userId }],
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return jsonError("Unauthorized", 401);

    const body = await req.json();
    const conversationId = Number(body.conversationId);
    const content = body.content?.trim();

    if (!Number.isInteger(conversationId) || !content) {
      return jsonError("Invalid data", 400);
    }

    const conversation = await getConversation(conversationId, userId);
    if (!conversation) {
      return jsonError("Conversation not found", 404);
    }

    const message = await prisma.message.create({
      data: {
        content,
        conversationId,
        senderId: userId,
      },
    });

    return NextResponse.json({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      senderId: message.senderId,
      isOwn: true,
      isDeleted: message.isDeleted,
    });
  } catch (error) {
    console.error(error);
    return jsonError("Server error", 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return jsonError("Unauthorized", 401);

    const conversationId = Number(
      new URL(req.url).searchParams.get("conversationId")
    );

    if (!Number.isInteger(conversationId)) {
      return jsonError("Missing conversationId", 400);
    }

    const conversation = await getConversation(conversationId, userId);
    if (!conversation) {
      return jsonError("Conversation not found", 404);
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      messages.map((message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        senderId: message.senderId,
        isOwn: message.senderId === userId,
        isDeleted: message.isDeleted,
      }))
    );
  } catch (error) {
    console.error(error);
    return jsonError("Server error", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return jsonError("Unauthorized", 401);

    const { messageId } = await req.json();
    const id = Number(messageId);

    if (!Number.isInteger(id)) {
      return jsonError("Missing messageId", 400);
    }

    const message = await prisma.message.findFirst({
      where: {
        id,
        senderId: userId,
      },
    });

    if (!message) {
      return jsonError("Message not found", 404);
    }

    const deletedMessage = await prisma.message.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      id: deletedMessage.id,
      content: deletedMessage.content,
      createdAt: deletedMessage.createdAt,
      senderId: deletedMessage.senderId,
      isOwn: true,
      isDeleted: deletedMessage.isDeleted,
      deletedAt: deletedMessage.deletedAt,
    });
  } catch (error) {
    console.error(error);
    return jsonError("Server error", 500);
  }
}