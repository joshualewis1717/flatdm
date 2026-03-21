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
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const formatted = conversations.map((c) => {
    const other =
      c.userAId === userId ? c.userB : c.userA;

    return {
      id: c.id,
      name: `${other.firstName} ${other.lastName}`,
      lastMessage: c.messages[0]?.content ?? "",
      timestamp: c.messages[0]?.createdAt?.toISOString() ?? null,
      };
  });

  return <MessagesClient conversations={formatted} />;
}