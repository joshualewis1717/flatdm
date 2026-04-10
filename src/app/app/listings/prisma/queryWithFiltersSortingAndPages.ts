'use server'
import { prisma } from "@/lib/prisma";
import { AmenityType } from "@prisma/client";
import { ListingParameters } from "../types";

export async function queryWithFiltersSortingAndPages(LP: ListingParameters) {
	type FindManyArgs = NonNullable<Parameters<typeof prisma.propertyListing.findMany>[0]>;
	const where: FindManyArgs['where'] = {
		isDeleted: false,
	};

	const rent_min = Number(LP.rent_min);
	const rent_max = Number(LP.rent_max);
	if (Number.isFinite(rent_min) || Number.isFinite(rent_max)) {
		where.rent = {
			...(Number.isFinite(rent_min) ? { gte: rent_min } : {}),
			...(Number.isFinite(rent_max) ? { lte: rent_max } : {}),
		};
	}

	const bedrooms_min = Number(LP.bedrooms_min);
	const bedrooms_max = Number(LP.bedrooms_max);
	if (Number.isFinite(bedrooms_min) || Number.isFinite(bedrooms_max)) {
		where.bedrooms = {
			...(Number.isFinite(bedrooms_min) ? { gte: bedrooms_min } : {}),
			...(Number.isFinite(bedrooms_max) ? { lte: bedrooms_max } : {}),
		};
	}

	const bathrooms_min = Number(LP.bathrooms_min);
	const bathrooms_max = Number(LP.bathrooms_max);
	if (Number.isFinite(bathrooms_min) || Number.isFinite(bathrooms_max)) {
		where.bathrooms = {
			...(Number.isFinite(bathrooms_min) ? { gte: bathrooms_min } : {}),
			...(Number.isFinite(bathrooms_max) ? { lte: bathrooms_max } : {}),
		};
	}

	const area_min = Number(LP.area_min);
	const area_max = Number(LP.area_max);
	if (Number.isFinite(area_min) || Number.isFinite(area_max)) {
		where.area = {
			...(Number.isFinite(area_min) ? { gte: area_min } : {}),
			...(Number.isFinite(area_max) ? { lte: area_max } : {}),
		};
	}

	const maxOccupants_max = Number(LP.maxoccupants_max);
	if (Number.isFinite(maxOccupants_max)) {
		where.maxOccupants = { lte: maxOccupants_max };
	}

	const minStay_max = Number(LP.minstay_max);
	if (Number.isFinite(minStay_max)) {
		where.minStay = { lte: minStay_max };
	}

	if (typeof LP.has_photo === 'boolean') {
		where.images = LP.has_photo ? { some: {} } : { none: {} };
	}

	// Availability is derived from occupancy windows since PropertyListing has no direct availableFrom field.
	let availableAt: Date | null = null;
	if (LP.available_from === 'now') {
		availableAt = new Date();
	} else if (typeof LP.available_from === 'string') {
		const parsed = new Date(LP.available_from);
		if (!Number.isNaN(parsed.getTime())) {
			availableAt = parsed;
		}
	}
	if (availableAt) {
		where.NOT = {
			occupants: {
				some: {
					moveIn: { lte: availableAt },
					OR: [
						{ moveOut: null },
						{ moveOut: { gt: availableAt } },
					],
				},
			},
		};
	}

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

	if (selectedAmenityTypes.length > 0) {
		where.AND = [
			...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
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
			})),
		];
	}

	const items = await prisma.propertyListing.findMany({
		where,
		include: {
			images: true,
			property: {
				include: {
					amenities: true,
				},
			},
		},
	});

	return items;
}