"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

type HeaderMeta = {
  title: string;
  description: string;
};

const headers: Record<string, HeaderMeta> = {
  "/app": {
    title: "Overview",
    description: "Single place to track the health of listings, applications, and conversations.",
  },
  "/app/listings": {
    title: "Listings",
    description: "Review available properties, add new stock, and manage what is currently live.",
  },
  "/app/listings/my-properties": {
    title: "Your listings",
    description: "Manage the properties you have listed and keep availability up to date.",
  },
  "/app/listings/new": {
    title: "New listing",
    description: "Create a property listing and add the details applicants need.",
  },
  "/app/listings/edit/*": {
    title: "Edit listing",
    description: "Update listing details, availability, images, and property information.",
  },
  "/app/listings/*": {
    title: "Listing details",
    description: "Review the property details, availability, amenities, and next steps.",
  },
  "/app/applications": {
    title: "Applications",
    description: "Stay on top of active applicants, current decisions, and outstanding follow-up.",
  },
  "/app/applications/*": {
    title: "Applications",
    description: "Stay on top of active applicants, current decisions, and outstanding follow-up.",
  },
  "/app/messages": {
    title: "Messages",
    description: "Handle active conversations without losing context across listings and applications.",
  },
  "/app/profile": {
    title: "Profile",
    description: "Keep your account details current and track the activity that matters for your role.",
  },
  "/app/profile/edit": {
    title: "Edit profile",
    description: "Update your personal details and keep your profile current.",
  },
  "/app/profile/edit/*": {
    title: "Edit profile",
    description: "Update your personal details and keep your profile current.",
  },
  "/app/profile/*": {
    title: "Profile",
    description: "Keep your account details current and track the activity that matters for your role.",
  },
  "/app/reviews": {
    title: "Reviews",
    description: "Track incoming reviews, leave feedback, and build trust across the platform.",
  },
  "/app/reviews/new": {
    title: "Leave a review",
    description: "Share feedback about another user or listing.",
  },
  "/app/reviews/new/*": {
    title: "Leave a review",
    description: "Share feedback about another user or listing.",
  },
  "/app/reviews/*": {
    title: "Reviews",
    description: "Track incoming reviews, leave feedback, and build trust across the platform.",
  },
  "/app/reports": {
    title: "Report queue",
    description: "Triage open reports, assign moderators, and move resolved cases out of the queue.",
  },
  "/app/reports/users": {
    title: "All users",
    description: "Review account details, open profiles, and apply moderation actions from one place.",
  },
  "/app/reports/*": {
    title: "Reports",
    description: "Monitor flagged content, review details, and take action to keep the marketplace healthy.",
  },
};

function getHeaderMeta(pathname: string) {
  const exactMatch = headers[pathname];

  if (exactMatch) return exactMatch;
  
  const wildcardMatch = Object.entries(headers)
    .filter(([path]) => path.endsWith("/*"))
    .sort(([a], [b]) => b.length - a.length)
    .find(([path]) => pathname.startsWith(path.slice(0, -1)));

  return wildcardMatch?.[1] ?? headers["/app"];
}

export default function Header({ onMenuClick } : { onMenuClick: () => void; }) {
  const pathname = usePathname();
  const meta = getHeaderMeta(pathname);

  return (
    <header
      id="app-page-header"
      className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur-xl"
    >
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
      </div>
    </header>
  );
}
