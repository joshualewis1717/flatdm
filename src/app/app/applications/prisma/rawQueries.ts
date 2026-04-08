import { prisma } from "@/lib/prisma";
import { APPLICATION_EXPIRY_TIME } from "../const";
import { Occupant, Prisma } from "@prisma/client";
// raw prisma queries for applications

// args needed to submit an application
type SubmitApplication = {
  listingId: number
  userId: number;
  moveInDate: Date,
  moveOutDate: Date | null,
  email?: string,
  message?: string,
  phone?: string;
}

// type/ args needed when trying to create an occupant
type CreateOccupant={
  userId: number,
  listingId: number,
  moveIn: Date,
  moveOut: Date | null,
}
export async function getListingById(listingId: number) {
  return prisma.propertyListing.findUnique({
    where: { id: listingId, isDeleted: false },
  });
}

// function to only show application if the owner/ listing owner of the application is trying to access it
export async function getApplicationIfAuthorised(applicationId: number, userId: number) {
  return prisma.propertyApplication.findFirst({
    where: {
      id: applicationId,
      OR: [
        { userId }, // applicant
        { listing: { landlordId: userId } }, // landlord
      ],
    },
    include: {
      listing: true, // include landlord relation if needed
      user: true,// also include user details
    },
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


export async function createApplicationQuery(data: SubmitApplication) {
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


// function to create an occupancy:

async function createOccupantTx(tx: Prisma.TransactionClient,data: CreateOccupant) {
  return tx.occupant.create({
    data: {
      userId: data.userId,
      listingId: data.listingId,
      moveIn: data.moveIn,
      moveOut: data.moveOut ?? null,
      createdAt: new Date(),
      modifiedAt: new Date(),
    },
  })
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
    //  Get application
    const application = await tx.propertyApplication.findUnique({
      where: { id: applicationId },
      select: {
        userId: true,
        listingId: true,
        moveInDate: true,
        moveOutDate: true,
      },
    });

    if (!application) throw new Error("Application not found");

    //  Auth check
    if (application.userId !== userId) {
      throw new Error("Forbidden");
    }

    //  Update current application
    const updated = await tx.propertyApplication.update({
      where: { id: applicationId },
      data: { status },
    });

    // If user clicked confirmed, all other applications are withdrawn
    if (status === "CONFIRMED") {
      
      await createOccupantTx(tx, {
        userId: application.userId,
        listingId: application.listingId,
        moveIn: application.moveInDate,
        moveOut: application.moveOutDate,
      });

      //  Withdraw other applications that user has
      await tx.propertyApplication.updateMany({
        where: {
          userId,
          id: { not: applicationId },
          status: {
            in: ["PENDING", "APPROVED"],
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

// function to get the listing Id from application id
export async function getListingIdFromApplicationQuery(applicationId: number) {
  return prisma.propertyApplication.findUnique({
    where: { id: applicationId },
    select: {
      listingId: true,
    },
  });
}