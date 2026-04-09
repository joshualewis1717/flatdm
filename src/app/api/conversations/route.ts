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

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return jsonError("Unauthorized", 401);

    const { conversationId } = await req.json();
    const id = Number(conversationId);

    if (!Number.isInteger(id)) {
      return jsonError("Missing conversationId", 400);
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return jsonError("Conversation not found", 404);
    }

    if (conversation.userAId === userId) {
      await prisma.conversation.update({
        where: { id },
        data: { isDeletedA: true },
      });
    } else if (conversation.userBId === userId) {
      await prisma.conversation.update({
        where: { id },
        data: { isDeletedB: true },
      });
    } else {
      return jsonError("Unauthorized", 403);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return jsonError("Server error", 500);
  }
}