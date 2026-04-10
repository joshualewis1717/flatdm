import { AmenityType, Prisma } from "@prisma/client";
import type { Dispatch, SetStateAction } from "react";
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
export type OccupantWithUser = Prisma.OccupantGetPayload<{
  include: { user: true };
}>;
export type ListingImage = Prisma.ListingImageGetPayload<{}>;
export type PropertyApplication = Prisma.PropertyApplicationGetPayload<{}>;
export type Amenity = Prisma.AmenityGetPayload<{}>;


// AmenityDraft keeps distance as a UI range string until submit
export type AmenityDraft = Omit<Amenity, "distance"> & {
  distance: DistanceRange | null;
};



/**** front end types */

export type AmenityUI={
  id: string;// for tracking in the UI, not related to DB id (we are using uuids)
  dbId?: number;// the actual DB id if this amenity already exists in the DB, used for updating existing amenities vs creating new ones on submit 
  type: AmenityType;
  name: Amenity['name'];
  distance: number;
};

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
  area: number; // m²

  maxOccupants: number;
  minStay: number;

  thumbnail: string;
  images?: string[];
  amenities?: AmenityUI[];// any additional amenitie info
};


// For the property selector component when creating a listing, represents a previously saved property (building) that landlords can choose to autofill from
export type ExistingProperty = {
  id: number;// property id
  streetName: string;
  city: string;
  postcode: string;
  buildingName: string;
  amenities: AmenityUI[];
  hasExistingAmenities: boolean;
};

/**** Listing info data client side type wrapper */
export type ListingInfoData = {
  propertyId?: number;// id of the building itself
  id: number;// listing id
  buildingName: string;
  flatNumber: string | null;
  streetName: string;
  city: string;
  postcode: string;
  landlordName: string;
  description: string;
  rent: number;
  availableFrom: Date | null;
  totalRooms: number;
  bedrooms: number;
  bathrooms: number;
  maxOccupants: number;
  area: number;
  minStay: number;
  lastUpdated: Date;
  thumbnail: string | null;
  images?: string[];
  amenities: AmenityUI[];
}
  
export type OccupantUI ={
  id: number;// occupant id
  userId: number;
  name: string;
  moveInDate: Date;
  moveOutDate: Date | null;
}

export type PropertyListingUI = {
  id: number;
  buildingName: string;
  flatNumber: string | null;
  streetName: string;
  city: string;
  postcode: string;
  createdAt: Date;
  lastUpdated: Date;
  thumbnail: string | null;
  images?: string[];
  availableFrom: Date | null;
  maxOccupants: number;
  currentOccupants: number;
};

/*** type wrapper for the data in my properties page */
export type MyPropertyListingData = {
  propertyListing: PropertyListingUI;
  currentOccupants: OccupantUI[];   // moveIn <= now
  upcomingOccupants: OccupantUI[];  // moveIn > now
}

/***** non prisma UI types */

export type DistanceRange = '0-2' | '2-5' | '5-10';

// UI-only roommate representation
export type Roommate = {
  id: number;
  name: string;
  avatarUrl?: string | null;
};

// UI-only review (not DB Review model), used for ratings
export type ListingReview = {
  id: number;
  reviewerId: number;
  username: string;
  comment: string;
  rating?: number;
  listingId?: number | null;// which listing the review is for
  createdAt?: Date;
};

// Shared query/filter params state for listings pages.
export type ListingParameters = Record<string, unknown> & {
  //
  //
  // Filters
  rent_min?: number;
  rent_max?: number;

  available_from?: string | 'now'; // ISO date string

  maxoccupants_max?: number; // 1 = no roomates, else = shared

  minstay_max?: number; // minimum stay up to X months

  bedrooms_min?: number;
  bedrooms_max?: number;

  bathrooms_min?: number;
  bathrooms_max?: number;

  area_min?: number;
  area_max?: number;

  has_photo?: boolean;

  furnished_level?: 'furnished' | 'unfurnished' | 'part_furnished';

  transport_nearby?: boolean;
  healthcare_nearby?: boolean;
  recreation_nearby?: boolean;
  other_nearby?: boolean;

  //
  //
  // Distance Searching
  distance_to_location?: number; // in km, for filtering by distance to a specific location (e.g. city center)
  location_lat?: number; // for distance filtering
  location_lng?: number; // for distance filtering
  search?: string;

  //
  //
  // Sorting
  sort_by?: 'rent' | 'available_from' | 'area' | 'created_at' | 'updated_at' | 'distance';
  sort_order?: 'asc' | 'desc';

  //
  //
  // Pagination
  page?: number;
};

// Shared all items state for listings pages
export type ListingsResultItem = Prisma.PropertyListingGetPayload<{
  include: {
    images: true;
    property: {
      include: {
        amenities: true;
      };
    };
  };
}>;

export type PaginationMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type AllItemsState = {
  ListingsResults: ListingsResultItem[];
  setListingsResults: Dispatch<SetStateAction<ListingsResultItem[]>>;
  paginationMeta: PaginationMeta;
  setPaginationMeta: Dispatch<SetStateAction<PaginationMeta>>;
  querySignature: string | null;
  setQuerySignature: Dispatch<SetStateAction<string | null>>;
};