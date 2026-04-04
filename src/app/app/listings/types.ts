import { Prisma } from "@prisma/client";

//
// 🔹 ==============================
// 🔹 PRISMA INCLUDE CONFIGS
// 🔹 ==============================
//

// Property (building-level)
export const propertyInclude = {
  amenities: true,
  listings: true,
} satisfies Prisma.PropertyInclude;

// Full listing (for pages / detailed cards)
export const propertyListingFullInclude = {
  occupants: true,
  property: {
    include: {
      amenities: true,
    },
  },
  images: true,
  applications: true,
} satisfies Prisma.PropertyListingInclude;

// Lightweight listing (for lists)
export const propertyListingBasicInclude = {
  occupants: true,
  images: true,
} satisfies Prisma.PropertyListingInclude;



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
  address: string;
  city: string;
  postcode: string;
  buildingName: string;
  amenities: Amenity[];
  hasExistingListings: boolean;
};

/***** non prisma UI types */

// Keep if you need filtering logic in UI
export type AmenityType = 'HEALTHCARE' | 'TRANSPORT' | 'RECREATIONAL' | 'OTHER';

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

export type Occupant = {//TODO: use types from prisma instead (consultant table), make this be a wrapper
  id: number;
  name: string;
  type: OccupantType;
  movedIn?: string | null;
  expectedMoveOut?: string | null;
  expectedMoveIn?: string | null;
}

export type Property= {// TODO: use from pisma table instead 
  id: number;
  name: string;
  streetName: string;
  thumbnail: string;// thumbnail image of the property (TODO: make this optional later and in public have a default thumbail
  // image and use that if landlord never added in a thumnail)
  maxOccupants: number;
  earliestFreeDate: string;
  occupants: Occupant[];
}