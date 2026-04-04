export type ListingForm={
    title: string,
    property: string,
    address: string,
    rooms: number,
    bathrooms: number,
    beds: number,
    maxOccupants: number,
    size: number,
    rent: number,
    AvailableFrom?: number
    minStay: number,
    roommatesAllowed: boolean,
    description: string,
    Amenities?: Amenity[]
    images?: string[]// url strings?
}

export type Amenity = {
    id: number;
    type: AmenityType;
    name: string;
    distance: number;
};

export type AmenityType = 'HEALTHCARE' | 'TRANSPORT' | 'RECREATIONAL' | 'OTHER';
export type DistanceRange = '0-2' | '2-5' | '5-10';

export type Roommate = {
    id: number;
    name: string;
    avatarUrl?: string | null;
};

export type Review = {
    id: number;
    user: string;
    comment: string;
    rating?: number;
};


/*********** my property specific types */

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