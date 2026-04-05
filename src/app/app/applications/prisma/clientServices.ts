'use server'
import { APPLICATION_EXPIRY_TIME } from "../const";
import {
  getListingById,
  getActiveApplication,
  getOccupant,
  countOccupantsAtDate,
  createApplicationQuery,
  deleteApplicationQuery,
  updateApplicationStatusQuery,
  getApplicationsForApplicantQuery,
  getApplicationsForLandlordQuery,
} from "./rawQueries";

import {mapApplicantApplication,mapLandlordApplication,} from "./mappers";

// CREATE APPLICATION
export async function submitApplication(
  listingId: number,
  userId: number,
  moveInDate: Date,
  moveOutDate: Date | null
) {
  try {
    const now = new Date();

    if (moveInDate <= now) {
      return { success: false, error: "Move-in must be in the future." };
    }

    if (moveOutDate && moveOutDate <= moveInDate) {
      return { success: false, error: "Move-out must be after move-in." };
    }

    const [listing, existingApp, occupant] = await Promise.all([
      getListingById(listingId),
      getActiveApplication(listingId, userId),
      getOccupant(listingId, userId),
    ]);

    if (!listing) {
      return { success: false, error: "Listing not found." };
    }

    if (existingApp) {
      return { success: false, error: "Already applied." };
    }

    if (occupant) {
      const stillOccupying =
        !occupant.moveOut || occupant.moveOut > now;

      if (stillOccupying) {
        return { success: false, error: "Already occupying." };
      }
    }

    const count = await countOccupantsAtDate(listingId, moveInDate);

    if (count >= listing.maxOccupants) {
      return { success: false, error: "Listing full at that time." };
    }

    await createApplicationQuery({
      listingId,
      userId,
      moveInDate,
      moveOutDate,
    });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Something went wrong." };
  }
}

// GET (APPLICANT)
export async function getApplicationsForApplicant(userId: number) {
  const data = await getApplicationsForApplicantQuery(userId);
  return data.map(mapApplicantApplication);
}

// GET (LANDLORD)
export async function getApplicationsForLandlord(landlordId: number) {
  const data = await getApplicationsForLandlordQuery(landlordId);
  return data.map(mapLandlordApplication);
}

// WITHDRAW
export async function withdrawApplication(applicationId: number) {
  try {
    await deleteApplicationQuery(applicationId);
    return true;
  } catch {
    return false;
  }
}

// STATUS UPDATE
export async function updateApplicationStatus(
  applicationId: number,
  status: "APPROVED" | "REJECTED"
) {
  try {
    const expiry =
      status === "APPROVED"
        ? new Date(Date.now() + APPLICATION_EXPIRY_TIME)
        : undefined;

    await updateApplicationStatusQuery(applicationId, status, expiry);
    return true;
  } catch {
    return false;
  }
}

// RESPONSE
export async function respondToOffer(
  applicationId: number,
  accept: boolean
) {
  try {
    await updateApplicationStatusQuery(
      applicationId,
      accept ? "CONFIRMED" : "REJECTED"
    );
    return true;
  } catch {
    return false;
  }
}