import Link from "next/link";
import {
  ArrowRight,
  Pencil,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import type { RequestStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import type { ProfilePageData } from "@/lib/profile";
import RequestButton from "@/app/app/requests/_components/RequestButton";

type StatKey = keyof ProfilePageData["stats"];
type StatConfig = {
  label: string;
  key: StatKey;
  href?: (profileId: number) => string;
};

const ownCopy = {
  CONSULTANT: {
    eyebrow: "Consultant profile",
    primaryCta: { href: "/app/profile/edit", label: "Edit profile" },
    secondaryCta: { href: "/app/messages", label: "Open inbox" },
    stats: [
      { label: "Applications sent", key: "applications", href: () => `/app/applications` },
      { label: "Reviews made", key: "reviewsMade", href: (id) => `/app/reviews/byUser/${id}` },
      { label: "Reviews received", key: "reviews", href: (id) => `/app/reviews/user/${id}` },
    ],
  },
  LANDLORD: {
    eyebrow: "Landlord profile",
    primaryCta: { href: "/app/profile/edit", label: "Edit profile" },
    secondaryCta: { href: "/app/applications", label: "Review applicants" },
    stats: [
      { label: "Live listings", key: "listings", href: () => `/app/listings` },
      { label: "Reviews made", key: "reviewsMade", href: (id) => `/app/reviews/byUser/${id}` },
      { label: "Reviews received", key: "reviews", href: (id) => `/app/reviews/user/${id}` },
    ],
  },
  MODERATOR: {
    eyebrow: "Moderator profile",
    primaryCta: { href: "/app/profile/edit", label: "Edit profile" },
    secondaryCta: { href: "/app/reports", label: "Open report queue" },
    stats: [
      { label: "Reports in progress", key: "reportsInProcess", href: () => `/app/reports` },
      { label: "Reports handled", key: "totalReportsHandled" },
      { label: "Unopened reports", key: "unopenedReports", href: () => `/app/reports` },
    ],
  },
} as const satisfies Record<string, {
  eyebrow: string;
  primaryCta: { href: string; label: string };
  secondaryCta: { href: string; label: string };
  stats: readonly StatConfig[];
}>;

const publicCopy = {
  CONSULTANT: {
    eyebrow: "Consultant profile",
    primaryCta: { href: "/app/messages", label: "Message them" },
    secondaryCta: { href: "/app/reviews/new", label: "Leave a review" },
    stats: [
      { label: "Reviews Made", key: "reviewsMade", href: (id) => `/app/reviews/byUser/${id}` },
      { label: "Rental history", key: "rentalHistory" },
      { label: "Reviews received", key: "reviews", href: (id) => `/app/reviews/user/${id}` },
    ],
  },
  LANDLORD: {
    eyebrow: "Landlord profile",
    primaryCta: { href: "/app/messages", label: "Message them" },
    secondaryCta: { href: "/app/reviews/new", label: "Leave a review" },
    stats: [
      { label: "Live listings", key: "listings" },
      { label: "Properties added", key: "properties" },
      { label: "Average review", key: "averageReview", href: (id) => `/app/reviews/user/${id}` },
    ],
  },
  MODERATOR: {
    eyebrow: "Moderator profile",
    primaryCta: { href: "/app/messages", label: "Message them" },
    secondaryCta: { href: "/app/reviews/new", label: "Leave a review" },
    stats: [
      { label: "Total reports handled", key: "totalReportsHandled" },
      { label: "Reports being processed", key: "reportsInProcess" },
    ],
  },
} as const satisfies Record<string, {
  eyebrow: string;
  primaryCta: { href: string; label: string };
  secondaryCta: { href: string; label: string };
  stats: readonly StatConfig[];
}>;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatStatValue(profile: ProfilePageData, key: StatKey) {
  if (key === "averageReview") {
    return profile.stats.averageReview === null ? "No reviews" : `${profile.stats.averageReview.toFixed(1)} / 5`;
  }

  return profile.stats[key];
}

function isConsultant(profile: ProfilePageData) {
  return profile.role === "CONSULTANT";
}

function getReviewHref({ profileId }: { profileId: number }) {
  return `/app/reviews/new?userId=${profileId}&from=/app/profile/${profileId}`;
}

export default function ProfileView({
  profile,
  isOwnProfile,
  hasExistingConversation,
  requestStatus,
}: {
  profile: ProfilePageData;
  isOwnProfile: boolean;
  hasExistingConversation: boolean;
  requestStatus?: RequestStatus | null;
}) {
  const ownConfig = ownCopy[profile.role];
  const publicConfig = publicCopy[profile.role];
  const config = isOwnProfile ? ownConfig : publicConfig;
  const fullName =  isOwnProfile ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "FlatDM user" : profile.username;
  const joinedDate = formatDate(profile.createdAt);

  const editableValues = {
    fullName,
    username: `@${profile.username}`,
    email: profile.email,
    phone: profile.phone ?? "Add a contact number",
  } as const;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/5 bg-[linear-gradient(135deg,rgba(201,251,0,0.18),rgba(255,255,255,0.04)_42%,rgba(255,255,255,0.02)_100%)]">
        <div className="px-6 py-8 lg:px-8 lg:py-10">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-[1.35rem] bg-black/25 text-lg font-semibold text-white">
                {isConsultant(profile) ? profile.username.charAt(0).toUpperCase() : fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">
                  {config.eyebrow}
                </p>
                <p className="mt-1 text-sm text-white/60">
                  @{profile.username} • Joined {joinedDate}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {fullName}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/68">
                {profile.description ??
                  (isOwnProfile
                    ? "Add a short description about yourself."
                    : "This user has not added a description yet.")}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {!isOwnProfile && !hasExistingConversation ? (
                <RequestButton receiverId={profile.id} initialStatus={requestStatus} />
              ) : (
                <Button asChild size="lg" className="rounded-2xl px-5">
                  <Link
                    href={
                      isOwnProfile
                        ? config.primaryCta.href
                        : publicConfig.primaryCta.href
                    }
                  >
                    {config.primaryCta.label}
                    <ArrowRight />
                  </Link>
                </Button>
              )}
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-2xl border-white/12 bg-white/[0.03] px-5 text-white hover:bg-white/[0.06]"
              >
                <Link
                  href={
                    isOwnProfile
                      ? config.secondaryCta.href
                      : getReviewHref({ profileId: profile.id })
                  }
                >
                  {config.secondaryCta.label}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {config.stats.map((stat) => {
            const card = (
              <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.05]">
                <p className="text-sm text-white/55">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                  {formatStatValue(profile, stat.key)}
                </p>
              </article>
            );

            const href = stat.href?.(profile.id);

            if (!href) {
              return <div key={stat.label}>{card}</div>;
            }

            return (
              <Link key={stat.label} href={href}>
                {card}
              </Link>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
          <section className="rounded-[1.9rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-primary">
                  <UserRound className="size-5" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  {isOwnProfile ? "Private details" : "Public details"}
                </h2>
              </div>
              {isOwnProfile ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/app/profile/edit">
                    <Pencil className="size-3.5" />
                    Edit
                  </Link>
                </Button>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {isOwnProfile ? (
                <>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/45">Full name</p>
                    <p className="mt-2 truncate text-base font-medium text-white">{editableValues.fullName}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/45">Username</p>
                    <p className="mt-2 truncate text-base font-medium text-white">{editableValues.username}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/45">Email</p>
                    <p className="mt-2 truncate text-base font-medium text-white">{editableValues.email}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/45">Phone</p>
                    <p className="mt-2 truncate text-base font-medium text-white">{editableValues.phone}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/45">Role</p>
                    <p className="mt-2 text-base font-medium text-white">
                      {profile.role.charAt(0) + profile.role.slice(1).toLowerCase()}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/45">Username</p>
                    <p className="mt-2 text-base font-medium text-white">@{profile.username}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/45">Role</p>
                    <p className="mt-2 text-base font-medium text-white">
                      {profile.role.charAt(0) + profile.role.slice(1).toLowerCase()}
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="rounded-[1.9rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-primary">
                  {isOwnProfile ? <Sparkles className="size-5" /> : <Star className="size-5" />}
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  {isOwnProfile ? "About you" : "About"}
                </h2>
              </div>
              {isOwnProfile ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/app/profile/edit?field=bio">
                    <Pencil className="size-3.5" />
                    Edit
                  </Link>
                </Button>
              ) : null}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-sm leading-7 text-white/72">
                {profile.bio ??
                  (isOwnProfile
                    ? "Add a bio describing yourself."
                    : "This user has not added a public bio yet.")}
              </p>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
