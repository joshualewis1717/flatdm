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
  isListingOwnedByLandlord,
} from "./rawQueries";
import { mapApplicantApplication, mapLandlordApplication } from "./mappers";
import { runService, withRole } from "@/app/app/clientService/prismaUtils";

// ─── Types ────────────────────────────────────────────────────────────────────

// Derive mapped return types directly from the mappers so they stay in sync
type ApplicantApplication = ReturnType<typeof mapApplicantApplication>;
type LandlordApplication = ReturnType<typeof mapLandlordApplication>;

// Create application

export async function submitApplication(
  listingId: number,
  moveInDate: Date,
  moveOutDate: Date | null
) {
  return runService(async () => {
    const user = await withRole("CONSULTANT");
    const now = new Date();

    if (moveInDate <= now) throw new Error("Move-in must be in the future.");
    if (moveOutDate && moveOutDate <= moveInDate) throw new Error("Move-out must be after move-in.");

    const [listing, existingApp, occupant] = await Promise.all([
      getListingById(listingId),
      getActiveApplication(listingId, user.id),
      getOccupant(listingId, user.id),
    ]);

    if (!listing)     throw new Error("Listing not found.");
    if (existingApp)  throw new Error("Already applied.");

    if (occupant) {
      const stillOccupying = !occupant.moveOut || occupant.moveOut > now;
      if (stillOccupying) throw new Error("Already occupying.");
    }

    const count = await countOccupantsAtDate(listingId, moveInDate);
    if (count >= listing.maxOccupants) throw new Error("Listing full at that time.");

    await createApplicationQuery({ listingId, userId: user.id, moveInDate, moveOutDate });
  });
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
    const expiry =
      status === "APPROVED"
        ? new Date(Date.now() + APPLICATION_EXPIRY_TIME)
        : undefined;
    await updateApplicationStatusAsLandlordQuery(applicationId, user.id, status, expiry);
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