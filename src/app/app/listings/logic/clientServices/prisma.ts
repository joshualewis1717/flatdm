'use server'
// a bunch of servar side functions to fetch and manipulate data related to listings and properties, using prisma

// app/actions/createListing.ts
"use server";

import { prisma } from "@/lib/prisma";
import { ExistingProperty, PropertyListingForm } from "../../types";
import { APPLICATION_EXPIRY_TIME } from "../../prismaConst";

type CreateListingInput = PropertyListingForm & {
  landlordId: number;
};

//TODO: to all of the functions add in {result, error} return types.

// two stage process to create a listing (create property first if needed, and then create listing linked to that property)
export async function createListing(data: CreateListingInput): Promise<boolean> {
  return await prisma.$transaction(async (tx) => {// we want it as a transacion, e.g. do not create a property without a listing, or vice versa
    const {
      selectedPropertyId,
      buildingName,
      city,
      streetName,
      postcode,
      flatNumber,
      description,
      rent,
      availableFrom,
      rooms,
      bedrooms,
      bathrooms,
      area,
      maxOccupants,
      minStay,
      amenities = [],
      landlordId,
    } = data;

    let propertyId: number;

    // some basic validation
    if (!buildingName && !streetName && !city && !postcode) {
      throw new Error("Must provide either selectedPropertyId or full address details");
    }

    if (buildingName?.trim() === "" || streetName?.trim() === "" || city?.trim() === "" || postcode?.trim() === "") {
      throw new Error("Address fields cannot be empty if creating a new property");
    }

    if (rooms <= 0 || bedrooms <= 0 || bathrooms <= 0 || area <= 0 || rent <= 0 || maxOccupants <= 0 || minStay <= 0) {
      throw new Error("Rooms, bedrooms, bathrooms, area, rent, max occupants and min stay must be greater than 0");
    }

    if (rooms < (bedrooms + bathrooms)) {
      throw new Error("Total rooms must be greater than or equal to the sum of bedrooms and bathrooms");
    }

    if (availableFrom < new Date()) {
      throw new Error("Available from date cannot be in the past");
    }

    if (amenities.some((a) => a.distance !== null && a.distance < 0)) {
      throw new Error("Amenity distance cannot be negative");
    }

    //  Step 1: Resolve property
    if (selectedPropertyId) {
      propertyId = selectedPropertyId;
    } else {

      const property = await tx.property.create({
        data: {
          title: buildingName ?? "",
          streetName: streetName ?? "",
          city: city ?? "",
          postcode: postcode ?? "",
          landlordId,

          amenities: {
            create: amenities.map((a) => ({
              name: a.name,
              type: a.type,
              distance: a.distance ?? null,
            })),
          },
        },
      });

      propertyId = property.id;
    }

    // Step 2: Create listing
    const listing = await tx.propertyListing.create({
      data: {
        flatNumber: flatNumber || "WHOLE_PROPERTY",
        description,
        rent,
        availableFrom,
        rooms,
        bedrooms,
        bathrooms,
        area,
        maxOccupants,
        minStay,

        propertyId,
        landlordId,
      },
    });
    return listing ? true : false;// just return a boolean to let front end know if it was successful or not
  });
}


// function to get any properties for a landlord (NOT LISTINGS, just the building themselves)
export async function getPropertiesForLandlord(landlordId: number): Promise<ExistingProperty[]> {
    const properties = await prisma.property.findMany({
      where: { landlordId},
      select: {
        id: true,
        title: true,
        streetName: true,
        city: true,
        postcode: true,
        amenities: {
          select: { id: true, name: true, type: true, distance: true },
        },
        listings: { select: { id: true }, take: 1 },
      },
    });
    
    // map our properties to our UI return type
    return properties.map((p) => ({
        id: p.id,
        buildingName: p.title,  
        streetName: p.streetName,
        city: p.city,
        postcode: p.postcode,
        hasExistingListings: p.listings.length > 0,
        amenities: p.amenities.map((a) => ({
          id: a.id,
          name: a.name,
          type: a.type,
          distance: a.distance,
          propertyId: p.id,
        modifiedAt: new Date(), // added this in to remove .ts error, TODO: use a client type wrapper to clean up the types
        })),
      }));
  }


  // function to get all details for a listing by id, including property details + landlord names etc
  export async function getListingById(listingId: string) {

    const listing = await prisma.propertyListing.findUnique({
      where: { id: Number(listingId), isDeleted: false },
      include: {
        images: true, // include images
        property: {
          include: {
            amenities: true,
            landlord: {
              select: { username: true },
            },
          },
        },
      },
    });
  
    if (!listing) return null;
  
    // split thumbnail + images
    const thumbnail = listing.images.find((img) => img.isThumbnail);
    const images = listing.images
      .filter((img) => !img.isThumbnail)
      .map((img) => img.url);
  
    return {
      // listing-level
      flatNumber: listing.flatNumber ?? null,
      description: listing.description,
      rent: listing.rent,
      area: listing.area,
      totalRooms: listing.rooms,
      availableFrom: listing.availableFrom,
      lastUpdated: listing.updatedAt,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      maxOccupants: listing.maxOccupants,
      minStay: listing.minStay,
  
      thumbnail: thumbnail?.url ?? null, // split thumbnail from images
      images, //  non-thumbnail images
  
      // property-level
      buildingName: listing.property.title,
      streetName: listing.property.streetName,
      city: listing.property.city,
      postcode: listing.property.postcode,
      landlordName: listing.property.landlord.username,
      amenities: listing.property.amenities,
    };
  }

  // smaller function to get listings for a landlord with very basic info
  export async function getListingsForLandlord(landlordId: number) {
    const listings = await prisma.propertyListing.findMany({
      where: { landlordId, isDeleted: false },
      include: {
        images: true,
        property: true,
        occupants: true,
      },
    });
  
    return listings;
  }
  
  // function to delete a specific listing by id, soft delete only.
  export async function deleteListing(listingId: number): Promise<boolean> {
    try {
      await prisma.propertyListing.update({ where: { id: listingId }, data: { isDeleted: true } });
      return true;
    } catch {
      return false;
    }
  }


/****************** prisma services for applications **************/
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