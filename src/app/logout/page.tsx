"use client";

import { useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  useEffect(() => {
    void signOut({ callbackUrl: "/login" });
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="text-center">
        <p className="text-base">Signing you out...</p>
        <p className="mt-2 text-sm text-muted-foreground">
          If this takes too long, continue to <Link href="/login" className="underline">Login</Link>.
        </p>
      </div>
    </main>
  );
}
