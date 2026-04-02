import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, Mail, MapPinned, MessageSquare, Phone, Sparkles, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const roleCopy = {
  CONSULTANT: {
    eyebrow: "Consultant profile",
    headline: "Present the details landlords need to trust you quickly.",
    description:
      "Keep your contact details, placement context, and application momentum in one place so every next step feels easier.",
    focusLabel: "Best used for",
    focusValue: "Placements, applications, and quick landlord conversations",
    primaryCta: { href: "/app/applications", label: "Review my applications" },
    secondaryCta: { href: "/app/messages", label: "Open inbox" },
    stats: [
      { label: "Applications sent", key: "applications" },
      { label: "Active conversations", key: "conversations" },
      { label: "Reviews received", key: "reviews" },
    ],
    checklist: [
      "Add a short bio explaining your current placement or preferred area.",
      "Keep your phone number up to date for faster landlord callbacks.",
      "Use your inbox after applying so promising listings do not cool off.",
    ],
  },
  LANDLORD: {
    eyebrow: "Landlord profile",
    headline: "Show consultants a responsive, credible homebase.",
    description:
      "Your profile should feel like a control room for listings, incoming interest, and the trust signals that help tenants commit.",
    focusLabel: "Best used for",
    focusValue: "Stock management, applicant review, and message response",
    primaryCta: { href: "/app/listings/new", label: "Create a new listing" },
    secondaryCta: { href: "/app/applications", label: "Review applicants" },
    stats: [
      { label: "Live listings", key: "listings" },
      { label: "Properties added", key: "properties" },
      { label: "Reviews received", key: "reviews" },
    ],
    checklist: [
      "Use your bio to mention your areas, property style, or response time.",
      "Make sure your email and phone number are current before going live.",
      "Keep applicants moving by checking both applications and messages daily.",
    ],
  },
  MODERATOR: {
    eyebrow: "Moderator profile",
    headline: "Keep the marketplace calm, visible, and accountable.",
    description:
      "A strong internal profile helps you move between reports, listings, and conversations without losing context.",
    focusLabel: "Best used for",
    focusValue: "Trust and safety review across the marketplace",
    primaryCta: { href: "/app/applications", label: "Open review queue" },
    secondaryCta: { href: "/app/messages", label: "Check conversations" },
    stats: [
      { label: "Threads joined", key: "conversations" },
      { label: "Reports filed", key: "reports" },
      { label: "Reviews received", key: "reviews" },
    ],
    checklist: [
      "Keep identity details clear so escalation decisions stay attributable.",
      "Use your bio for team-facing notes about scope or region if needed.",
      "Check conversations before stepping into reports that involve context gaps.",
    ],
  },
} as const;

function formatRole(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const userId = Number(session.user.id);
  const role = session.user.role ?? "CONSULTANT";
  const copy = roleCopy[role as keyof typeof roleCopy] ?? roleCopy.CONSULTANT;

  const [user, profile, applicationCount, listingCount, propertyCount, conversationCount, reviewCount, reportCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        createdAt: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    }),
    prisma.profile.findUnique({
      where: { userId },
      select: {
        phone: true,
        bio: true,
      },
    }),
    prisma.propertyApplication.count({ where: { userId } }),
    prisma.propertyListing.count({ where: { landlordId: userId } }),
    prisma.property.count({ where: { landlordId: userId } }),
    prisma.conversation.count({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
    }),
    prisma.review.count({ where: { targetUserId: userId } }),
    prisma.report.count({ where: { reporterId: userId } }),
  ]);

  const fullName =
    [user?.firstName ?? session.user.firstName, user?.lastName ?? session.user.lastName]
      .filter(Boolean)
      .join(" ") || "FlatDM user";
  const initial = fullName.charAt(0).toUpperCase();
  const joinedDate = user?.createdAt ? formatDate(user.createdAt) : "Recently";
  const profileCompletionItems = [
    Boolean(user?.firstName && user?.lastName),
    Boolean(user?.email),
    Boolean(profile?.phone),
    Boolean(profile?.bio),
  ];
  const completion = Math.round(
    (profileCompletionItems.filter(Boolean).length / profileCompletionItems.length) * 100
  );

  const statValues = {
    applications: applicationCount,
    listings: listingCount,
    properties: propertyCount,
    conversations: conversationCount,
    reviews: reviewCount,
    reports: reportCount,
  } as const;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/5 bg-[linear-gradient(135deg,rgba(201,251,0,0.18),rgba(255,255,255,0.04)_42%,rgba(255,255,255,0.02)_100%)]">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)] lg:px-8 lg:py-10">
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
                  @{user?.username ?? "profile"} • Joined {joinedDate}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {fullName}
              </h1>
              <p className="max-w-3xl text-lg text-white/78">{copy.headline}</p>
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

          <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-white/55">Profile completion</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{completion}%</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-primary/85">
                {formatRole(role)}
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-primary" style={{ width: `${completion}%` }} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">{copy.focusLabel}</p>
                <p className="mt-2 text-sm leading-6 text-white/75">{copy.focusValue}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">Quick status</p>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  {profile?.bio ? "Bio added" : "Bio missing"} • {profile?.phone ? "Phone added" : "Phone missing"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {copy.stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5"
              >
                <p className="text-sm text-white/55">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                  {statValues[stat.key]}
                </p>
              </article>
            ))}
          </div>

          <section className="rounded-[1.9rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-primary">
                <UserRound className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-primary/85">Account details</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Core identity</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">Full name</p>
                <p className="mt-2 text-base font-medium text-white">{fullName}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">Username</p>
                <p className="mt-2 text-base font-medium text-white">@{user?.username ?? "profile"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/45">
                  <Mail className="size-3.5" />
                  Email
                </p>
                <p className="mt-2 text-base font-medium text-white">{user?.email ?? session.user.email ?? "Not set"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/45">
                  <Phone className="size-3.5" />
                  Phone
                </p>
                <p className="mt-2 text-base font-medium text-white">{profile?.phone ?? "Add a contact number"}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[1.9rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-primary">
                <Sparkles className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-primary/85">About</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Profile story</h2>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-sm leading-7 text-white/72">
                {profile?.bio ??
                  "Add a short bio to help other people understand how you use FlatDM, what kind of place or tenant you are looking for, and how quickly you usually respond."}
              </p>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[1.9rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-primary">
                {role === "LANDLORD" ? <Building2 className="size-5" /> : <BriefcaseBusiness className="size-5" />}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-primary/85">Role guidance</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">What to polish next</h2>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {copy.checklist.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/72">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.9rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-primary">
                <MapPinned className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-primary/85">Workspace links</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Stay in flow</h2>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href={copy.primaryCta.href}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/78 transition-colors hover:border-white/20 hover:bg-black/30 hover:text-white"
              >
                <span>{copy.primaryCta.label}</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/app/messages"
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/78 transition-colors hover:border-white/20 hover:bg-black/30 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="size-4" />
                  Open conversations
                </span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/app/listings"
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/78 transition-colors hover:border-white/20 hover:bg-black/30 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="size-4" />
                  Browse listings
                </span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
