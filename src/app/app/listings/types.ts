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
    id: string;
    type: AmenityType;
    name: string;
    distance: number;
};

export type AmenityType = 'HEALTHCARE' | 'TRANSPORT' | 'RECREATIONAL' | 'OTHER';
export type DistanceRange = '0-2' | '2-5' | '5-10';