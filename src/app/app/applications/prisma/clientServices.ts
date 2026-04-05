'use server'
import { APPLICATION_EXPIRY_TIME } from "../const";
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
} from "./rawQueries";

import {mapApplicantApplication,mapLandlordApplication,} from "./mappers";
import { requireRole } from "@/userAuth";
// CREATE APPLICATION
export async function submitApplication(listingId: number,moveInDate: Date,moveOutDate: Date | null) {
  try {
    const user = await requireRole("CONSULTANT")
    if (!user)  throw new Error("timed out session")
    const now = new Date();

    if (moveInDate <= now) {
      return { success: false, error: "Move-in must be in the future." };
    }

    if (moveOutDate && moveOutDate <= moveInDate) {
      return { success: false, error: "Move-out must be after move-in." };
    }

    const [listing, existingApp, occupant] = await Promise.all([
      getListingById(listingId),
      getActiveApplication(listingId, user.id),
      getOccupant(listingId, user.id),
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
      userId: user.id,
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
export async function getApplicationsForApplicant() {
  const user = await requireRole("CONSULTANT")
  if (!user)  throw new Error("timed out session")
  const data = await getApplicationsForApplicantQuery(user.id);
  return data.map(mapApplicantApplication);
}

// GET (LANDLORD)
export async function getApplicationsForLandlord() {
  const user = await requireRole("LANDLORD")
  if (!user)  throw new Error("timed out session")
  const data = await getApplicationsForLandlordQuery(user.id);
  return data.map(mapLandlordApplication);
}

// WITHDRAW: TODO: remove delete application query and use the update application status as consultant instead
export async function withdrawApplication(applicationId: number) {
  try {
    const user = await requireRole("CONSULTANT")
    if (!user)  throw new Error("timed out session")
    await deleteApplicationQuery(applicationId, user.id);
    return true;
  } catch {
    return false;
  }
}

// STATUS UPDATE (for landlord to handle)
export async function updateApplicationStatus(applicationId: number, status: "APPROVED" | "REJECTED") {
  try {
    const user = await requireRole("LANDLORD")
    if (!user)  throw new Error("timed out session")
    const expiry =
      status === "APPROVED"
        ? new Date(Date.now() + APPLICATION_EXPIRY_TIME)
        : undefined;

    await updateApplicationStatusAsLandlordQuery(applicationId, user.id, status, expiry);
    return true;
  } catch {
    return false;
  }
}

// RESPONSE (for consultants)
export async function respondToOffer( applicationId: number, accept: boolean) {// TODO extend this with a status prop for when users want to withdraw
  try {
    const user = await requireRole("CONSULTANT")
    if (!user)  throw new Error("timed out session")
    await updateApplicationStatusAsConsultantQuery(
      applicationId,
      user.id,
      accept ? "CONFIRMED" : "REJECTED"
    );
    return true;
  } catch {
    return false;
  }
}