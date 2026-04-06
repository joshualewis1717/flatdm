import Link from "next/link";
import {
  ArrowRight,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProfilePageData } from "@/lib/profile";

const ownCopy = {
  CONSULTANT: {
    eyebrow: "Consultant profile",
    headline: "Present the details landlords need to trust you quickly.",
    description:
      "This is your private profile workspace. Keep your contact details, placement context, and application momentum in one place.",
    primaryCta: { href: "/app/applications", label: "Review my applications" },
    secondaryCta: { href: "/app/messages", label: "Open inbox" },
    stats: [
      { label: "Applications sent", key: "applications" },
      { label: "Unread messages", key: "unreadMessages" },
      { label: "Reviews received", key: "reviews" },
    ],
  },
  LANDLORD: {
    eyebrow: "Landlord profile",
    headline: "Show consultants a responsive, credible homebase.",
    description:
      "This is your private profile workspace. Keep your listings, contact details, and trust signals ready for prospective tenants.",
    primaryCta: { href: "/app/listings/new", label: "Create a new listing" },
    secondaryCta: { href: "/app/applications", label: "Review applicants" },
    stats: [
      { label: "Live listings", key: "listings" },
      { label: "Unread messages", key: "unreadMessages" },
      { label: "Reviews received", key: "reviews" },
    ],
  },
  MODERATOR: {
    eyebrow: "Moderator profile",
    headline: "Keep the marketplace calm, visible, and accountable.",
    description:
      "This is your private profile workspace. Use it to keep context around reports, conversations, and your moderation footprint.",
    primaryCta: { href: "/app/reports", label: "Open report queue" },
    secondaryCta: { href: "/app/messages", label: "Check conversations" },
    stats: [
      { label: "Reports filed", key: "reports" },
      { label: "Unread messages", key: "unreadMessages" },
      { label: "Reviews received", key: "reviews" },
    ],
  },
} as const;

const publicCopy = {
  CONSULTANT: {
    eyebrow: "Consultant profile",
    headline: "A quick read on who this consultant is and how active they have been.",
    description:
      "This is the public-facing view. It should help landlords assess responsiveness, history, and general fit without exposing private contact details.",
    primaryCta: { href: "/app/messages", label: "Open inbox" },
    secondaryCta: { href: "/app/listings", label: "Browse listings" },
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
    primaryCta: { href: "/app/messages", label: "Open inbox" },
    secondaryCta: { href: "/app/listings", label: "Browse listings" },
    stats: [
      { label: "Live listings", key: "listings" },
      { label: "Properties added", key: "properties" },
      { label: "Reviews received", key: "reviews" },
    ],
  },
  MODERATOR: {
    eyebrow: "Moderator profile",
    headline: "A quick read on this moderator's footprint inside the marketplace.",
    description:
      "This is the public-facing view. Keep it lightweight and trust-oriented so people can understand role and activity at a glance.",
    primaryCta: { href: "/app/messages", label: "Open inbox" },
    secondaryCta: { href: "/app", label: "Back to overview" },
    stats: [
      { label: "Reports filed", key: "reports" },
      { label: "Rental history", key: "rentalHistory" },
      { label: "Reviews received", key: "reviews" },
    ],
  },
} as const;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

type StatKey = keyof ProfilePageData["stats"];

export default function ProfileView({
  profile,
  isOwnProfile,
}: {
  profile: ProfilePageData;
  isOwnProfile: boolean;
}) {
  const copySet = isOwnProfile ? ownCopy : publicCopy;
  const copy = copySet[profile.role];
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "FlatDM user";
  const initial = fullName.charAt(0).toUpperCase();
  const joinedDate = formatDate(profile.createdAt);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/5 bg-[linear-gradient(135deg,rgba(201,251,0,0.18),rgba(255,255,255,0.04)_42%,rgba(255,255,255,0.02)_100%)]">
        <div className="px-6 py-8 lg:px-8 lg:py-10">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-[1.35rem] bg-black/25 text-lg font-semibold text-white">
                {initial}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">
                  {copy.eyebrow}
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
              <p className="text-lg text-white/78">{copy.headline}</p>
              <p className="max-w-2xl text-sm leading-7 text-white/68">{copy.description}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-2xl px-5">
                <Link href={copy.primaryCta.href}>
                  {copy.primaryCta.label}
                  <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-2xl border-white/12 bg-white/[0.03] px-5 text-white hover:bg-white/[0.06]"
              >
                <Link href={copy.secondaryCta.href}>{copy.secondaryCta.label}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {copy.stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5"
            >
              <p className="text-sm text-white/55">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                {profile.stats[stat.key as StatKey]}
              </p>
            </article>
          ))}
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
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">Full name</p>
                <p className="mt-2 text-base font-medium text-white">{fullName}</p>
              </div>
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
              {isOwnProfile ? (
                <>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/45">
                      <Mail className="size-3.5" />
                      Email
                    </p>
                    <p className="mt-2 text-base font-medium text-white">{profile.email}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:col-span-2">
                    <p className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/45">
                      <Phone className="size-3.5" />
                      Phone
                    </p>
                    <p className="mt-2 text-base font-medium text-white">
                      {profile.phone ?? "Add a contact number"}
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/45">
                    <ShieldCheck className="size-3.5" />
                    Privacy
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/72">
                    Contact details stay private until the relationship moves into messaging or a formal application flow.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[1.9rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-primary">
                <Sparkles className="size-5" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                {isOwnProfile ? "About you" : "About"}
              </h2>
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
