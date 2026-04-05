import { prisma } from "@/lib/prisma";
// raw prisma queries for applications
export async function getListingById(listingId: number) {
  return prisma.propertyListing.findUnique({
    where: { id: listingId, isDeleted: false },
  });
}

export async function getActiveApplication(listingId: number, userId: number) {
  return prisma.propertyApplication.findFirst({
    where: {
      listingId,
      userId,
      status: { in: ["PENDING", "APPROVED"] },
    },
  });
}

export async function getOccupant(listingId: number, userId: number) {
  return prisma.occupant.findFirst({
    where: { listingId, userId },
  });
}

export async function countOccupantsAtDate(
  listingId: number,
  moveInDate: Date
) {
  return prisma.occupant.count({
    where: {
      listingId,
      moveIn: { lte: moveInDate },
      OR: [{ moveOut: null }, { moveOut: { gt: moveInDate } }],
    },
  });
}

export async function createApplicationQuery(data: {
  listingId: number;
  userId: number;
  moveInDate: Date;
  moveOutDate: Date | null;
}) {
  return prisma.propertyApplication.create({
    data: {
      ...data,
      status: "PENDING",
    },
  });
}

export async function deleteApplicationQuery(applicationId: number) {
  return prisma.propertyApplication.delete({
    where: { id: applicationId },
  });
}

export async function updateApplicationStatusQuery(
  applicationId: number,
  status: "APPROVED" | "REJECTED" | "CONFIRMED",
  expiryDate?: Date
) {
  return prisma.propertyApplication.update({
    where: { id: applicationId },
    data: {
      status,
      ...(expiryDate && { expiryDate }),
    },
  });
}

export async function getApplicationsForApplicantQuery(userId: number) {
  return prisma.propertyApplication.findMany({
    where: { userId },
    include: {
      user: true,
      listing: {
        include: {
          property: {
            include: { landlord: true },
          },
        },
      },
    },
  });
}

export async function getApplicationsForLandlordQuery(landlordId: number) {
  return prisma.propertyApplication.findMany({
    where: { listing: { landlordId } },
    include: {
      user: true,
      listing: {
        include: { property: true },
      },
    },
  });
}