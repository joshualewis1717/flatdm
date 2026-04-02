import Link from "next/link";
import {
  ArrowRight,
  Mail,
  Phone,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const roleCopy = {
  CONSULTANT: {
    eyebrow: "Consultant profile",
    headline: "Present the details landlords need to trust you quickly.",
    description:
      "Keep your contact details, placement context, and application momentum in one place so every next step feels easier.",
    primaryCta: { href: "/app/applications", label: "Review my applications" },
    secondaryCta: { href: "/app/messages", label: "Open inbox" },
    stats: [
      { label: "Applications sent", key: "applications" },
      { label: "Unread messages", key: "messages" },
      { label: "Reviews received", key: "reviews" },
    ],
  },
  LANDLORD: {
    eyebrow: "Landlord profile",
    headline: "Show consultants a responsive, credible homebase.",
    description:
      "Your profile should feel like a control room for listings, incoming interest, and the trust signals that help tenants commit.",
    primaryCta: { href: "/app/listings/new", label: "Create a new listing" },
    secondaryCta: { href: "/app/applications", label: "Review applicants" },
    stats: [
      { label: "Live listings", key: "listings" },
      { label: "Unread messages", key: "messages" },
      { label: "Reviews received", key: "reviews" },
    ],
  },
  MODERATOR: {
    eyebrow: "Moderator profile",
    headline: "Keep the marketplace calm, visible, and accountable.",
    description:
      "A strong internal profile helps you move between reports, listings, and conversations without losing context.",
    primaryCta: { href: "/app/applications", label: "Open review queue" },
    secondaryCta: { href: "/app/messages", label: "Check conversations" },
    stats: [
      { label: "Reports filed", key: "reports" },
      { label: "Unread messages", key: "messages" },
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

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const userId = Number(session.user.id);
  const role = session.user.role ?? "CONSULTANT";
  const copy = roleCopy[role as keyof typeof roleCopy] ?? roleCopy.CONSULTANT;

  const [user, profile, applicationCount, listingCount, unreadMessageCount, reviewCount, reportCount] =
    await Promise.all([
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
      prisma.message.count({
        where: {
          senderId: { not: userId },
          conversation: {
            OR: [{ userAId: userId }, { userBId: userId }],
          },
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

  const statValues = {
    applications: applicationCount,
    listings: listingCount,
    messages: unreadMessageCount,
    reviews: reviewCount,
    reports: reportCount,
  } as const;

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
                  @{user?.username ?? "profile"} • Joined {joinedDate}
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
                {statValues[stat.key]}
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
              <h2 className="text-2xl font-semibold tracking-tight text-white">Core identity</h2>
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
                <p className="mt-2 text-base font-medium text-white">
                  {user?.email ?? session.user.email ?? "Not set"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/45">
                  <Phone className="size-3.5" />
                  Phone
                </p>
                <p className="mt-2 text-base font-medium text-white">
                  {profile?.phone ?? "Add a contact number"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[1.9rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-primary">
                <Sparkles className="size-5" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">About</h2>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-sm leading-7 text-white/72">
                {profile?.bio ??
                  "Add a short bio to help other people understand how you use FlatDM, what kind of place or tenant you are looking for, and how quickly you usually respond."}
              </p>
            </div>

          </section>
        </div>
      </section>
    </div>
  );
}
