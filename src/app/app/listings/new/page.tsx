'use client'
import ListingForm from "../components/createForm/LocationForm";

// /app/listings/new
// No listingId → ListingForm renders in create mode
export default function NewListingPage() {
  return <ListingForm />;
}