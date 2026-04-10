import { redirect } from "next/navigation";
import VerifyEmailPanel from "@/components/layout/auth/verify-email-panel";
import { auth } from "@/lib/auth";

export default async function VerifyEmailPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.emailVerified) {
    redirect("/app");
  }

  return (
    <VerifyEmailPanel
      email={session.user.email ?? ""}
      firstName={session.user.firstName ?? null}
    />
  );
}
