import ListingForm from "../../components/createForm/ListingForm";

// page where landlord can edit ther existing listings
export default async function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  return <ListingForm listingId={Number(id)} />;
}