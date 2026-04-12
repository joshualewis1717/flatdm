import { prisma } from "@/lib/prisma";
import { APPLICATION_EXPIRY_TIME } from "../const";
import { Occupant, Prisma, User } from "@prisma/client";
import 'server-only'
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

// what we return when an application has been updated
type UpdatedApplication = Prisma.PropertyApplicationGetPayload<{
  include: {
    user: true;
    listing: {
      include: {
        property: {
          include: {
            landlord: true; 
          };
        };
      };
    };
  };
}>;


// we need to return a bit more info to send emails depending on conultant actions
type ConsultantUpdateResult = {
  updatedApplication: UpdatedApplication;

  autoRejectedApplications: Array<{
    user: User;
  }>;
};

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
    where: { listingId, userId,
        // Only return if still active
        OR: [
          { moveOut: null },
          { moveOut: { gt:  new Date()} },
        ],
     },
  });
}

  // get occupant via id:
  export async function getOccupantByOccupantId(occupantId: number){
    return prisma.occupant.findUnique({
      where: { id: occupantId },
      include: {
        listing: {
          select: { landlordId: true },
        },
      },
    });
  }
// function to count all occupants that would be active in a specific date
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

// function to count all currently active occupantss
export async function countCurrentOccupants(listingId: number) {
  const now = new Date();

  return prisma.occupant.count({
    where: {
      listingId,
      moveIn: { lte: now },
      OR: [
        { moveOut: null },
        { moveOut: { gt: now } },
      ],
    },
  });
}



// function to count overlapping occupants within a specific time range
export async function countOverlappingOccupantsQuery(listingId: number,moveInDate: Date,moveOutDate: Date | null) {
  return prisma.occupant.count({
    where: {
      listingId,
      AND: [
        { moveIn: { lt: moveOutDate ?? new Date("9999-12-31") } },// if  move out is null, treat it like it will
        // go on forever (e.g. infinitly)
        {
          OR: [
            { moveOut: null },
            { moveOut: { gt: moveInDate } },
          ],
        },
      ],
    },
  });
}

// function to grab all occupants of a specific listing
export async function getOccupantWithListingQuery(occupantId: number) {
  return prisma.occupant.findUnique({
    where: { id: occupantId },
    include: {
      listing: {
        select: { landlordId: true },
      },
    },
  });
}

// function to remove an occupant
  //  to remove occuapnt, we set move out to be current date, since all our logic counts active occupants as move out > current
    // (hence if move out < current, we treat it as soft deletion)
export async function removeOccupantQuery(occupantId: number) {
  return prisma.occupant.update({
    where: { id: occupantId },
    data: { moveOut: new Date() },
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
    include: {
      user: true,
      listing: {
        include: {
          property: {
            include: { landlord: true }
          }
        }
      }
    }
  });
}

export async function updateApplicationStatusAsConsultantQuery(applicationId: number,userId: number,status: "CONFIRMED" | "REJECTED" | "WITHDRAWN"): Promise<ConsultantUpdateResult> {
  return prisma.$transaction(async (tx) => {
     // 1. Get application
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
     // 2. Auth check
    if (application.userId !== userId) throw new Error("Forbidden");

     // 3. Update current application
    const updatedApplication = await tx.propertyApplication.update({
      where: { id: applicationId },
      data: { status },
      include: {
        user: true,
        listing: {
          include: {
            property: {
              include: {
                landlord: true,
              },
            },
          },
        },
      },
    });

    // initialise our array of people who might get auto rejected
    const autoRejectedApplications: Array<{ user: User }> = [];

     // 4. Only proceed if confirmed
    if (status === "CONFIRMED") {
      const listingId = application.listingId;
      
      const moveIn = application.moveInDate;
      const moveOut = application.moveOutDate ?? new Date("9999-12-31");

         // 5. Get listing capacity
      const listing = await tx.propertyListing.findUnique({
        where: { id: listingId },
        select: { maxOccupants: true },
      });

      if (!listing) throw new Error("Listing not found");

      
      // 6. Check overlapping occupants.
      const overlappingOccupants = await tx.occupant.count({
        where: {
          listingId,
          AND: [
            { moveIn: { lt: moveOut } },
            {
              OR: [{ moveOut: null }, { moveOut: { gt: moveIn } }],
            },
          ],
        },
      });

       // 7. Prevent overbooking
      if (overlappingOccupants >= listing.maxOccupants) {
        throw new Error("Listing became full. Cannot confirm.");
      }

      // 8. Create occupant
      await createOccupantTx(tx, {
        userId,
        listingId,
        moveIn,
        moveOut: application.moveOutDate,
      });

      // 9. Withdraw other applications by same user
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


       // 10. find users who will be auto rejected
      const toReject = await tx.propertyApplication.findMany({
        where: {
          listingId,
          id: { not: applicationId },
          status: { in: ["PENDING", "APPROVED"] },
          AND: [
            { moveInDate: { lt: moveOut } },
            {
              OR: [
                { moveOutDate: null },
                { moveOutDate: { gt: moveIn } },
              ],
            },
          ],
        },
        include: {
          user: true,
        },
      });

      // 11. set their status to be rejected
      if (toReject.length > 0) {
        await tx.propertyApplication.updateMany({
          where: {
            id: { in: toReject.map((a) => a.id) },
          },
          data: { status: "REJECTED" },
        });

        autoRejectedApplications.push(
          ...toReject.map((a) => ({
            user: a.user,
          }))
        );
      }
    }

    return {updatedApplication, autoRejectedApplications,};
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


// function to retrieve profile of passed in user id
export async function getUserProfileByUserId(userId: number) {
  return prisma.profile.findUnique({
    where: { userId },
    include: {
      user: true,
    },
  });
}