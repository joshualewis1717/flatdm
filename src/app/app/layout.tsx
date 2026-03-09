import { redirect } from "next/navigation";

import { AppFrame } from "@/components/shared/app-frame";
import { auth } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  

  return (
    <AppFrame
      role={session.user.role}
      name={session.user.name}
      email={session.user.email}
    >
      {children}
    </AppFrame>
  );
}
