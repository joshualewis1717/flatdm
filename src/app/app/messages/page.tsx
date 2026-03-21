import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MessagesClient from "./_components/MessagesClient";

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
        orderBy: { createdAt: "asc" }
      },
    },
  });

  const formatted = conversations.map((c) => {
    const otherUser =
      c.userAId === userId ? c.userB : c.userA;

    return {
      id: c.id,
      name: `${otherUser.firstName} ${otherUser.lastName}`,
      lastMessage: c.messages.at(-1)?.content ?? "",
      timestamp: c.messages.at(-1)?.createdAt.toISOString() ?? null,
      messages: c.messages.map((m) => ({
        id: m.id,
        content: m.content,
        isOwn: m.senderId === userId,
      }))
      };
  });

  return <MessagesClient conversations={formatted} />;
}