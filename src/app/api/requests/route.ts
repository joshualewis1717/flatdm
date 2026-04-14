import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const body = await request.json();
    const requestId = Number(body.requestId);
    const action = body.action as "ACCEPT" | "DECLINE";

    if (!requestId || !action) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const messageRequest = await prisma.messageRequest.findFirst({
      where: {
        id: requestId,
        receiverId: userId,
        status: "PENDING",
      },
      include: {
        sender: true,
      },
    });

    if (!messageRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "DECLINE") {
      await prisma.messageRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
      });

      return NextResponse.json({ success: true });
    }

    const conversation = await prisma.conversation.create({
        data: {
            userAId: messageRequest.senderId,
            userBId: userId,
        },
        include: {
            userA: true,
            userB: true,
            messages: {
            orderBy: { createdAt: "asc" },
            },
        },
    });

    await prisma.messageRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    });

    const otherUser =
      conversation.userAId === userId ? conversation.userB : conversation.userA;

    const isDeletedUser = otherUser.isDeleted;

    const displayName = isDeletedUser
      ? "Deleted User"
      : [otherUser.firstName, otherUser.lastName].filter(Boolean).join(" ") || otherUser.username || "Unknown user";

    const lastMessage = conversation.messages.at(-1);

    const formattedConversation = {
      id: conversation.id,
      name: displayName,
      isDeletedUser,
      lastMessage: lastMessage?.isDeleted
        ? "This message was deleted": lastMessage?.content ?? "",
      timestamp: lastMessage?.createdAt.toISOString() ?? null,
      messages: conversation.messages.map((message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        isOwn: message.senderId === userId,
        isDeleted: message.isDeleted,
      })),
    };

    return NextResponse.json({
      success: true,
      conversation: formattedConversation,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const senderId = Number(session.user.id);
    const body = await request.json();
    const receiverId = Number(body.receiverId);

    if (!receiverId || Number.isNaN(receiverId)) {
      return NextResponse.json({ error: "Invalid receiverId" }, { status: 400 });
    }

    if (senderId === receiverId) {
      return NextResponse.json(
        { error: "You cannot send a request to yourself" },
        { status: 400 }
      );
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true },
    });

    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
    }

    const existingPendingRequest = await prisma.messageRequest.findFirst({
      where: {
        senderId,
        receiverId,
        status: "PENDING",
      },
    });

    if (existingPendingRequest) {
      return NextResponse.json(
        { error: "A pending request already exists" },
        { status: 409 }
      );
    }

    const latestConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { userAId: senderId, userBId: receiverId },
          { userAId: receiverId, userBId: senderId },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (latestConversation && !latestConversation.isDeletedA && !latestConversation.isDeletedB){
      return NextResponse.json(
        { error: "A conversation already exists between these users." },
        { status: 400 }
      );
    }

    const createdRequest = await prisma.messageRequest.create({
      data: {
        senderId,
        receiverId,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        request: {
          id: createdRequest.id,
          senderId: createdRequest.senderId,
          receiverId: createdRequest.receiverId,
          status: createdRequest.status,
          createdAt: createdRequest.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}