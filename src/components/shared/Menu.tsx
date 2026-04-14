"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Building2, ClipboardList, FileText, Home, LogOut, MessageSquare, UserRound, Users, X, Fence } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSessionContext } from "./app-frame";

type AppSidebarProps = {
  role?: string;
  name?: string | null;
  open: boolean;
  onClose: () => void;
};

const navigation = [
  { href: "/app", label: "Overview", icon: Home },
  { href: "/app/listings", label: "Listings", icon: Building2 },
  { href: "/app/listings/my-properties", label: "Your Listings", icon: Fence },
  { href: "/app/applications/dashboard", label: "Applications", icon: FileText },
  { href: "/app/reports", label: "Report Queue", icon: ClipboardList, moderatorOnly: true },
  { href: "/app/reports/users", label: "All Users", icon: Users, moderatorOnly: true },
  { href: "/app/messages", label: "Messages", icon: MessageSquare },
  { href: "/app/profile", label: "Profile", icon: UserRound },
];


export default function Menu({ role, name, open, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const displayRole = role ? role.charAt(0) + role.slice(1).toLowerCase() : "Workspace";
  const [isSigningOut, setIsSigningOut] = useState(false);
  const initial = (name ?? displayRole ?? "U").slice(0, 1).toUpperCase();
  const { isLandlord, isModerator } = useSessionContext();

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  }

  // your listing button 7690is only visisble to landlords
  const filteredNavigation = navigation.filter((item) => {
    if (item.href === "/app/listings/my-properties") return isLandlord;
    if (item.href === "/app/applications/dashboard") return !isModerator;
    if (item.moderatorOnly) return isModerator;
    return true;
  });

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/55 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col border-r border-white/10 bg-[#111111] px-5 py-5 text-white shadow-2xl backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-0 lg:h-screen lg:w-72 lg:self-start lg:translate-x-0 lg:bg-transparent lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between lg:block">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-primary/80">FlatDM</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">Workspace</h1>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X />
          </Button>
        </div>

        <nav className="mt-8 space-y-2">
          {filteredNavigation.map((item) => {
           const isActive =
           pathname === item.href ||
           (item.href !== "/app" &&
             pathname.startsWith(item.href) &&
             !pathname.startsWith(item.href + "/"));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors",
                  isActive
                    ? "border-primary/35 bg-primary text-primary-foreground"
                    : "border-white/8 bg-white/[0.03] text-white/72 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[28px] border border-white/10 bg-black/20 p-3">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-primary text-xs font-semibold text-primary-foreground">
              {initial}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{name ?? "FlatDM user"}</p>
              <p className="text-xs text-white/55">{displayRole}</p>

              <div className="mt-3 flex">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit px-2"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  <LogOut className="size-3.5" />
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}