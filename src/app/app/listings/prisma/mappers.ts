// functions to map raw prisma query to data that our UI can work with:

import { Amenity } from "@prisma/client";
import { AmenityUI, ExistingProperty, ListingInfoData, MyPropertyListingData, OccupantUI, OccupantWithUser } from "../types";
import { queryListingById, queryListingsForLandlord, queryPropertiesForLandlord } from "./rawQueries";



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


  function mapOccupantToUI(o: OccupantWithUser): OccupantUI {
    return {
      id: o.id,
      userId: o.userId,
      name: `${o.user.firstName} ${o.user.lastName}`,
      moveInDate: o.moveIn,
      moveOutDate: o.moveOut,
    };
  }


// map from raw property query result to the ExistingProperty type used in the UI for the property selector when creating a listing
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
  const thumbnail = listing.images.find((img) => img.isThumbnail);
  const images = listing.images.filter((img) => !img.isThumbnail).map((img) => img.url);

  return {
    id: listing.id,
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
    thumbnail: thumbnail?.url ?? null,
    images,
    buildingName: listing.property.title,
    streetName: listing.property.streetName,
    city: listing.property.city,
    postcode: listing.property.postcode,
    landlordName: listing.property.landlord.username,
    amenities: mapToAmenityUI(listing.property.amenities),
  };
}

// function to map property listing data to the data format that the my property listing page expects
export function mapToMyPropertyListing(
  listing: Awaited<ReturnType<typeof queryListingsForLandlord>>[number]
): MyPropertyListingData {
  const thumbnail = listing.images.find((img) => img.isThumbnail);
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
      thumbnail: thumbnail?.url ?? null,
      images: listing.images.map((img) => img.url),
      availableFrom: listing.availableFrom,
      maxOccupants: listing.maxOccupants,
      currentOccupants: currentOccupants.length, // count for the pill/badge
    },
    currentOccupants,
    upcomingOccupants,
  };
}