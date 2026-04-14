import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ClipboardList, Home, Star, UserRound } from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ErrorMessage from "@/components/shared/ErrorMessage";

const reviewModes = {
  "landlord-user": {
    title: "Landlord to user review",
    description: "Capture how reliable, communicative, and respectful this user was throughout the process.",
    emptyState: "Open this from a user profile to review a consultant or tenant.",
    targetLabel: "User being reviewed",
    icon: UserRound,
  },
  "user-user": {
    title: "User to user review",
    description: "Share helpful peer feedback after coordinating a move, living together, or handling a flatshare.",
    emptyState: "Open this from another user's profile to leave a peer review.",
    targetLabel: "User being reviewed",
    icon: UserRound,
  },
  "user-listing": {
    title: "User to listing review",
    description: "Review the accuracy, condition, and overall experience of the listing itself.",
    emptyState: "Open this from a listing page to review the property.",
    targetLabel: "Listing being reviewed",
    icon: Home,
  },
  "user-landlord": {
    title: "User to landlord review",
    description: "Rate the landlord on communication, fairness, and how they handled the rental journey.",
    emptyState: "Open this from a landlord profile to review them.",
    targetLabel: "Landlord being reviewed",
    icon: UserRound,
  },
} as const;

type ReviewMode = keyof typeof reviewModes;
type UserRole = "CONSULTANT" | "LANDLORD" | "MODERATOR";

function isReviewMode(value: string | undefined): value is ReviewMode {
  return Boolean(value && value in reviewModes);
}

function inferReviewType({
  authorRole,
  targetRole,
  listingId,
  requestedType,
}: {
  authorRole?: string;
  targetRole?: UserRole;
  listingId?: number | null;
  requestedType?: ReviewMode;
}): ReviewMode | null {
  if (listingId) {
    return authorRole === "LANDLORD" ? null : "user-listing";
  }

  if (targetRole) {
    if (authorRole === "LANDLORD") {
      return targetRole === "LANDLORD" ? null : "landlord-user";
    }

    return targetRole === "LANDLORD" ? "user-landlord" : "user-user";
  }

  return requestedType ?? "user-user";
}

function buildComposerHref({
  type,
  userId,
  listingId,
  from,
  error,
}: {
  type: ReviewMode;
  userId?: number | null;
  listingId?: number | null;
  from?: string | null;
  error?: string | null;
}) {
  const params = new URLSearchParams();
  params.set("type", type);

  if (userId) params.set("userId", String(userId));
  if (listingId) params.set("listingId", String(listingId));
  if (from) params.set("from", from);
  if (error) params.set("error", error);

  return `/app/reviews/new?${params.toString()}`;
}

async function createReview(formData: FormData) {
  "use server";

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const authorId = Number(session.user.id);
  const authorRole = session.user.role;
  const typeValue = formData.get("type");
  const requestedType =
    typeof typeValue === "string" && isReviewMode(typeValue) ? typeValue : "user-user";
  const userIdValue = formData.get("userId");
  const listingIdValue = formData.get("listingId");
  const fromValue = formData.get("from");
  const from = typeof fromValue === "string" && fromValue.length > 0 ? fromValue : null;
  const userId = typeof userIdValue === "string" && userIdValue ? Number(userIdValue) : null;
  const listingId = typeof listingIdValue === "string" && listingIdValue ? Number(listingIdValue) : null;
  const ratingValue = Number(formData.get("rating"));
  const commentValue = formData.get("comment");
  const comment =
    typeof commentValue === "string" && commentValue.trim().length > 0
      ? commentValue.trim()
      : null;

  if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    redirect(
      buildComposerHref({
        type: requestedType,
        userId,
        listingId,
        from,
        error: "Choose a rating from 1 to 5 stars.",
      }),
    );
  }

  if (listingId) {
    const type = inferReviewType({
      authorRole,
      listingId,
      requestedType,
    });

    if (!type) {
      redirect(
        buildComposerHref({
          type: requestedType,
          listingId,
          from,
          error: "Landlords cannot submit listing reviews.",
        }),
      );
    }

    if (!listingId || Number.isNaN(listingId)) {
      redirect(
        buildComposerHref({
          type: requestedType,
          from,
          error: "Open this review from a listing page so we know what to review.",
        }),
      );
    }
    let listing;
    try{
      listing = await prisma.propertyListing.findFirst({
        where: { id: listingId, isDeleted: false },
        select: { id: true },
      });
    } catch(err) {
      return <ErrorMessage text="Database Error"/>
    }

    if (!listing) {
      redirect(
        buildComposerHref({
          type: requestedType,
          listingId,
          from,
          error: "That listing could not be found.",
        }),
      );
    }
    try {
      await prisma.review.create({
        data: {
          authorId,
          listingId,
          rating: ratingValue,
          comment,
        },
      });
    } catch(err) {
      throw new Error("Database Error")
    }

    redirect("/app/reviews?success=1");
  }

  if (!userId || Number.isNaN(userId)) {
    redirect(
      buildComposerHref({
        type: requestedType,
        from,
        error: "Open this review from a user profile so we know who to review.",
      }),
    );
  }

  if (userId === authorId) {
    redirect(
      buildComposerHref({
        type: requestedType,
        userId,
        from,
        error: "You cannot review yourself.",
      }),
    );
  }
  let targetUser;
  try{
    targetUser = await prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
      select: { id: true, role: true },
    });
  } catch(err) {
    return <ErrorMessage text="Database Error"/>
  }

  if (!targetUser) {
    redirect(
      buildComposerHref({
        type: requestedType,
        userId,
        from,
        error: "That user could not be found.",
      }),
    );
  }

  const type = inferReviewType({
    authorRole,
    targetRole: targetUser.role as UserRole,
    requestedType,
  });

  if (!type) {
    redirect(
      buildComposerHref({
        type: requestedType,
        userId,
        from,
        error: "Landlords cannot review other landlords.",
      }),
    );
  }

  try{
    await prisma.review.create({
      data: {
        authorId,
        targetUserId: userId,
        rating: ratingValue,
        comment,
      },
    });
  } catch(err) {
    throw new Error("Database Error")
  }

  redirect("/app/reviews?success=1");
}

export default async function NewReviewPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    from?: string;
    listingId?: string;
    type?: string;
    userId?: string;
  }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const params = await searchParams;
  const requestedType = isReviewMode(params.type) ? params.type : undefined;
  const userId = params.userId ? Number(params.userId) : null;
  const listingId = params.listingId ? Number(params.listingId) : null;
  // const targetUser =
  //   userId && !Number.isNaN(userId)
  //     ? await prisma.user.findFirst({
  //         where: { id: userId, isDeleted: false },
  //         select: {
  //           id: true,
  //           firstName: true,
  //           lastName: true,
  //           role: true,
  //           username: true,
  //         },
  //       })
  //     : null;
  let targetUser = null;
  try {
    const parsedUserId = Number(userId);

    if (!Number.isNaN(parsedUserId)) {
      targetUser = await prisma.user.findFirst({
        where: { id: parsedUserId, isDeleted: false },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            username: true,
          },
      });
    }
  } catch (err) {
    throw new Error("Database error");
  }
  let listing = null;

  const parsedListingId = Number(listingId);

  if (!Number.isNaN(parsedListingId)) {
    try {
      listing = await prisma.propertyListing.findFirst({
        where: { id: parsedListingId, isDeleted: false },
        select: {
          id: true,
          flatNumber: true,
          property: {
            select: {
              title: true,
              streetName: true,
              city: true,
            },
          },
          landlord: {
            select: {
              firstName: true,
              lastName: true,
              username: true,
            },
          },
        },
      });
    } catch (err) {
      console.error(err);
      throw new Error("Database error");
    }
  }
  // const listing =
  //   listingId && !Number.isNaN(listingId)
  //     ? await prisma.propertyListing.findFirst({
  //         where: { id: listingId, isDeleted: false },
  //         select: {
  //           id: true,
  //           flatNumber: true,
  //           property: {
  //             select: {
  //               title: true,
  //               streetName: true,
  //               city: true,
  //             },
  //           },
  //           landlord: {
  //             select: {
  //               firstName: true,
  //               lastName: true,
  //               username: true,
  //             },
  //           },
  //         },
  //       })
  //     : null;
  const type = inferReviewType({
    authorRole: session.user.role,
    targetRole: targetUser?.role as UserRole | undefined,
    listingId: listing?.id,
    requestedType,
  });
  const hasTargetContext = Boolean(targetUser || listing);
  const resolvedType = type ?? requestedType ?? "user-user";
  const config = reviewModes[resolvedType];
  const Icon = config.icon;
  const backHref = params.from || (listing ? `/app/listings/${listing.id}` : targetUser ? `/app/profile/${targetUser.id}` : "/app/reviews");
  const targetName = targetUser
    ? `${targetUser.firstName} ${targetUser.lastName}`.trim() || `@${targetUser.username}`
    : null;
  const listingName = listing
    ? `${listing.property.title}${listing.flatNumber ? `, Flat ${listing.flatNumber}` : ""}`
    : null;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">
              {resolvedType}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {config.title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/68">{config.description}</p>
          </div>
          <div className="flex size-14 items-center justify-center rounded-[1.35rem] border border-white/10 bg-black/20 text-white/85">
            <Icon />
          </div>
        </div>

        {!hasTargetContext ? (
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {(Object.keys(reviewModes) as ReviewMode[]).map((mode) => {
              const isActive = mode === resolvedType;

              return (
                <Link
                  key={mode}
                  href={buildComposerHref({
                    type: mode,
                    from: params.from ?? null,
                  })}
                  className={`rounded-[1.5rem] border p-4 text-sm transition ${
                    isActive
                      ? "border-primary/40 bg-primary/10 text-white"
                      : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-white/45">{mode}</p>
                  <p className="mt-2 font-medium">{reviewModes[mode].title}</p>
                </Link>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        <form
          action={createReview}
          className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8"
        >
          <input type="hidden" name="type" value={resolvedType} />
          <input type="hidden" name="userId" value={targetUser?.id ?? ""} />
          <input type="hidden" name="listingId" value={listing?.id ?? ""} />
          <input type="hidden" name="from" value={params.from ?? ""} />

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary/85">
                Composer
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                Write your review
              </h2>
            </div>
            <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
              1 to 5 stars
            </div>
          </div>

          {params.error ? (
            <div className="mt-6 rounded-[1.5rem] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              {params.error}
            </div>
          ) : null}

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-white/45">
              {config.targetLabel}
            </p>
            <p className="mt-3 text-lg font-medium text-white">
              {resolvedType === "user-listing" ? listingName ?? "No listing selected" : targetName ?? "No user selected"}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              {resolvedType === "user-listing"
                ? listing
                  ? `${listing.property.streetName}, ${listing.property.city} • Hosted by ${listing.landlord.firstName} ${listing.landlord.lastName}`
                  : config.emptyState
                : targetUser
                  ? `@${targetUser.username} • ${targetUser.role.toLowerCase()}`
                  : config.emptyState}
            </p>
          </div>

          <fieldset className="mt-6">
            <legend className="text-sm font-medium text-white">Rating</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-5">
              {[5, 4, 3, 2, 1].map((rating) => (
                <label
                  key={rating}
                  className="flex cursor-pointer items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/80 transition hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <span>{rating} star{rating === 1 ? "" : "s"}</span>
                  <input
                    type="radio"
                    name="rating"
                    value={rating}
                    defaultChecked={rating === 5}
                    className="size-4 accent-[#c9fb00]"
                  />
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-6">
            <label htmlFor="comment" className="text-sm font-medium text-white">
              Written feedback
            </label>
            <Textarea
              id="comment"
              name="comment"
              rows={7}
              className="mt-3 rounded-[1.5rem] border-white/10 bg-black/15 px-4 py-3 text-white placeholder:text-white/35"
              placeholder="Describe your experience living here. Review should be relevant to the property itself and not about the landlord or other tenants."
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="submit"
              size="lg"
              className="rounded-2xl px-5"
              disabled={!type || (resolvedType === "user-listing" ? !listing : !targetUser)}
            >
              <Star />
              Submit review
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-2xl border-white/12 bg-white/[0.03] px-5 text-white hover:bg-white/[0.06]"
            >
              <Link href={backHref}>Go back</Link>
            </Button>
          </div>
        </form>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary/85">
              Review notes
            </p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-white/68">
              <p>Keep feedback specific, factual, and useful for the next person making a decision.</p>
              <p>A great review usually explains what happened, what went well, and where expectations did or did not match reality.</p>
              <p>Avoid private details you would not want shared publicly.</p>
            </div>
          </section>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-xl border-white/12 bg-white/[0.03] text-white hover:bg-white/[0.06]"
              >
                <Link href="/app/reviews">Back to review page</Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-xl border-white/12 bg-white/[0.03] text-white hover:bg-white/[0.06]"
              >
                <Link href="/app/listings">Browse listings</Link>
              </Button>
            </div>
        </aside>
      </section>
    </div>
  );
}
