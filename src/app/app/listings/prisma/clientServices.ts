'use server'
import { prisma } from "@/lib/prisma";
import {PropertyListingForm } from "../types";
import { queryPropertiesForLandlord, queryListingById, queryListingsForLandlord, querySoftDeleteListing, queryCreateProperty, queryCreateListing,} from "./rawQueries";
import { mapToExistingProperty, mapToListingDetail, mapToMyPropertyListing } from "./mappers";
import { runService, withRole } from "../../clientService/prismaUtils";

/************ validation **********/

function validateListingInput(data: PropertyListingForm) {
  const {
    buildingName, streetName, city, postcode,
    rooms, bedrooms, bathrooms, area, rent, maxOccupants, minStay,
    availableFrom, amenities = [],
  } = data;

  if (!buildingName && !streetName && !city && !postcode)
    throw new Error("Must provide either a selected property or full address details");

  if ([buildingName, streetName, city, postcode].some((f) => f?.trim() === ""))
    throw new Error("Address fields cannot be empty if creating a new property");

  if ([rooms, bedrooms, bathrooms, area, rent, maxOccupants, minStay].some((n) => n <= 0))
    throw new Error("Rooms, bedrooms, bathrooms, area, rent, max occupants and min stay must be greater than 0");

  if (rooms < bedrooms + bathrooms)
    throw new Error("Total rooms must be at least the sum of bedrooms and bathrooms");

  if (availableFrom < new Date())
    throw new Error("Available from date cannot be in the past");

  if (amenities.some((a) => a.distance !== null && a.distance < 0))
    throw new Error("Amenity distance cannot be negative");
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

/*********** setters/ create ********/

// TODO: delete stale amenities from db when user removes them in the UI
// TODO: pass optional landlordId for update path + ownership check
export async function createListing(data: PropertyListingForm) {
  return runService(async () => {
    validateListingInput(data);
    const user = await withRole("LANDLORD");

    await prisma.$transaction(async (tx) => {// we use transaction to make sure that everything happens in one go e.g.
      // do not want to create a property without a listing and vice versa
      const { selectedPropertyId, buildingName, streetName, city, postcode, amenities = [],
        flatNumber, description, rent, availableFrom, rooms, bedrooms, bathrooms, area, maxOccupants, minStay,
      } = data;

      let propertyId: number;

      if (selectedPropertyId) {
        propertyId = selectedPropertyId;

        for (const amenity of amenities) {
          if (amenity.dbId) {
            await tx.amenity.update({
              where: { id: amenity.dbId },
              data: { name: amenity.name, type: amenity.type, distance: amenity.distance ?? null },
            });
          } else {
            await tx.amenity.create({
              data: { name: amenity.name, type: amenity.type, distance: amenity.distance ?? null, propertyId },
            });
          }
        }
      } else {
        const property = await queryCreateProperty(tx, {
          title: buildingName ?? "",
          streetName: streetName ?? "",
          city: city ?? "",
          postcode: postcode ?? "",
          landlordId: user.id,
          amenities: {
            create: amenities.map(({ name, type, distance }) => ({
              name, type, distance: distance ?? null,
            })),
          },
        });
        propertyId = property.id;
      }

      await queryCreateListing(tx, {
        flatNumber: flatNumber || "WHOLE_PROPERTY", // we give it whole property in DB to enforce uniqueness
        description, rent, availableFrom,
        rooms, bedrooms, bathrooms, area, maxOccupants, minStay,
        propertyId,
        landlordId: user.id,
      });
    });
  });
}

// ******Delete **********

export async function deleteListing(listingId: number) {
  return runService(async () => {
    const user = await withRole("LANDLORD");
    await querySoftDeleteListing(listingId, user.id);
  });
}