'use server'
import { prisma } from "@/lib/prisma";
import { PropertyListingForm } from "../types";
import {queryPropertiesForLandlord, queryListingById, queryListingsForLandlord,querySoftDeleteListing,queryCreateListing,} from "./rawQueries";
import {mapToExistingProperty,mapToListingDetail,mapToMyPropertyListing,} from "./mappers";
import { runService, withRole } from "../../clientService/prisma/prismaUtils";
import { landlordOwnsListing } from "../../applications/prisma/clientServices";

/************ validation **********/

function validateListingInput(data: PropertyListingForm) {
  const {
    buildingName, streetName, city, postcode,
    rooms, bedrooms, bathrooms, area, rent, maxOccupants, minStay,
    amenities = [],
  } = data;

  if (!buildingName && !streetName && !city && !postcode)
    throw new Error("Must provide either a selected property or full address details");

  if ([buildingName, streetName, city, postcode].some((f) => f?.trim() === ""))
    throw new Error("Address fields cannot be empty if creating a new property");

  if ([rooms, bedrooms, bathrooms, area, rent, maxOccupants, minStay].some((n) => n <= 0))
    throw new Error("Rooms, bedrooms, bathrooms, area, rent, max occupants and min stay must be greater than 0");

  if (rooms < bedrooms + bathrooms)
    throw new Error("Total rooms must be at least the sum of bedrooms and bathrooms");

  if (amenities.some((a) => a.distance !== null && a.distance < 0))
    throw new Error("Amenity distance cannot be negative");
}

/**
 * Whole-property / flat conflict check.
 *
 * Rules:
 *  - A listing with no flatNumber means it covers the WHOLE property.
 *  - If the incoming listing is whole-property, block if ANY non-deleted listing already
 *    exists for that propertyId (whether flat or whole).
 *  - If the incoming listing is a specific flat, block if a non-deleted WHOLE-property
 *    listing already exists for that propertyId.
 *
 * Pass `excludeListingId` when editing so we don't conflict against ourselves (when editing the current listing)
 */
async function assertNoListingConflict( propertyId: number, flatNumber: string | undefined | null,excludeListingId?: number,) {
  const isWholeProperty = !flatNumber || flatNumber.trim() === "";

  const existingListings = await prisma.propertyListing.findMany({
    where: {
      propertyId,
      isDeleted: false,
      ...(excludeListingId ? { id: { not: excludeListingId } } : {}),
    },
    select: { id: true, flatNumber: true },
  });

  if (isWholeProperty && existingListings.length > 0) {
    throw new Error(
      "A listing already exists for this property. Delete it before creating a whole-property listing.",
    );
  }

  const wholePropertyExists = existingListings.some(
    (listing) => !listing.flatNumber || listing.flatNumber === "WHOLE_PROPERTY",
  );

  if (!isWholeProperty && wholePropertyExists) {
    throw new Error(
      "A whole-property listing already exists for this building. Delete it before adding a flat listing.",
    );
  }
}

/************** getters */

export async function getPropertiesForLandlord() {
  return runService(async () => {
    const user = await withRole("LANDLORD");
    const properties = await queryPropertiesForLandlord(user.id);
    return properties.map(mapToExistingProperty);
  });
}

export async function getListingById(listingId: string) {
  return runService(async () => {
    const listing = await queryListingById(Number(listingId));
    if (!listing) throw new Error("Listing not found.");
    return mapToListingDetail(listing);
  });
}

export async function getListingsForLandlord() {
  return runService(async () => {
    const user = await withRole("LANDLORD");
    const listings = await queryListingsForLandlord(user.id);
    return listings.map(mapToMyPropertyListing);
  });
}

/************ shared helper: resolve property + sync amenities ************/

type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Given the form data and the current landlord id, returns the propertyId to
 * attach the listing to. Either:
 *  - Uses `selectedPropertyId` directly (landlord picked an existing property), or
 *  - Upserts a Property row by (streetName, city, postcode, landlordId) so that
 *    correcting a typo reuses the existing row rather than creating a duplicate.
 *
 * Also syncs amenities onto that property inside the same transaction.
 */
async function resolvePropertyId(
  tx: PrismaTx,
  data: PropertyListingForm,
  landlordId: number,
): Promise<number> {
  const {
    selectedPropertyId, buildingName, streetName, city, postcode, amenities = [],
  } = data;

  if (selectedPropertyId) {
    // Landlord explicitly chose an existing property, sync amenities only
    for (const amenity of amenities) {
      if (amenity.dbId) {
        await tx.amenity.update({
          where: { id: amenity.dbId },
          data: { name: amenity.name, type: amenity.type, distance: amenity.distance ?? null },
        });
      } else {
        await tx.amenity.create({
          data: {
            name: amenity.name, type: amenity.type,
            distance: amenity.distance ?? null,
            propertyId: selectedPropertyId,
          },
        });
      }
    }
    return selectedPropertyId;
  }

  // No property selected, upsert by address so a typo-correction doesn't
  // create a duplicate property row.
  const property = await tx.property.upsert({
    where: {
      streetName_city_postcode_landlordId: {
        streetName: streetName ?? "",
        city: city ?? "",
        postcode: postcode ?? "",
        landlordId,
      },
    },
    update: {
      // Update the title in case they corrected the building name
      title: buildingName ?? "",
    },
    create: {
      title: buildingName ?? "",
      streetName: streetName ?? "",
      city: city ?? "",
      postcode: postcode ?? "",
      landlordId,
      lat: 1.2, // TODO: derive from geocoding later
      lng: 1.2,
      amenities: {
        create: amenities.map(({ name, type, distance }) => ({
          name, type, distance: distance ?? null,
        })),
      },
    },
  });

  // If property already existed, sync amenities onto it
  if (property) {
    for (const amenity of amenities) {
      if (amenity.dbId) {
        await tx.amenity.update({
          where: { id: amenity.dbId },
          data: { name: amenity.name, type: amenity.type, distance: amenity.distance ?? null },
        });
      } else {
        await tx.amenity.create({
          data: {
            name: amenity.name, type: amenity.type,
            distance: amenity.distance ?? null,
            propertyId: property.id,
          },
        });
      }
    }
  }

  return property.id;
}

/*********** create ********/

export async function createListing(data: PropertyListingForm) {
  return runService(async () => {
    validateListingInput(data);
    const user = await withRole("LANDLORD");

    await prisma.$transaction(async (tx) => {
      const { flatNumber, description, rent, rooms, bedrooms, bathrooms, area, maxOccupants, minStay } = data;

      const propertyId = await resolvePropertyId(tx, data, user.id);

      await assertNoListingConflict(propertyId, flatNumber);

      await queryCreateListing(tx, {
        flatNumber: flatNumber?.trim() || "WHOLE_PROPERTY",
        description, rent,
        availableFrom: new Date(), // TODO: remove availableFrom from DB later
        rooms, bedrooms, bathrooms, area, maxOccupants, minStay,
        propertyId,
        landlordId: user.id,
      });
    });
  });
}

/*********** update ********/

export async function updateListing(listingId: number, data: PropertyListingForm) {
  return runService(async () => {
    validateListingInput(data);
    const user = await withRole("LANDLORD");

    // Ownership check
    const existing = await landlordOwnsListing(listingId)
    if (!existing) throw new Error("Listing not found, or you do not own this listing");

    await prisma.$transaction(async (tx) => {
      const { flatNumber, description, rent, rooms, bedrooms, bathrooms, area, maxOccupants, minStay } = data;

      // Resolve the (possibly new/swapped) property, same logic as create
      const propertyId = await resolvePropertyId(tx, data, user.id);

      // Conflict check against the resolved property (exclude self)
      await assertNoListingConflict(propertyId, flatNumber, listingId);

      await tx.propertyListing.update({
        where: { id: listingId },
        data: {
          flatNumber: flatNumber?.trim() || "WHOLE_PROPERTY",
          description, rent,
          rooms, bedrooms, bathrooms, area, maxOccupants, minStay,
          propertyId, // swap the property if it changed
        },
      });
    });
  });
}

/********* delete *********/

export async function deleteListing(listingId: number) {
  return runService(async () => {
    const user = await withRole("LANDLORD");
    await querySoftDeleteListing(listingId, user.id);
  });
}