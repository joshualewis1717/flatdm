import Link from "next/link";
import { ArrowRight, Home, UserRound } from "lucide-react";

export type ReviewListItem = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: Date;
  listingId: number | null;
  author: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    role: string;
  };
  targetUser: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    role: string;
  } | null;
  listing: {
    id: number;
    flatNumber: string | null;
    property: {
      title: string;
      city: string;
    };
  } | null;
};

export function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

export function getReviewType(review: {
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

export function ReviewCard({ review }: { review: ReviewListItem }) {
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
    <Link
      href={`/app/reviews/${review.id}`}
      className="block rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white/85">
              <TypeIcon type={type} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-primary/80">{type}</p>
              <p className="mt-1 text-sm text-white/55">
                {formatDate(review.createdAt)} • {review.rating} / 5 stars
              </p>
            </div>
          </div>

          <h2 className="mt-4 text-xl font-semibold tracking-tight text-white">
            {authorName} reviewed {targetName}
          </h2>

          <p className="mt-3 line-clamp-3 text-sm leading-7 text-white/68">
            {review.comment?.trim() || "No written feedback was included with this review."}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-sm font-medium text-white/85">
          Open review
          <ArrowRight className="size-4" />
        </div>
      </div>
    </Link>
  );
}
