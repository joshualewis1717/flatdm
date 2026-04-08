'use server'
import {
  getListingById,
  getActiveApplication,
  getOccupant,
  countOccupantsAtDate,
  createApplicationQuery,
  deleteApplicationQuery,
  getApplicationsForApplicantQuery,
  getApplicationsForLandlordQuery,
  updateApplicationStatusAsLandlordQuery,
  updateApplicationStatusAsConsultantQuery,
  isListingOwnedByLandlord,
  getListingIdFromApplicationQuery,
  getApplicationIfAuthorised,
} from "./rawQueries";
import { mapApplicantApplication, mapLandlordApplication } from "./mappers";
import { runService, withRole } from "@/app/app/clientService/prisma/prismaUtils";
import { MINIMUM_APPLICATION_WINDOW } from "./const";
import { startOfDay } from "date-fns";
import { isValidPhoneNumber } from 'libphonenumber-js';
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

// Derive mapped return types directly from the mappers so they stay in sync
type ApplicantApplication = ReturnType<typeof mapApplicantApplication>;
type LandlordApplication = ReturnType<typeof mapLandlordApplication>;

// Create application
export async function submitApplication(
  listingId: number,
  moveInDate: Date,
  moveOutDate: Date | null,
  phoneNumber: string,
  email: string,
  message: string = ''
) {
  return runService(async () => {
    const user = await withRole("CONSULTANT");
    const now = new Date();

    const moveIn = new Date(moveInDate);

    const difference =
      (startOfDay(moveIn).getTime() - startOfDay(now).getTime()) /
      (24 * 60 * 60 * 1000);

    if (!moveInDate || !email || !phoneNumber) {
      throw new Error("One or more of the required fields are empty");
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      throw new Error("invalid phone number format");
    }

    if (difference < MINIMUM_APPLICATION_WINDOW) {
      throw new Error(
        `Move-in must be at least ${MINIMUM_APPLICATION_WINDOW} days from today.`
      );
    }

    if (
      moveOutDate &&
      startOfDay(moveOutDate).getTime() <= startOfDay(moveInDate).getTime()
    ) {
      throw new Error("Move-out must be after move-in.");
    }

    const [listing, existingApp, existingOccupant] = await Promise.all([
      getListingById(listingId),
      getActiveApplication(listingId, user.id),
      getOccupant(listingId, user.id),
    ]);

    if (!listing) throw new Error("Listing not found.");
    if (existingApp) throw new Error("Already applied.");

    // stop user from applying to when listing is full at their intended move in time.
    const overlappingOccupants = await prisma.occupant.count({
      where: {
        listingId,
    
        AND: [
          {
            moveIn: {
              lt: moveOutDate ?? new Date("9999-12-31"),// if move out date is null, assume they will stay
              // there for an infinite amount of time for this check
            },
          },
          {
            OR: [
              { moveOut: null },
              { moveOut: { gt: moveInDate } },
            ],
          },
        ],
      },
    });
    
    if (overlappingOccupants >= listing.maxOccupants) {
      throw new Error("Listing is full for the selected date range.");
    }

    // Prevent user from applying to current listing if they are an occupant of that specific listing
    // and their move in time is < than their move out time
    if (existingOccupant) {
      const existingMoveOut = existingOccupant.moveOut;

      const overlaps =
        existingMoveOut === null || // still living there
        moveInDate <= existingMoveOut; // overlap

      if (overlaps) {
        throw new Error(
          "You are already an occupant for this listing during that time."
        );
      }
    }

    await createApplicationQuery({
      listingId,
      userId: user.id,
      moveInDate,
      moveOutDate,
      email: email.trim(),
      phone: phoneNumber.trim(),
      message: message?.trim(),
    });
  });
}

export async function getExistingApplication(applicationId: number){
  return runService(async ()=>{
    const session = await auth();
    if (!session) throw new Error('session expired')
    const userId = session.user.id
  if (!userId) throw new Error("could not find user")
  const application = getApplicationIfAuthorised(applicationId, Number(userId))
  if (!application) throw new Error("could not fetch application details or unauthorised access")
  return application
  })
}


// get applications for a specific applicant

export async function getApplicationsForApplicant() {
  return runService(async () => {
    const user = await withRole("CONSULTANT");
    const data = await getApplicationsForApplicantQuery(user.id);
    return data.map(mapApplicantApplication);
  });
}

export async function getApplicationsForLandlord() {
  return runService(async () => {
    const user = await withRole("LANDLORD");
    const data = await getApplicationsForLandlordQuery(user.id);
    return data.map(mapLandlordApplication);
  });
}

// Withdraw

// TODO: swap deleteApplicationQuery for updateApplicationStatusAsConsultantQuery
export async function withdrawApplication(applicationId: number) {
  return runService(async () => {
    const user = await withRole("CONSULTANT");
    await deleteApplicationQuery(applicationId, user.id);
  });
}

// Landlord status update

export async function updateApplicationStatus(
  applicationId: number,
  status: "APPROVED" | "REJECTED"
) {
  return runService(async () => {
    const user = await withRole("LANDLORD");
    await updateApplicationStatusAsLandlordQuery(applicationId, user.id, status);
  });
}

// Consultant response

// TODO: extend with a WITHDRAWN status option
export async function respondToOffer(applicationId: number, status: 'CONFIRMED' | 'REJECTED' | 'WITHDRAWN') {
  return runService(async () => {
    const user = await withRole("CONSULTANT");
    await updateApplicationStatusAsConsultantQuery(
      applicationId,
      user.id,
      status
    );
  });
}


export async function landlordOwnsListing(listingId: number) {
  return runService(async () => {
    const user = await withRole("LANDLORD");

    return await isListingOwnedByLandlord(listingId, user.id);
  });
}

export async function getListingIdFromApplication(applicationId: number) {
  return runService(async () => {
    const listing = await getListingIdFromApplicationQuery(applicationId);

    if (!listing) {
      throw new Error("Listing is not found");
    }

    return listing.listingId;
  });
}