'use server'
import { prisma } from "@/lib/prisma";
// raw prisma queries for listings
export async function queryPropertiesForLandlord(landlordId: number) {
  return prisma.property.findMany({
    where: { landlordId },
    select: {
      id: true,
      title: true,
      streetName: true,
      city: true,
      postcode: true,
      amenities:true,
      listings: { select: { id: true }, take: 1 },
    },
  });
}

export async function queryListingById(listingId: number) {
  return prisma.propertyListing.findUnique({
    where: { id: listingId, isDeleted: false },
    include: {
      images: true,
      property: {
        include: {
          amenities: true,
          landlord: { select: { username: true } },
        },
      },
    },
  });
}

export async function queryListingsForLandlord(landlordId: number) {
  return prisma.propertyListing.findMany({
    where: { landlordId, isDeleted: false },
    include: {
      images: true,
      property: true,
      occupants: {
        include: {
          user: true,
        },
      },
    },
  });
}

export async function queryCreateProperty(tx: any, data: Parameters<typeof prisma.property.create>[0]['data']) {
  return tx.property.create({ data });
}

export async function queryCreateListing(tx: any, data: Parameters<typeof prisma.propertyListing.create>[0]['data']) {
  return tx.propertyListing.create({ data });
}

export async function querySoftDeleteListing(listingId: number, landlordId: number) {
  return prisma.propertyListing.update({
    where: { id: listingId, landlordId: landlordId},
    data: { isDeleted: true },
  });
}