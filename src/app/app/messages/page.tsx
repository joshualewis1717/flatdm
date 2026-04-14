import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MessagesClient from "./_components/_MessagesClient";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  const userId = Number(session.user.id);

  const [rawConversations, pendingRequests] = await Promise.all([
    prisma.conversation.findMany({
      where: {
        OR: [
          {
            userAId: userId,
            isDeletedA: false,
          },
          {
            userBId: userId,
            isDeletedB: false,
          },
        ],
      },
      include: {
        userA: true,
        userB: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.messageRequest.findMany({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const conversations = [...rawConversations].sort((a, b) => {
    const aIsEmpty = a.messages.length === 0;
    const bIsEmpty = b.messages.length === 0;

    if (aIsEmpty && !bIsEmpty) return -1;
    if (!aIsEmpty && bIsEmpty) return 1;

    const aLast = a.messages.at(-1)?.createdAt?.getTime() ?? 0;
    const bLast = b.messages.at(-1)?.createdAt?.getTime() ?? 0;

    return bLast - aLast;
  });

  const formattedConversations = conversations.map((conversation) => {
    const otherUser = conversation.userAId === userId ? conversation.userB : conversation.userA;
    
    const isDeletedUser= otherUser.isDeleted;

    const displayName = isDeletedUser ? "Deleted User" : [otherUser.firstName, otherUser.lastName].filter(Boolean).join(" ") || otherUser.username || "Unknown user";

    const lastMessage=conversation.messages.at(-1);
    return {
      id: conversation.id,
      name: displayName,
      isDeletedUser,
      lastMessage: lastMessage?.isDeleted? "This message was deleted": lastMessage?.content ?? "",
      timestamp: lastMessage?.createdAt.toISOString() ?? null,
      messages: conversation.messages.map((message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        isOwn: message.senderId === userId,
        isDeleted: message.isDeleted
      }))
    };
  });

  const formattedPendingRequests = pendingRequests.map((request) => {
    const sender = request.sender;
    const isDeletedUser = sender.isDeleted;

    const displayName =
      isDeletedUser
        ? "Deleted User"
        : [sender.firstName, sender.lastName].filter(Boolean).join(" ") || sender.username || "Unknown user";

    return {
      id: request.id,
      senderId: sender.id,
      name: displayName,
      isDeletedUser,
      status: request.status,
      createdAt: request.createdAt.toISOString(),
    };
  });

  return <MessagesClient conversations={formattedConversations} requests={formattedPendingRequests} />;
}