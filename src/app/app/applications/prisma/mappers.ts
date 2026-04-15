import { Application } from "../types";
import { getApplicationsForApplicantQuery, getApplicationsForLandlordQuery } from "./rawQueries";
// mappers to map from raw query result to the application type used in the UI for both applicant and landlord views of the application dashboard
export function mapApplicantApplication(a: Awaited<ReturnType<typeof getApplicationsForApplicantQuery>>[number] ): Application {
    return {
      id: a.id,
      applicantId: a.userId,
      landlordId: a.listing.landlordId,
      status: a.status,
      moveInDate: a.moveInDate.toLocaleString(),
      expiryDate: a.expiryDate?.toISOString(),
      submittedDate: a.createdAt.toLocaleString(),
      lastUpdatedDate: a.updatedAt.toLocaleString(),
      rent: a.listing.rent,
      buildingName: a.listing.property.title,
      flatNumber: a.listing.flatNumber ?? undefined,
      listingAddress: `${a.listing.property.streetName}, ${a.listing.property.city}, ${a.listing.property.postcode}`,
      landlordName: `${a.listing.property.landlord.firstName} ${a.listing.property.landlord.lastName}`,
      applicantName: `${a.user.username}`,
    };
  }
  
  export function mapLandlordApplication(a:  Awaited<ReturnType<typeof getApplicationsForLandlordQuery>>[number]): Application {
    return {
      id: a.id,
      applicantId: a.userId,
      landlordId: a.listing.landlordId,
      status: a.status,
      moveInDate: a.moveInDate.toLocaleString(),
      expiryDate: a.expiryDate?.toISOString(),
      submittedDate: a.createdAt.toLocaleString(),
      lastUpdatedDate: a.updatedAt.toLocaleString(),
      rent: a.listing.rent,
      buildingName: a.listing.property.title,
      flatNumber: a.listing.flatNumber ?? undefined,
      listingAddress: `${a.listing.property.streetName}, ${a.listing.property.city}, ${a.listing.property.postcode}`,
      applicantName: `${a.user.username}`,
    };
  }