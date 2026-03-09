"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { Button } from "../ui/button";

export default function UserProfile({
  name,
  email,
} : {
  name: string | null | undefined;
  email?: string | null | undefined;
}) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const initial = (name ?? email ?? "U").slice(0, 1).toUpperCase();

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <div className="hidden min-w-[320px] max-w-[380px] rounded-[28px] border border-white/10 bg-black/2 p-3 xl:block">
        <div className="flex items-start gap-3">
          <div className="flex size-12 items-center justify-center rounded-[18px] bg-primary text-sm font-semibold text-primary-foreground">
            {initial}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{name ?? "FlatDM user"}</p>
            {email && <p className="text-xs text-white/55">{email}</p>}

            <div className="mt-2 flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/app/profile">
                  <User className="size-3.5" />
                  Profile
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut} disabled={isSigningOut}>
                  <LogOut className="size-3.5" />
                  {isSigningOut ? "Signing out..." : "Sign out"}
              </Button>
            </div>
          </div>
      </div>
    </div>
  );
}
