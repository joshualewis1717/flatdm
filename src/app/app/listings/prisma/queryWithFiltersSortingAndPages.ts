'use server'
import { prisma } from "@/lib/prisma";
import { runService } from "../../clientService/prisma/prismaUtils";
import { AmenityType, FurnishedType, Prisma } from "@prisma/client";
import { ListingParameters } from "../types";
import { getAvailableFrom } from "./mappers";

const EARTH_RADIUS_MILES = 3958.8;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const haversineDistanceMiles = (
	fromLat: number,
	fromLng: number,
	toLat: number,
	toLng: number
) => {
	const dLat = toRadians(toLat - fromLat);
	const dLng = toRadians(toLng - fromLng);
	const lat1 = toRadians(fromLat);
	const lat2 = toRadians(toLat);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return EARTH_RADIUS_MILES * c;
};

export async function queryWithFiltersSortingAndPages(LP: ListingParameters) {
	return runService(async () => {
	// from ListingParameters, this query considers:
	// rent_min, rent_max, maxoccupants_max, minstay_max, bedrooms_min, bedrooms_max, bathrooms_min, bathrooms_max, area_min, area_max, has_photo, furnished_level, transport_nearby, healthcare_nearby, recreation_nearby, other_nearby, available_from
	// + distance_to_location, location_lat, location_lng


	// Base where clause (only non-deleted listings)
	const where: Prisma.PropertyListingWhereInput = {
		isDeleted: false,
	};
	const andFilters: Prisma.PropertyListingWhereInput[] = [];

	// Helper to convert various filter inputs to Prisma-compatible filters
	const toFiniteNumber = (value: unknown) => {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : null;
	};

	// Helper to create range filters for Prisma
	const getRangeFilter = (minRaw: unknown, maxRaw: unknown) => {
		const min = toFiniteNumber(minRaw);
		const max = toFiniteNumber(maxRaw);
		if (min === null && max === null) {
			return null;
		}

		return {
			...(min !== null ? { gte: min } : {}),
			...(max !== null ? { lte: max } : {}),
		};
	};


	// available_from filter (special handling for "now" and invalid dates)
	const now = new Date();

	const availableFromFilter = (() => {
		if (!LP.available_from) {
			return null;
		}

		if (LP.available_from === "now") {
			return now;
		}

		const parsed = new Date(LP.available_from);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	})();

	// first distance filter (JS/TS later does haversine)
	// simple bounding box
	const distanceToLocation = toFiniteNumber(LP.distance_to_location);
	const locationLat = toFiniteNumber(LP.location_lat);
	const locationLng = toFiniteNumber(LP.location_lng);
	
	const hasDistanceFilter =
		distanceToLocation !== null &&
		distanceToLocation > 0 &&
		locationLat !== null &&
		locationLng !== null;

	if (hasDistanceFilter) {
		const latDelta = distanceToLocation / 69;
		const cosLat = Math.cos(toRadians(locationLat));
		const safeCosLat = Math.max(Math.abs(cosLat), 0.01);
		const lngDelta = distanceToLocation / (69 * safeCosLat);
		const latRange = {
			gte: locationLat - latDelta,
			lte: locationLat + latDelta,
		};
		const lngRange = {
			gte: locationLng - lngDelta,
			lte: locationLng + lngDelta,
		};

		andFilters.push({
			property: {
				is: {
					lat: latRange,
					lng: lngRange,
				},
			},
		});
	}

	// numeric min/max filters
    // rent_min, rent_max
	const rentRange = getRangeFilter(LP.rent_min, LP.rent_max);
	if (rentRange) {
		where.rent = rentRange;
	}

    // bedrooms_min, bedrooms_max
	const bedroomsRange = getRangeFilter(LP.bedrooms_min, LP.bedrooms_max);
	if (bedroomsRange) {
		where.bedrooms = bedroomsRange;
	}

    // bathrooms_min, bathrooms_max
	const bathroomsRange = getRangeFilter(LP.bathrooms_min, LP.bathrooms_max);
	if (bathroomsRange) {
		where.bathrooms = bathroomsRange;
	}

    // area_min, area_max
	const areaRange = getRangeFilter(LP.area_min, LP.area_max);
	if (areaRange) {
		where.area = areaRange;
	}

	// numeric upper-bound filters
    // maxoccupants_max
	const maxOccupantsMax = toFiniteNumber(LP.maxoccupants_max);
	if (maxOccupantsMax !== null) {
		where.maxOccupants = { lte: maxOccupantsMax };
	}

    // minstay_max
	const minStayMax = toFiniteNumber(LP.minstay_max);
	if (minStayMax !== null) {
		where.minStay = { lte: minStayMax };
	}

	// media filter
    // has_photo
	if (typeof LP.has_photo === 'boolean') {
		where.images = LP.has_photo ? { some: {} } : { none: {} };
	}

	// furnished level filter
    // furnished_level
	const furnishedLevelMap: Record<NonNullable<ListingParameters['furnished_level']>, FurnishedType> = {
		furnished: FurnishedType.FULLY_FURNISHED,
		part_furnished: FurnishedType.PART_FURNISHED,
		unfurnished: FurnishedType.UNFURNISHED,
	};
	if (LP.furnished_level) {
		where.furnished_type = furnishedLevelMap[LP.furnished_level];
	}

	// nearby amenities (require all selected categories)
    // transport_nearby, healthcare_nearby, recreation_nearby, other_nearby
	const selectedAmenityTypes: AmenityType[] = [];
	if (LP.transport_nearby) {
		selectedAmenityTypes.push(AmenityType.TRANSPORT);
	}
	if (LP.healthcare_nearby) {
		selectedAmenityTypes.push(AmenityType.HEALTHCARE);
	}
	if (LP.recreation_nearby) {
		selectedAmenityTypes.push(AmenityType.RECREATIONAL);
	}
	if (LP.other_nearby) {
		selectedAmenityTypes.push(AmenityType.OTHER);
	}

    // Combine filters with AND logic
	if (selectedAmenityTypes.length > 0) {
		andFilters.push(
			...selectedAmenityTypes.map((amenityType) => ({
				property: {
					is: {
						amenities: {
							some: {
								type: amenityType,
							},
						},
					},
				},
			}))
		);
	}

	// Add filters to prisma query
	if (andFilters.length > 0) {
		where.AND = andFilters;
	}

	// Call prisma query
	const items = await prisma.propertyListing.findMany({
		where,
		include: {
			images: {
				select: {
					id: true,
					isThumbnail: true,
					mimeType: true,
				},
			},
			property: {
				include: {
					amenities: true,
					landlord: { select: { username: true } },
				},
			},
			occupants: {
				where: {
					OR: [
						{ moveOut: null },
						{ moveOut: { gt: now } },
					],
				},
				include: { user: true },
			},
		},
	});

	// Add availableFrom field based on occupants and maxOccupants, then filter by available_from if provided
	// and return
	return items
		.map((item) => ({
			...item,
			availableFrom: getAvailableFrom(item.occupants, item.maxOccupants),
		}))
		.filter((item) => {
			if (hasDistanceFilter) {
				const propertyDistanceMiles = haversineDistanceMiles(
					locationLat,
					locationLng,
					item.property.lat,
					item.property.lng
				);

				if (propertyDistanceMiles > distanceToLocation) {
					return false;
				}
			}

			if (!availableFromFilter) {
				return true;
			}

			return item.availableFrom !== null && item.availableFrom <= availableFromFilter;
		});
	});
}