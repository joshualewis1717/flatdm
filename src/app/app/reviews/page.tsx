import { prisma } from "@/lib/prisma";
import { ReviewCard } from "./review-ui";
import ErrorMessage from "@/components/shared/ErrorMessage";

export default async function ReviewsPage() {
  let reviews;
  try{
    reviews = await prisma.review.findMany({
    where: { isDeleted: false },
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
} catch(err) {
  return <ErrorMessage text="Database Error"/>
}

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">Reviews</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          All reviews
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
          Browse every review currently stored in the app across users, landlords, and listings.
        </p>

      </section>

      <section className="space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
            No reviews have been submitted yet.
          </div>
        ) : (
          reviews.map((review) => <ReviewCard key={review.id} review={review} />)
        )}
      </section>
    </div>
  );
}
