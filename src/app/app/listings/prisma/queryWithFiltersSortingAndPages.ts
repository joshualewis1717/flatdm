'use server'
import { prisma } from "@/lib/prisma";
import { AmenityType, FurnishedType, Prisma } from "@prisma/client";
import { ListingParameters } from "../types";

export async function queryWithFiltersSortingAndPages(LP: ListingParameters) {
	// from ListingParameters, this query considers:
	// rent_min, rent_max, maxoccupants_max, minstay_max, bedrooms_min, bedrooms_max, bathrooms_min, bathrooms_max, area_min, area_max, has_photo, furnished_level, transport_nearby, healthcare_nearby, recreation_nearby, other_nearby, available_from
	const now = new Date();
	const where: Prisma.PropertyListingWhereInput = {
		isDeleted: false,
	};
	const andFilters: Prisma.PropertyListingWhereInput[] = [];

	const toFiniteNumber = (value: unknown) => {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : null;
	};

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

	const getAvailableFrom = (
		occupants: { moveIn: Date; moveOut: Date | null }[],
		maxOccupants: number,
	) => {
		const currentOccupants = occupants.filter(
			(occupant) => occupant.moveIn <= now && (!occupant.moveOut || occupant.moveOut > now),
		).length;

		if (currentOccupants < maxOccupants) {
			return now;
		}

		const moveOuts = occupants
			.map((occupant) => occupant.moveOut)
			.filter((moveOut): moveOut is Date => !!moveOut && moveOut > now)
			.sort((a, b) => a.getTime() - b.getTime());

		if (moveOuts.length === 0) {
			return null;
		}

		return moveOuts[0];
	};

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

	if (andFilters.length > 0) {
		where.AND = andFilters;
	}

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

	return items
		.map((item) => ({
			...item,
			availableFrom: getAvailableFrom(item.occupants, item.maxOccupants),
		}))
		.filter((item) => {
			if (!availableFromFilter) {
				return true;
			}

			return item.availableFrom !== null && item.availableFrom <= availableFromFilter;
		});
}