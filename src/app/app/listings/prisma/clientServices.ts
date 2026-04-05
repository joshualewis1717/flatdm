'use server'
import { prisma } from "@/lib/prisma";
import {ExistingProperty, MyPropertyListingData, PropertyListingForm } from "../types";
import { queryPropertiesForLandlord, queryListingById, queryListingsForLandlord, querySoftDeleteListing,} from "./rawQueries";
import { mapToExistingProperty, mapToListingDetail, mapToMyPropertyListing } from "./mappers";
import { requireRole } from "@/userAuth";

type CreateListingInput = PropertyListingForm & { landlordId: number };
// validation for listing input

function validateListingInput(data: CreateListingInput) {
  const { buildingName, streetName, city, postcode, rooms, bedrooms, bathrooms, area, rent, maxOccupants, minStay, availableFrom, amenities = [] } = data;

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



export async function getPropertiesForLandlord(): Promise<ExistingProperty[]> {
  const user = await requireRole('LANDLORD');
  if (!user) throw new Error("user timed out")
  const properties = await queryPropertiesForLandlord(user.id);
  return properties.map(mapToExistingProperty);
}

export async function getListingById(listingId: string) {
  const listing = await queryListingById(Number(listingId));
  if (!listing) return null;
  return mapToListingDetail(listing);
}

export async function getListingsForLandlord(): Promise<MyPropertyListingData[]> {
    const user = await requireRole('LANDLORD');
    if (!user) throw new Error("user timed out")
    const listings = await queryListingsForLandlord(user.id);
    return listings.map(mapToMyPropertyListing);
}


//TO DO: delete an amenity from db if user deletes amenity though UI of existing property
//TO DO: also pass in an optional landlord id for when data is being updated (also for when amenities are same, need to check owneership)
//TODO: move all raw createm uodate, delete etc in the raw file
export async function createListing(data: CreateListingInput): Promise<boolean> {
    validateListingInput(data);
    await requireRole('LANDLORD');// check if correct role or not
  
    return prisma.$transaction(async (tx) => {
      const {
        selectedPropertyId,
        buildingName,
        streetName,
        city,
        postcode,
        landlordId,
        amenities = [],
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
      } = data;
  
      let propertyId: number;
  
  
      if (selectedPropertyId) {
        propertyId = selectedPropertyId;
  
        // UPDATE existing amenities using dbId
        for (const amenity of amenities) {
          if (amenity.dbId) {
            // UPDATE existing
            await tx.amenity.update({
              where: { id: amenity.dbId },
              data: {
                name: amenity.name,
                type: amenity.type,
                distance: amenity.distance ?? null,
              },
            });
          } else {
            // CREATE new
            await tx.amenity.create({
              data: {
                name: amenity.name,
                type: amenity.type,
                distance: amenity.distance ?? null,
                propertyId,
              },
            });
          }
        }
  
      } else {
        // create a new property if landlord did not use an existing one
  
        const property = await tx.property.create({
          data: {
            title: buildingName ?? "",
            streetName: streetName ?? "",
            city: city ?? "",
            postcode: postcode ?? "",
            landlordId,
  
            amenities: {
              create: amenities.map(({ name, type, distance }) => ({
                name,
                type,
                distance: distance ?? null,
              })),
            },
          },
        });
  
        propertyId = property.id;
      }
  
    // listing creation
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
  
      return !!listing;
    });
  }

export async function deleteListing(listingId: number): Promise<boolean> {
  const user = await requireRole('LANDLORD');
  if (!user) throw new Error("user timed out")
  try {
    await querySoftDeleteListing(listingId, user.id);
    return true;
  } catch {
    return false;
  }
}