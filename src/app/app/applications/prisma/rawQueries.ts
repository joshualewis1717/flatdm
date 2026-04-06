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
      OR: [// expired dates do not count as active even if their status is pending or approved.
        { expiryDate: null },
        { expiryDate: { gte: new Date() } },
      ],
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
      expiryDate: data.moveInDate,// set expiry date to be move in date for when a new application is created
    },
  });
}

export async function deleteApplicationQuery(applicationId: number, userId: number) {
  return prisma.propertyApplication.delete({
    where: { id: applicationId, userId: userId },
  });
}


export async function updateApplicationStatusAsLandlordQuery(applicationId: number, landlordId: number,  status: "APPROVED" | "REJECTED") {
   // check if application exists
  const application = await prisma.propertyApplication.findUnique({
    where: { id: applicationId },
    select: {
      expiryDate: true,
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

  const newExpiryTime = new Date(Date.now() + APPLICATION_EXPIRY_TIME);


  const expiryDate =
    status === "APPROVED"? application.expiryDate// if status is approved lower expiry date to our constant if current expiry
    // date is greater than it (always take minimum of expiry date, we do not want to extend expiry date)
        ? new Date( Math.min( application.expiryDate.getTime(), newExpiryTime.getTime())) : newExpiryTime
      : null;

  return prisma.propertyApplication.update({
    where: { id: applicationId },
    data: {
      status,
      expiryDate,
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
    where: {// do not return any expired applications
      userId,
      listing: {isDeleted: false},// don't return applications where listing is deleted
      OR: [
        { expiryDate: null },
        { expiryDate: { gte: new Date() } },
      ],
    },
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
    where: { listing: { landlordId, isDeleted: false },// do not return any expired applications or applications belonging to deleted listings
    OR: [
      { expiryDate: null },
      { expiryDate: { gte: new Date() } },
    ],
    },
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