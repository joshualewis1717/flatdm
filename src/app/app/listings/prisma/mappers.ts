// functions to map raw prisma query to data that our UI can work with:

import { Amenity } from "@prisma/client";
import { AmenityUI, ExistingProperty, ListingInfoData, MyPropertyListingData, OccupantUI, OccupantWithUser } from "../types";
import { queryListingById, queryListingsForLandlord, queryPropertiesForLandlord } from "./rawQueries";
import { useAllItemsState } from "../state/AllItemsStateProvider";

/********** helper functions ************/

type CachedListing = ReturnType<typeof useAllItemsState>["ListingsResults"][number];// wtype of what our cached listing stors


// function to convert images into an url
function toImageUrl(img: { id: number }): string {
  return `/api/images/${img.id}`;
}

export function getAvailableFrom(
  occupants: { moveIn: Date; moveOut: Date | null }[],
  maxOccupants: number
): Date | null {
  const now = new Date();

   // Check if currently available
  const currentOccupants = occupants.filter(o =>
    o.moveIn <= now && (!o.moveOut || o.moveOut > now)
  ).length;

  if (currentOccupants < maxOccupants) {
    return now;
  }

   // Find the earliest move-out that frees a spot
  const moveOuts = occupants
    .map(o => o.moveOut)
    .filter((d): d is Date => !!d && d > now)
    .sort((a, b) => a.getTime() - b.getTime());

  if (moveOuts.length === 0) {
    return null; // fully occupied forever
  }

  return moveOuts[0];
}

// function to map raw amenity type to amenity UI
export function mapToAmenityUI(amenities: Amenity[]): AmenityUI[] {
  return amenities.map((a) => ({
    id: crypto.randomUUID(),
    dbId: a.id,
    name: a.name,
    type: a.type,
    distance: a.distance ?? -1, // remove this once we update schema
  }));
}

// function to map an occupant from db to the occupantUI type
function mapOccupantToUI(o: OccupantWithUser): OccupantUI {
  return {
    id: o.id,
    userId: o.userId,
    name: o.user.username,
    moveInDate: o.moveIn,
    moveOutDate: o.moveOut,
  };
}

// function to map an occupant from db to occupantUI type but without the dates, it filters and shows only
function mapOccupantToUINoDates(o: OccupantWithUser){
  return{
    id: o.id,
    userId: o.userId,
    name: o.user.username,
  }
}

// map from raw property query result to the ExistingProperty type
export function mapToExistingProperty(p: Awaited<ReturnType<typeof queryPropertiesForLandlord>>[number]): ExistingProperty {
  return {
    id: p.id,
    buildingName: p.title,
    streetName: p.streetName,
    city: p.city,
    postcode: p.postcode,
    hasExistingAmenities: p.amenities.length > 0,
    amenities: mapToAmenityUI(p.amenities),
  };
}

export function mapToListingDetail(listing: NonNullable<Awaited<ReturnType<typeof queryListingById>>>): ListingInfoData {
  const thumbnailImg = listing.images.find((img) => img.isThumbnail);

  // for listingInfoData we only want current occupants, no future occupants unlike other functions
  const now = new Date();

  const currentOccupants = listing.occupants.filter(o =>
    o.moveIn <= now && (!o.moveOut || o.moveOut > now)
  );

  return {
    propertyId: listing.propertyId,
    id: listing.id,
    flatNumber: listing.flatNumber ?? null,
    description: listing.description,
    rent: listing.rent,
    area: listing.area,
    totalRooms: listing.rooms,
    availableFrom: getAvailableFrom(listing.occupants, listing.maxOccupants),
    lastUpdated: listing.updatedAt,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    furnishedLevel: listing.furnished_type,
    maxOccupants: listing.maxOccupants,
    minStay: listing.minStay,
    thumbnail: thumbnailImg ? toImageUrl(thumbnailImg) : null,
    images: listing.images.filter((img) => !img.isThumbnail).map(toImageUrl),
    buildingName: listing.property.title,
    streetName: listing.property.streetName,
    city: listing.property.city,
    postcode: listing.property.postcode,
    landlordName: listing.property.landlord.username,
    amenities: mapToAmenityUI(listing.property.amenities),
    currentOccupants: currentOccupants.map(mapOccupantToUINoDates)
  };
}

// function to map property listing data to the data format that the my properties page expects
export function mapToMyPropertyListing(listing: Awaited<ReturnType<typeof queryListingsForLandlord>>[number]): MyPropertyListingData {
  const thumbnailImg = listing.images.find((img) => img.isThumbnail);
  const now = new Date();

  const allOccupants = listing.occupants.map(mapOccupantToUI);
  const currentOccupants  = allOccupants.filter(o => o.moveInDate <= now);
  const upcomingOccupants = allOccupants.filter(o => o.moveInDate > now);

  return {
    propertyListing: {
      id: listing.id,
      buildingName: listing.property.title,
      flatNumber: listing.flatNumber ?? null,
      streetName: listing.property.streetName,
      city: listing.property.city,
      postcode: listing.property.postcode,
      createdAt: listing.createdAt,
      lastUpdated: listing.updatedAt,
      thumbnail: thumbnailImg ? toImageUrl(thumbnailImg) : null,
      images: listing.images.filter((img) => !img.isThumbnail).map(toImageUrl),
      availableFrom: getAvailableFrom(listing.occupants, listing.maxOccupants),
      maxOccupants: listing.maxOccupants,
      currentOccupants: currentOccupants.length,
    },
    currentOccupants,
    upcomingOccupants,
  };
}




// function to map our cached listing data to our normal listing data
export function mapCachedListingToListingData(listing: CachedListing): ListingInfoData {
  const thumbnail = listing.images.find((img) => img.isThumbnail) ?? null;

  return {
    propertyId: listing.propertyId,
    id: listing.id,
    flatNumber: listing.flatNumber ?? null,
    description: listing.description,
    rent: listing.rent,
    availableFrom: listing.availableFrom,
    totalRooms: listing.rooms,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    furnishedLevel: listing.furnished_type,
    maxOccupants: listing.maxOccupants,
    area: listing.area,
    minStay: listing.minStay,
    lastUpdated: new Date(listing.updatedAt),
    thumbnail: thumbnail ? `/api/images/${thumbnail.id}` : null,
    images: listing.images
      .filter((img) => !img.isThumbnail)
      .map((img) => `/api/images/${img.id}`),
    buildingName: listing.property.title,
    streetName: listing.property.streetName,
    city: listing.property.city,
    postcode: listing.property.postcode,
    landlordName: listing.property.landlord.username,
    amenities: listing.property.amenities.map((amenity) => ({
      id: `cached-amenity-${amenity.id}`,
      dbId: amenity.id,
      name: amenity.name,
      type: amenity.type,
      distance: amenity.distance ?? -1,
    })),
  };
}