"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, FileText, Home, MessageSquare, Plus, ShieldCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import UserProfile from "./user-profile";

type AppSidebarProps = {
  name?: string | null;
  email?: string | null;
  open: boolean;
  onClose: () => void;
};

const navigation = [
  { href: "/app", label: "Overview", icon: Home },
  { href: "/app/listings", label: "Listings", icon: Building2 },
  { href: "/app/application", label: "Applications", icon: FileText },
  { href: "/app/messages", label: "Messages", icon: MessageSquare },
];


export default function Menu({ name, email, open, onClose }: AppSidebarProps) {
  const pathname = usePathname();

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
          "fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col border-r border-white/10 bg-[#111111] px-5 py-5 text-white shadow-2xl backdrop-blur-xl transition-transform duration-300 lg:static lg:z-0 lg:w-72 lg:translate-x-0 lg:bg-transparent lg:shadow-none",
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
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/app" && pathname.startsWith(item.href));
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
        <div className={"mt-auto"}>
          <UserProfile name={name} email={email} />
        </div>
      </aside>
    </>
  );
}
