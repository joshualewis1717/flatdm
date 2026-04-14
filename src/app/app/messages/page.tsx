import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MessagesClient from "./_components/_MessagesClient";

import type { Conversation, Request } from "./_components/type";

export default async function MessagesPage() {
  const session = await auth();

  if (!session?.user?.id) {return null;}

  const userId = Number(session.user.id);

  let loadError: string | null = null;
  let formattedConversations: Conversation[] = [];
  let formattedPendingRequests: Request[] = [];

  try {
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

    const latestConversationByPair = new Map<number | string, (typeof rawConversations)[number]>();

    for (const conversation of rawConversations) {
      const pairKey =
        conversation.userAId < conversation.userBId ? `${conversation.userAId}-${conversation.userBId}` : `${conversation.userBId}-${conversation.userAId}`;

      const existing = latestConversationByPair.get(pairKey);

      const currentLatestTime = conversation.messages.at(-1)?.createdAt?.getTime() ?? conversation.createdAt.getTime();

      const existingLatestTime = existing?.messages.at(-1)?.createdAt?.getTime() ?? existing?.createdAt.getTime() ?? 0;

      if (!existing || currentLatestTime > existingLatestTime) {
        latestConversationByPair.set(pairKey, conversation);
      }
    }
    const dedupedConversations = Array.from(latestConversationByPair.values());
  
    const conversations = [...dedupedConversations].sort((a, b) => {
      const aIsEmpty = a.messages.length === 0;
      const bIsEmpty = b.messages.length === 0;

      if (aIsEmpty && !bIsEmpty) return -1;
      if (!aIsEmpty && bIsEmpty) return 1;

      const aLast = a.messages.at(-1)?.createdAt?.getTime() ?? 0;
      const bLast = b.messages.at(-1)?.createdAt?.getTime() ?? 0;

      return bLast - aLast;
    });

    formattedConversations = conversations.map((conversation) => {
      const otherUser = conversation.userAId === userId ? conversation.userB : conversation.userA;

      const isDeletedUser = otherUser.isDeleted;

      const displayName = isDeletedUser ? "Deleted User" : [otherUser.firstName, otherUser.lastName].filter(Boolean).join(" ") || otherUser.username || "Unknown user";

      const lastMessage = conversation.messages.at(-1);

      return {
        id: conversation.id,
        name: displayName,
        isDeletedUser,
        lastMessage: lastMessage?.isDeleted
          ? "This message was deleted"
          : lastMessage?.content ?? "",
        timestamp: lastMessage?.createdAt.toISOString() ?? null,
        messages: conversation.messages.map((message) => ({
          id: message.id,
          content: message.content,
          createdAt: message.createdAt.toISOString(),
          isOwn: message.senderId === userId,
          isDeleted: message.isDeleted,
        })),
      };
    });

    formattedPendingRequests = pendingRequests.map((request) => {
      const sender = request.sender;
      const isDeletedUser = sender.isDeleted;

      const displayName = isDeletedUser ? "Deleted User" : [sender.firstName, sender.lastName].filter(Boolean).join(" ") || sender.username || "Unknown user";

      return {
        id: request.id,
        senderId: sender.id,
        name: displayName,
        isDeletedUser,
        status: request.status,
        createdAt: request.createdAt.toISOString(),
      };
    });
  } catch (error) {
    console.error("Failed to load conversations:", error);
    loadError = "Unable to load conversations. Please try again.";
  }

  return (
    <MessagesClient
      conversations={formattedConversations}
      requests={formattedPendingRequests}
      error={loadError}
    />
  );
}