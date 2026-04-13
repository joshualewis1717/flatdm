"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function deleteReview(reviewId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthenticated");
  }

  const review = await prisma.review.findFirst({
    where: { id: reviewId, isDeleted: false },
    select: { authorId: true },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  if (Number(review.authorId) !== Number(session.user.id)) {
    throw new Error("Unauthorized");
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: { isDeleted: true },
  });
}