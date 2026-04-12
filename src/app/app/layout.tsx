import { redirect } from "next/navigation";

import { AppFrame } from "@/components/shared/app-frame";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!session.user.emailVerified) redirect("/verify-email");

  const user = session.user.id
    ? await prisma.user.findUnique({
        where: { id: Number(session.user.id) },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      })
    : null;

  return (
    <AppFrame
      role={(user?.role ?? session.user.role) as (Role | undefined)}
      firstName={user?.firstName ?? session.user.firstName ?? null}
      lastName={user?.lastName ?? session.user.lastName ?? null}
      email={user?.email ?? session.user.email ?? null}
    >
      {children}
    </AppFrame>
  );
}
