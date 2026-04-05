/****************** prisma services for applications **************/
import { prisma } from "@/lib/prisma";
import { APPLICATION_EXPIRY_TIME } from "../const";
  // function to create a new application for a listing:
  export async function submitApplication(
    listingId: number,
    userId: number,
    moveInDate: Date,
    moveOutDate: Date | null
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const now = new Date();
  
      //  Validate dates
      if (moveInDate <= now) {
        return { success: false, error: "Move-in date must be in the future." };
      }
  
      if (moveOutDate && moveOutDate <= moveInDate) {
        return {
          success: false,
          error: "Move-out date must be after move-in date.",
        };
      }
  
      const [listing, existingApplication, occupantRecord] =
        await Promise.all([
          prisma.propertyListing.findUnique({
            where: { id: listingId, isDeleted: false },
          }),
  
          prisma.propertyApplication.findFirst({
            where: {
              listingId,
              userId,
              status: {
                in: ["PENDING", "APPROVED"],// TODO: also include CONFIRMED at some point
              },
            },
          }),
  
          prisma.occupant.findFirst({
            where: {
              listingId,
              userId,
            },
          }),
        ]);
  
      if (!listing) {
        return { success: false, error: "Listing not found." };
      }
  
      //  Already has active application
      if (existingApplication) {// TODO: replace with status check instead of existence
        return {
          success: false,
          error: "You already have an active application for this listing.",
        };
      }
  
      // Occupancy check
      if (occupantRecord) {
        const stillOccupying =
          occupantRecord.moveOut === null ||
          occupantRecord.moveOut > now;
  
        if (stillOccupying) {
          return {
            success: false,
            error: "You are currently occupying this property.",
          };
        }
      }
  
      // Capacity check, check if still full for when they want to move in
      const activeOccupantsAtMoveIn = await prisma.occupant.count({
        where: {
          listingId,
          moveIn: {
            lte: moveInDate,
          },
          OR: [
            { moveOut: null },
            { moveOut: { gt: moveInDate } },
          ],
        },
      });
  
      if (activeOccupantsAtMoveIn >= listing.maxOccupants) {
        return {
          success: false,
          error:
            "This listing will be full at your selected move-in date.",
        };
      }
  
      // Create application
      await prisma.propertyApplication.create({
        data: {
          moveInDate,
          moveOutDate: moveOutDate ?? null,
          status: "PENDING",
          userId,
          listingId,
        },
      });
  
      return { success: true };
    } catch (error) {
      console.error("submitApplication error:", error);
      return { success: false, error: "Something went wrong." };
    }
  }

  // function to get all applications for a given applicant, including listing and property details for each application
  export async function getApplicationsForApplicant(userId: number) {
    const applications = await prisma.propertyApplication.findMany({
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
  
    return applications.map((a) => ({
      id: a.id,
      status: a.status,
      moveInDate: a.moveInDate.toLocaleString(),
      moveOutDate: a.moveOutDate?.toLocaleString(),
      expiryDate: a.expiryDate?.toLocaleString(),
      submittedDate: a.createdAt.toLocaleString(),
      lastUpdatedDate: a.updatedAt.toLocaleString(),
      rent: a.listing.rent,
      listingName: a.listing.property.title,
      listingAddress: `${a.listing.property.streetName}, ${a.listing.property.city}`,
      landlordName: `${a.listing.property.landlord.firstName} ${a.listing.property.landlord.lastName}`,
      applicantName: `${a.user.firstName} ${a.user.lastName}`,
    }));
  }
  
  // function to get all applications for a given landlord, including applicant details and listing/property details for each application
  export async function getApplicationsForLandlord(landlordId: number) {
    const applications = await prisma.propertyApplication.findMany({
      where: { listing: { landlordId } },
      include: {
        user: true,
        listing: {
          include: { property: true },
        },
      },
    });
  
    return applications.map((a) => ({
      id: a.id,
      status: a.status,
      moveInDate: a.moveInDate.toLocaleString(),
      moveOutDate: a.moveOutDate?.toLocaleString(),
      expiryDate: a.expiryDate?.toLocaleString(),
      submittedDate: a.createdAt.toLocaleString(),
      lastUpdatedDate: a.updatedAt.toLocaleString(),
      rent: a.listing.rent,
      listingName: a.listing.property.title,
      listingAddress: `${a.listing.property.streetName}, ${a.listing.property.city}`,
      applicantName: `${a.user.firstName} ${a.user.lastName}`,
    }));
  }
  
  // applicant withdraws their own pending application — soft delete for now
  export async function withdrawApplication(applicationId: number): Promise<boolean> {
    try {
      // TODO: when WITHDRAWN enum is added, replace delete with:
      // await prisma.propertyApplication.update({
      //   where: { id: applicationId },
      //   data: { status: "WITHDRAWN" },
      // });
      await prisma.propertyApplication.delete({ where: { id: applicationId } });
      return true;
    } catch {
      return false;
    }
  }
  
  // landlord makes offer or rejects
  export async function updateApplicationStatus(
    applicationId: number,
    status: "APPROVED" | "REJECTED"
  ): Promise<boolean> {
    try {
      await prisma.propertyApplication.update({
        where: { id: applicationId },
        data: {
          status,
          // set expiry 7 days from now when making an offer
          ...(status === "APPROVED" && {
            expiryDate: new Date(Date.now() + APPLICATION_EXPIRY_TIME),
          }),
        },
      });
      return true;
    } catch {
      return false;
    }
  }
  
  // applicant accepts or declines an offer
  export async function respondToOffer(
    applicationId: number,
    accept: boolean
  ): Promise<boolean> {
    try {
      await prisma.propertyApplication.update({
        where: { id: applicationId },
        data: { status: accept ? "CONFIRMED" : "REJECTED" },
      });
      return true;
    } catch {
      return false;
    }
  }