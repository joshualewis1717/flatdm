import { prisma } from "@/lib/prisma";
import 'server-only'
import { AmenityUI, PropertyListingForm } from "../types";
import { FurnishedType } from "@prisma/client";
type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// raw prisma queries for listings
export async function queryPropertiesForLandlord(landlordId: number) {
  return prisma.property.findMany({
    where: { landlordId },
    select: {
      id: true,
      title: true,
      streetName: true,
      city: true,
      postcode: true,
      amenities:true,
      listings: { select: { id: true }, take: 1 },
    },
  });
}

// function to get landlord from listing id
export async function queryLandlordByListingId(listingId: number) {
  return prisma.propertyListing.findUnique({
    where: { id: listingId },
    select: {
      landlord: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });
}

export async function queryListingById(listingId: number) {
  return prisma.propertyListing.findUnique({
    where: { id: listingId, isDeleted: false },
    include: {
      images: {// get the images data so we can serve them to user
        select: {
          id: true,           
          isThumbnail: true,
          mimeType: true,     //  needed for the API route to serve to user
        },
      },
      property: {
        include: {
          amenities: true,
          landlord: { select: { username: true } },
        },
      },
      occupants: {
        where: {// also include occpants to calculate when list is available
          OR: [
            { moveOut: null },
            { moveOut: { gt: new Date() } },
          ],
        },
        include: { user: true }, //  needed for mapOccupantToUI in mapToListingDetail
      },
    },
  });
}

export async function queryListingsForLandlord(landlordId: number) {
  const now = new Date();
  return prisma.propertyListing.findMany({
    where: { landlordId, isDeleted: false },
    include: {
      images: {
        select: {
          id: true,           
          isThumbnail: true,
          mimeType: true,     
        },
      },
      property: true,
      occupants: {
        where: {// do not include any expired occupancies e.g. when move out < current.Date()
          OR: [
            { moveOut: null },
            { moveOut: { gte: now } },
          ],
        },
        include: { user: true },
      },
    },
  });
}

export async function queryCreateProperty(tx: PrismaTx, data: Parameters<typeof prisma.property.create>[0]['data']) {
  return tx.property.create({ data });
}

export async function queryCreateListing(tx: PrismaTx, data: Parameters<typeof prisma.propertyListing.create>[0]['data']) {
  return tx.propertyListing.create({ data });
}

export async function querySoftDeleteListing(listingId: number, landlordId: number) {
  return prisma.propertyListing.update({
    where: { id: listingId, landlordId: landlordId},
    data: { isDeleted: true },
  });
}

export async function queryAllListings() {
  const listings = await prisma.propertyListing.findMany({
    include: {
      images: true,
      property: {
        include: {
          amenities: true,
        },
      },
    },
  });
  
  return listings;
}

// function to update or delete a property
export async function propertyUpsert(tx: PrismaTx, data: PropertyListingForm, landlordId: number){
  return tx.property.upsert({
    where: {
      streetName_city_postcode_landlordId: {
        streetName: data.streetName ?? "",
        city: data.city ?? "",
        postcode: data.postcode ?? "",
        landlordId,
      },
    },
    update: { title: data.buildingName ?? "" },
     // Update the title in case they corrected the building name
    create: {
      title: data.buildingName ?? "",
      streetName: data.streetName ?? "",
      city: data.city ?? "",
      postcode: data.postcode ?? "",
      landlordId,
      lat: 1.2,// TODO: derive from geocoding later
      lng: 1.2,
      amenities: {
        create: (data.amenities ?? []).map(({ name, type, distance }) => ({ name, type, distance: distance ?? null })),
      },
    },
  });

}


// function to async amenities from db into UI and vice versa
export async function querySyncAmenity( tx: PrismaTx, amenity:AmenityUI, propertyId: number) {
  if (amenity.dbId) {
    return tx.amenity.update({
      where: { id: amenity.dbId },
      data: { name: amenity.name, type: amenity.type, distance: amenity.distance ?? null },
    });
  }
  return tx.amenity.create({
    data: { name: amenity.name, type: amenity.type, distance: amenity.distance ?? null, propertyId },
  });
}

// function to check if there is a listing conflict by checking the flat number
export async function queryCheckListingConflict( propertyId: number, excludeListingId?: number) {
  return prisma.propertyListing.findMany({
    where: {
      propertyId,
      isDeleted: false,
      ...(excludeListingId ? { id: { not: excludeListingId } } : {}),
    },
    select: { id: true, flatNumber: true },
  });
}

// function to update a listing, not inlcuding the amenities
export async function queryUpdateListing(
  tx: PrismaTx,
  listingId: number,
  data: {
    flatNumber: string;
    description: string;
    rent: number;
    rooms: number;
    bedrooms: number;
    bathrooms: number;
    area: number;
    maxOccupants: number;
    minStay: number;
    propertyId: number;
    furnished_type: FurnishedType
  }
) {
  return tx.propertyListing.update({
    where: { id: listingId },
    data,
  });
}