// some constants for app to use
import { Prisma } from "@prisma/client";

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
