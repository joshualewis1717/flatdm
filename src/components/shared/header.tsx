"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserProfile from "./user-profile";


const headers: Record<string, { title: string; description: string }> = {
  "/app": {
    title: "Overview",
    description: "Single place to track the health of listings, applications, and conversations.",
  },
  "/app/listings": {
    title: "Listings",
    description: "Review available properties, add new stock, and manage what is currently live.",
  },
  "/app/applications": {
    title: "Applications",
    description: "Stay on top of active applicants, current decisions, and outstanding follow-up.",
  },
  "/app/messages": {
    title: "Messages",
    description: "Handle active conversations without losing context across listings and applications.",
  },
  "/app/reports": {
    title: "Reports",
    description: "Monitor flagged content, review details, and take action to keep the marketplace healthy.",
  },
};


export default function Header({ name, email, onMenuClick } : {
  name?: string | null;
  email?: string | null;
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  const meta = headers[pathname] ?? headers["/app"];

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-start gap-3">
          <Button
            variant="outline"
            size="icon"
            className="mt-1 lg:hidden"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu />
          </Button>
          <div className="min-w-0">
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {meta.title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-white/60">{meta.description}</p>
          </div>
        </div>

        <UserProfile name={name} email={email} />
      </div>
    </header>
  );
}
