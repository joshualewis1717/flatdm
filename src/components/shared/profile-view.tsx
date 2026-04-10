import Link from "next/link";
import {
  ArrowRight,
  Pencil,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProfilePageData } from "@/lib/profile";

type StatKey = keyof ProfilePageData["stats"];

type StatConfig = {
  label: string;
  key: StatKey;
  href?: string;
};

const ownCopy = {
  CONSULTANT: {
    eyebrow: "Consultant profile",
    description:
      "This is your private profile workspace. Keep your contact details, placement context, and application momentum in one place.",
    primaryCta: { href: "/app/profile/edit", label: "Edit profile" },
    secondaryCta: { href: "/app/messages", label: "Open inbox" },
    stats: [
      { label: "Applications sent", key: "applications", href: "/app/applications" },
      { label: "Unread messages", key: "unreadMessages", href: "/app/messages" },
      { label: "Reviews received", key: "reviews", href: "/app/reviews" },
    ],
  },
  LANDLORD: {
    eyebrow: "Landlord profile",
    description:
      "This is your private profile workspace. Keep your listings, contact details, and trust signals ready for prospective tenants.",
    primaryCta: { href: "/app/profile/edit", label: "Edit profile" },
    secondaryCta: { href: "/app/applications", label: "Review applicants" },
    stats: [
      { label: "Live listings", key: "listings", href: "/app/listings" },
      { label: "Unread messages", key: "unreadMessages", href: "/app/messages" },
      { label: "Reviews received", key: "reviews", href: "/app/reviews" },
    ],
  },
  MODERATOR: {
    eyebrow: "Moderator profile",
    description:
      "This is your private profile workspace. Use it to keep context around reports, conversations, and your moderation footprint.",
    primaryCta: { href: "/app/profile/edit", label: "Edit profile" },
    secondaryCta: { href: "/app/reports", label: "Open report queue" },
    stats: [
      { label: "Reports filed", key: "reports" },
      { label: "Unread messages", key: "unreadMessages", href: "/app/messages" },
      { label: "Reviews received", key: "reviews", href: "/app/reviews" },
    ],
  },
} as const satisfies Record<string, {
  eyebrow: string;
  description: string;
  primaryCta: { href: string; label: string };
  secondaryCta: { href: string; label: string };
  stats: readonly StatConfig[];
}>;

const publicCopy = {
  CONSULTANT: {
    eyebrow: "Consultant profile",
    headline: "A quick read on who this consultant is and how active they have been.",
    description:
      "This is the public-facing view. It should help landlords assess responsiveness, history, and general fit without exposing private contact details.",
    primaryCta: { href: "/app/messages", label: "Message them" },
    secondaryCta: { href: "/app/reviews/new", label: "Leave a review" },
    stats: [
      { label: "Applications sent", key: "applications" },
      { label: "Rental history", key: "rentalHistory" },
      { label: "Reviews received", key: "reviews" },
    ],
  },
  LANDLORD: {
    eyebrow: "Landlord profile",
    headline: "A quick read on who this landlord is and the stock they manage.",
    description:
      "This is the public-facing view. It should help consultants gauge supply, credibility, and activity without exposing private contact details.",
    primaryCta: { href: "/app/messages", label: "Message them" },
    secondaryCta: { href: "/app/reviews/new", label: "Leave a review" },
    stats: [
      { label: "Live listings", key: "listings" },
      { label: "Properties added", key: "properties" },
      { label: "Average review", key: "averageReview" },
    ],
  },
  MODERATOR: {
    eyebrow: "Moderator profile",
    headline: "A quick read on this moderator's footprint inside the marketplace.",
    description:
      "This is the public-facing view. Keep it lightweight and trust-oriented so people can understand role and activity at a glance.",
    primaryCta: { href: "/app/messages", label: "Message them" },
    secondaryCta: { href: "/app/reviews/new", label: "Leave a review" },
    stats: [
      { label: "Reports filed", key: "reports" },
      { label: "Rental history", key: "rentalHistory" },
      { label: "Reviews received", key: "reviews" },
    ],
  },
} as const satisfies Record<string, {
  eyebrow: string;
  headline: string;
  description: string;
  primaryCta: { href: string; label: string };
  secondaryCta: { href: string; label: string };
  stats: readonly StatConfig[];
}>;

const editableFields = [
  { label: "Full name", valueKey: "fullName", query: "fullName" },
  { label: "Username", valueKey: "username", query: "username" },
  { label: "Email", valueKey: "email", query: "email" },
  { label: "Phone", valueKey: "phone", query: "phone" },
] as const;

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

export default function ProfileView({
  profile,
  isOwnProfile,
}: {
  profile: ProfilePageData;
  isOwnProfile: boolean;
}) {
  const ownConfig = ownCopy[profile.role];
  const publicConfig = publicCopy[profile.role];
  const config = isOwnProfile ? ownConfig : publicConfig;
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "FlatDM user";
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
                {fullName.charAt(0).toUpperCase()}
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
              {!isOwnProfile && "headline" in config ? (
                <p className="text-lg text-white/78">{config.headline}</p>
              ) : null}
              <p className="max-w-2xl text-sm leading-7 text-white/68">{config.description}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-2xl px-5">
                <Link
                  href={
                    isOwnProfile
                      ? config.primaryCta.href
                      : `${publicConfig.primaryCta.href}?userId=${profile.id}`
                  }
                >
                  {config.primaryCta.label}
                  <ArrowRight />
                </Link>
              </Button>
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
                      : `${publicConfig.secondaryCta.href}?userId=${profile.id}`
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

            if (!isOwnProfile || !stat.href) {
              return <div key={stat.label}>{card}</div>;
            }

            return (
              <Link key={stat.label} href={stat.href}>
                {card}
              </Link>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
          <section className="rounded-[1.9rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-primary">
                <UserRound className="size-5" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                {isOwnProfile ? "Private details" : "Public details"}
              </h2>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {isOwnProfile ? (
                <>
                  {editableFields.map((field) => (
                    <div
                      key={field.label}
                      className={field.query === "phone" ? "rounded-2xl border border-white/10 bg-black/20 p-4 sm:col-span-2" : "rounded-2xl border border-white/10 bg-black/20 p-4"}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                            {field.label}
                          </p>
                          <p className="mt-2 truncate text-base font-medium text-white">
                            {editableValues[field.valueKey]}
                          </p>
                        </div>
                        <Button asChild variant="outline" size="sm" className="shrink-0">
                          <Link href={`/app/profile/edit?field=${field.query}`}>
                            <Pencil className="size-3.5" />
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
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
                    ? "Add a short bio so people understand how you use FlatDM and what kind of move or tenancy you are looking for."
                    : "This user has not added a public bio yet. Their profile is still useful for role, history, and activity signals.")}
              </p>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
