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




/**** front end types */

// information that a form has before it is submitted to db
export type PropertyListingForm = {
  description: string;
  rent: number;
  availableFrom: Date;

  maxOccupants: number;
  minStay: number;

  bedrooms: number;
  bathrooms: number;

  flatNumber?: string;

  propertyId: number;

  // UI-only
  images?: string[]; // URLs before upload
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
