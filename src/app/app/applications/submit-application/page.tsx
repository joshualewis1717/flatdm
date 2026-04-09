'use client'
import ApplicationForm from "../components/Submitform/ApplicationForm";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get("listingId");

  return (
    <ApplicationForm listingId={listingId ? Number(listingId) : undefined} />
  );
}