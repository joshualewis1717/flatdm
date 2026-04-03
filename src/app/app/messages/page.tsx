import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MessagesClient from "./_components/_MessagesClient";

export default async function MessagesPage() {
  const session = await auth();
  const userId = Number(session?.user.id);

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { userAId: userId },
        { userBId: userId },
      ],
    },
    include: {
      userA: true,
      userB: true,
      messages: {
        orderBy: { createdAt:"asc" }
      },
    },
  });

  
  const formattedConversations = conversations.map((conversation) => {
    const otherUser = conversation.userAId === userId ? conversation.userB : conversation.userA;
    const displayName = [otherUser.firstName, otherUser.lastName].filter(Boolean).join(" ") || otherUser.username || "Unknown user";

    const lastMessage=conversation.messages.at(-1);
    return {
      id: conversation.id,
      name: displayName,
      lastMessage: lastMessage?.content ?? "",
      timestamp: lastMessage?.createdAt.toISOString() ?? null,
      messages: conversation.messages.map((message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        isOwn: message.senderId === userId
      }))
    };
  });

  return <MessagesClient conversations={formattedConversations} />;
}