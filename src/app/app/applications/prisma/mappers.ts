import { Application } from "../types";
import { getApplicationsForApplicantQuery, getApplicationsForLandlordQuery } from "./rawQueries";
// mappers to map from raw query result to the application type used in the UI for both applicant and landlord views of the application dashboard
export function mapApplicantApplication(a: Awaited<ReturnType<typeof getApplicationsForApplicantQuery>>[number] ): Application {
    return {
      id: a.id,
      status: a.status,
      moveInDate: a.moveInDate.toLocaleString(),
      expiryDate: a.expiryDate?.toLocaleString(),
      submittedDate: a.createdAt.toLocaleString(),
      lastUpdatedDate: a.updatedAt.toLocaleString(),
      rent: a.listing.rent,
      listingName: a.listing.property.title,
      listingAddress: `${a.listing.property.streetName}, ${a.listing.property.city}`,
      landlordName: `${a.listing.property.landlord.firstName} ${a.listing.property.landlord.lastName}`,
      applicantName: `${a.user.firstName} ${a.user.lastName}`,
    };
  }
  
  export function mapLandlordApplication(a:  Awaited<ReturnType<typeof getApplicationsForLandlordQuery>>[number]): Application {
    return {
      id: a.id,
      status: a.status,
      moveInDate: a.moveInDate.toLocaleString(),
      expiryDate: a.expiryDate?.toLocaleString(),
      submittedDate: a.createdAt.toLocaleString(),
      lastUpdatedDate: a.updatedAt.toLocaleString(),
      rent: a.listing.rent,
      listingName: a.listing.property.title,
      listingAddress: `${a.listing.property.streetName}, ${a.listing.property.city}`,
      applicantName: `${a.user.firstName} ${a.user.lastName}`,
    };
  }