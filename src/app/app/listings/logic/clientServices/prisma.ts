'use server'
// a bunch of servar side functions to fetch and manipulate data related to listings and properties, using prisma

// app/actions/createListing.ts
"use server";

import { prisma } from "@/lib/prisma";
import { ExistingProperty, PropertyListingForm } from "../../types";

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