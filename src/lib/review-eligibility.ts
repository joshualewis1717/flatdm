import "server-only";

import { prisma } from "@/lib/prisma";

export const LISTING_REVIEW_INELIGIBLE_MESSAGE =
  "You can only review listings you have lived at.";

export async function hasUserLivedAtListing(userId: number, listingId: number) {
  if (!Number.isInteger(userId) || !Number.isInteger(listingId)) {
    return false;
  }

  const occupancy = await prisma.occupant.findFirst({
    where: {
      userId,
      listingId,
      // moveIn: {
      //   lte: new Date(),
      // },
    },
    select: {
      id: true,
    },
  });

  return Boolean(occupancy);
}
