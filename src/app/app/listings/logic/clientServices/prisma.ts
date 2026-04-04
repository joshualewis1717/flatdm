'use server'
// a bunch of servar side functions to fetch and manipulate data related to listings and properties, using prisma

// app/actions/createListing.ts
"use server";

import { prisma } from "@/lib/prisma";
import { PropertyListingForm } from "../../types";

type CreateListingInput = PropertyListingForm & {
  landlordId: number;
};


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
      maxOccupants,
      minStay,
      amenities = [],
      landlordId,
    } = data;

    let propertyId: number;
    if (!buildingName && !streetName && !city && !postcode) {
      throw new Error("Must provide either selectedPropertyId or full address details");
    }

    if (rooms <= 0 || bedrooms <= 0 || bathrooms <= 0 || rent <= 0 || maxOccupants <= 0 || minStay <= 0) {
      throw new Error("Rooms, bedrooms, bathrooms, rent, max occupants and min stay must be greater than 0");
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

    const testLandlordId = 3; // hard code a number for now for testing (use an id from actual table)
    //  Step 1: Resolve property
    if (selectedPropertyId) {
      propertyId = selectedPropertyId;
    } else {

      const property = await tx.property.create({
        data: {
          title: buildingName,
          address: streetName ?? "",
          city: city ?? "",
          postcode: postcode ?? "",
          landlordId: testLandlordId,

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
        bedrooms,
        bathrooms,
        maxOccupants,
        minStay,

        propertyId,
        landlordId: testLandlordId,
      },
    });
    return listing ? true : false;
  });
}