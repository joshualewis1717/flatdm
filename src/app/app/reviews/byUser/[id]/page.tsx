import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { REVIEWS_DATABASE_ERROR_MESSAGE } from "@/lib/reviews";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "../../review-ui";
import ErrorMessage from "@/components/shared/ErrorMessage";

export default async function UserReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = Number(id);

  if (Number.isNaN(userId)) {
    notFound();
  }
  let user;
  try{
      user = await prisma.user.findFirst({
      where: {
        id: userId,
        isDeleted: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
      },
    });
  } catch {
    return <ErrorMessage text={REVIEWS_DATABASE_ERROR_MESSAGE} />;
  }

  if (!user) {
    notFound();
  }

  let reviews;

  try {
    reviews = await prisma.review.findMany({
    where: {
      isDeleted: false,
      authorId: user.id,
    },
    orderBy: { createdAt: "desc" },
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
          property: {
            select: {
              title: true,
              city: true,
            },
          },
        },
      },
    },
  });
} catch {
  return <ErrorMessage text={REVIEWS_DATABASE_ERROR_MESSAGE} />;
}

  const userName = `@${user.username}`;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">
          User reviews
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Reviews by {userName}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
          Browse all reviews submitted by this user.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-2xl border-white/12 bg-white/[0.03] px-5 text-white hover:bg-white/[0.06]"
          >
            <Link href={`/app/profile/${user.id}`}>
              <ArrowLeft />
              Back to profile
            </Link>
          </Button>
          <Button asChild size="lg" className="rounded-2xl px-5">
            <Link href={`/app/reviews/new?userId=${user.id}&from=/app/reviews/user/${user.id}`}>
              <Star />
              Leave a review
            </Link>
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
            No reviews have been submitted for this user yet.
          </div>
        ) : (
          reviews.map((review) => <ReviewCard key={review.id} review={review} />)
        )}
      </section>
    </div>
  );
}
