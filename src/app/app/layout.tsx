import { redirect } from "next/navigation";

import { AppFrame } from "@/components/shared/app-frame";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  console.log("session is", session)

  if (!session?.user) redirect("/login");
  

  return (
    <AppFrame
    // overwrite actual session for testing
      role={session.user.role as (Role | undefined)}
      firstName={session.user.firstName ?? null}
      lastName={session.user.lastName ?? null}
      email={session.user.email ?? null}
    >
      {children}
    </AppFrame>
  );
}
