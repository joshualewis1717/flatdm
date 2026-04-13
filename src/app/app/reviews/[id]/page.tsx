import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Home, Star, UserRound } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

function getReviewType(review: {
  author: { role: string };
  targetUser: { role: string } | null;
  listingId: number | null;
}) {
  if (review.listingId) return "user-listing";
  if (!review.targetUser) return "review";
  if (review.author.role === "LANDLORD") return "landlord-user";
  if (review.targetUser.role === "LANDLORD") return "user-landlord";
  return "user-user";
}

function TypeIcon({ type }: { type: string }) {
  if (type === "user-listing") {
    return <Home />;
  }

  return <UserRound />;
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reviewId = Number(id);

  if (Number.isNaN(reviewId)) {
    notFound();
  }

  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      isDeleted: false,
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          role: true,
        },
      },
      targetUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          role: true,
        },
      },
      listing: {
        select: {
          id: true,
          flatNumber: true,
          description: true,
          property: {
            select: {
              title: true,
              streetName: true,
              city: true,
              postcode: true,
            },
          },
          landlord: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
            },
          },
        },
      },
    },
  });

  if (!review) {
    notFound();
  }

  const type = getReviewType(review);
  const authorName =
    `${review.author.firstName} ${review.author.lastName}`.trim() || `@${review.author.username}`;
  const targetName = review.targetUser
    ? `${review.targetUser.firstName} ${review.targetUser.lastName}`.trim() ||
      `@${review.targetUser.username}`
    : review.listing
      ? `${review.listing.property.title}${
          review.listing.flatNumber ? `, Flat ${review.listing.flatNumber}` : ""
        }`
      : "Unknown target";

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">
              {type}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Review #{review.id}
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/68">
              {authorName} reviewed {targetName} on {formatDate(review.createdAt)}.
            </p>
          </div>
          <div className="flex size-14 items-center justify-center rounded-[1.35rem] border border-white/10 bg-black/20 text-white/85">
            <TypeIcon type={type} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-2xl border-white/12 bg-white/[0.03] px-5 text-white hover:bg-white/[0.06]"
          >
            <Link href="/app/reviews">
              <ArrowLeft />
              Back to reviews
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary/85">
                Rating
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-white">
                {review.rating} / 5
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-sm text-white/65">
              <Star className="size-4" />
              Submitted {formatDate(review.createdAt)}
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/15 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-white/45">Comment</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/75">
              {review.comment?.trim() || "No written feedback was included with this review."}
            </p>
          </div>
        </article>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary/85">
              Author
            </p>
            <p className="mt-3 text-xl font-semibold text-white">{authorName}</p>
            <p className="mt-2 text-sm text-white/60">@{review.author.username} • {review.author.role.toLowerCase()}</p>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="mt-5 rounded-xl border-white/12 bg-white/[0.03] text-white hover:bg-white/[0.06]"
            >
              <Link href={`/app/profile/${review.author.id}`}>Open author profile</Link>
            </Button>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary/85">
              Target
            </p>
            {review.targetUser ? (
              <>
                <p className="mt-3 text-xl font-semibold text-white">{targetName}</p>
                <p className="mt-2 text-sm text-white/60">
                  @{review.targetUser.username} • {review.targetUser.role.toLowerCase()}
                </p>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="mt-5 rounded-xl border-white/12 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                >
                  <Link href={`/app/profile/${review.targetUser.id}`}>Open target profile</Link>
                </Button>
              </>
            ) : review.listing ? (
              <>
                <p className="mt-3 text-xl font-semibold text-white">{targetName}</p>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  {review.listing.property.streetName}, {review.listing.property.city}{" "}
                  {review.listing.property.postcode}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Hosted by {review.listing.landlord.firstName} {review.listing.landlord.lastName}
                </p>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="mt-5 rounded-xl border-white/12 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                >
                  <Link href={`/app/listings/${review.listing.id}`}>Open listing</Link>
                </Button>
              </>
            ) : (
              <p className="mt-3 text-sm text-white/60">No target details were found for this review.</p>
            )}
          </section>
        </aside>
      </section>
    </div>
  );
}
