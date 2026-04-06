import { prisma } from "@/lib/prisma";
import { APPLICATION_EXPIRY_TIME } from "../const";
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

export async function deleteApplicationQuery(applicationId: number, userId: number) {
  return prisma.propertyApplication.delete({
    where: { id: applicationId, userId: userId },
  });
}


export async function updateApplicationStatusAsLandlordQuery(
  applicationId: number,
  landlordId: number,
  status: "APPROVED" | "REJECTED"
) {
  // check if application exists
  const application = await prisma.propertyApplication.findUnique({
    where: { id: applicationId },
    select: {
      listing: {
        select: {
          property: {
            select: {
              landlordId: true,
            },
          },
        },
      },
    },
  });

  if (!application) throw new Error("Application not found");

  // check ownership
  if (application.listing.property.landlordId !== landlordId) {
    throw new Error("Forbidden");
  }

  const expiryDate =
    status === "APPROVED"
      ? new Date(Date.now() + APPLICATION_EXPIRY_TIME)
      : null;

  return prisma.propertyApplication.update({
    where: { id: applicationId },
    data: {
      status,
      expiryDate, // will be null if rejected
    },
  });
}

export async function updateApplicationStatusAsConsultantQuery(applicationId: number,userId: number,status: "CONFIRMED" | "REJECTED" | "WITHDRAWN"
) {
  return prisma.$transaction(async (tx) => {
    // 1. Get application
    const application = await tx.propertyApplication.findUnique({
      where: { id: applicationId },
      select: {
        userId: true,
      },
    });

    if (!application) throw new Error("Application not found");

    // 2. Auth check
    if (application.userId !== userId) {
      throw new Error("Forbidden");
    }

    // 3. Update current application
    const updated = await tx.propertyApplication.update({
      where: { id: applicationId },
      data: { status },
    });

    // 4. If user clicked confirmed, all other applications are withdrawn
    if (status === "CONFIRMED") {
      await tx.propertyApplication.updateMany({
        where: {
          userId,
          id: { not: applicationId },
          status: {
            in: ["PENDING", "APPROVED"], // only active ones
          },
        },
        data: {
          status: "WITHDRAWN",
        },
      });
    }

    return updated;
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


// function to check if ladlord owns a listing or not
export async function isListingOwnedByLandlord(  listingId: number,userId: number) {
  const listing = await prisma.propertyListing.findFirst({
    where: {
      id: listingId,
      landlordId: userId,
      isDeleted: false,
    },
    select: { id: true },
  });

  return !!listing; // boolean
}