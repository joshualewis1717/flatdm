import { Prisma } from "@prisma/client";
import { propertyInclude, propertyListingBasicInclude, propertyListingFullInclude } from "./prismaConst";

/***** prisma types relatin with listing and property management *********/

/**** types which we need to also add in the relations */
// Property (building)
export type Property = Prisma.PropertyGetPayload<{
  include: typeof propertyInclude;
}>;

// Full listing
export type PropertyListing = Prisma.PropertyListingGetPayload<{
  include: typeof propertyListingFullInclude;
}>;

// Basic listing
export type PropertyListingBasic = Prisma.PropertyListingGetPayload<{
  include: typeof propertyListingBasicInclude;
}>;

/****** types in which there is no relation for us to inclide */
export type Occupant = Prisma.OccupantGetPayload<{}>;
export type ListingImage = Prisma.ListingImageGetPayload<{}>;
export type PropertyApplication = Prisma.PropertyApplicationGetPayload<{}>;
export type Amenity = Prisma.AmenityGetPayload<{}>;


// AmenityDraft keeps distance as a UI range string until submit
export type AmenityDraft = Omit<Amenity, "distance"> & {
  distance: DistanceRange | null;
};



/**** front end types */


// Form data for creating/editing a listing
export type PropertyListingForm = {
  // Property selection
   // If set → use existing property (building)
   //If undefine,  create a new property from address fields
  selectedPropertyId?: number;

  //  Address (only used when creating a NEW property) 

  buildingName?: string; // building / flat name (NOT the listing title)
  city?: string;
  streetName?: string;
  postcode?: string;

  // Flat-level identifier (always optional)
  flatNumber?: string;

  //  basic listing info details

  description: string;
  rent: number; // per person per month (£)
  availableFrom: Date;

  rooms: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  area: number; // m²

  maxOccupants: number;
  minStay: number;

  thumbnail: string;
  images?: string[];
  amenities?: Amenity[];// any additional amenitie info
};


// For the property selector component when creating a listing, represents a previously saved property (building) that landlords can choose to autofill from
export type ExistingProperty = {
  id: number;
  streetName: string;
  city: string;
  postcode: string;
  buildingName: string;
  amenities: Amenity[];
  hasExistingListings: boolean;
};

/***** non prisma UI types */

export type DistanceRange = '0-2' | '2-5' | '5-10';

// UI-only roommate representation
export type Roommate = {
  id: number;
  name: string;
  avatarUrl?: string | null;
};

// UI-only review (not DB Review model)
export type ReviewUI = {
  id: number;
  user: string;
  comment: string;
  rating?: number;
};



// If you want a "display-friendly" occupant
export type OccupantType = 'occupant' | 'applicant';

// Shared query/filter params state for listings pages.
export type ListingParameters = Record<string, unknown> & {
  changed: boolean;
};