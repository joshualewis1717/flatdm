// component to handle all interactive elements that a user can do within a specicc listing page e.g apply, see reviews ec (links to other pages)
'use client'
import ReviewSlider from "../UI/ReviewSlider";
import { ListingReview} from "../../../types";
import { useSessionContext } from "@/components/shared/app-frame";
import { landlordOwnsListing } from "@/app/app/applications/prisma/clientServices";
import { useEffect, useState } from "react";
import { getLandlordFromListing } from "../../../prisma/clientServices";
import ErrorMessage from "@/components/shared/ErrorMessage";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ReportButton from "@/app/app/reports/ReportButton";
import ReportPanel from "@/app/app/reports/ReportPanel";
import Link from "next/link";

type InteractivePanelProps = {
  listingId: string;
  reviews:ListingReview[];
};

export default function InteractivePanel({ listingId, reviews}: InteractivePanelProps) {
  // Mock data — replace with db fetch via listingId
  const {isConsultant, isLandlord} = useSessionContext();
  const [landlordId, setLandlordId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [landlordIsOwner, setLandlordIsOwner] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false)
  // single loading flag covers both fetches — panel is ready once both resolve
  const [panelLoading, setPanelLoading] = useState(true);



  // run both fetches in parallel on mount.
  useEffect(() => {
    async function fetchPanelData() {
      setPanelLoading(true);

      // check if landlord owns the listing, if so, display edit button
      const [ownershipResult, landlordResult] = await Promise.all([
        landlordOwnsListing(Number(listingId)),
        getLandlordFromListing(Number(listingId)),
      ]);

      setLandlordIsOwner(ownershipResult.result ?? false);

      if (landlordResult.error) {
        setError(landlordResult.error);
      }
      if (landlordResult.result) {
        setLandlordId(landlordResult.result.landlord.id);
      }

      setPanelLoading(false);
    }

    fetchPanelData();
  }, [listingId]);

  return (
    <>
    {/* report panel in case if user wants to report listing */}
      <ReportPanel onOpenChange={setIsReportOpen} open={isReportOpen} targetType="listing" targetId={Number(listingId)} onError={setError}
      targetUserId={landlordId}/>

      <aside className="flex flex-col gap-6 w-full h-full bg-white/[0.05] rounded-[1.5rem] py-6 px-6">
        {/* small report button */}
        <div className="flex items-center gap-2 justify-between">
          <span className="text-xs text-white/30">Report this listing</span>
          <ReportButton
            onClick={() => {
              setError(null);
              setIsReportOpen(true);
            }}
          />
        </div>

        {/* Apply + message landlord */}
        <div className="flex-1 flex flex-col gap-6 items-center justify-center">

          {/* Loading state while ownership + landlord ID are being fetched */}
          {panelLoading && <LoadingSpinner text="Loading listing actions…" />}

          {/* Fetch error for landlord ID, shown inline so the rest of the panel still renders */}
          {!panelLoading && error && <ErrorMessage text={error} />}

          {!panelLoading && isConsultant && (
            <>
              <Link className="w-full py-6 rounded-2xl bg-primary text-black text-center text-lg font-semibold hover:brightness-110 transition"
              href={`/app/applications/submit-application?listingId=${listingId}`}>
              Apply Now {/* this button will need to use listingId to go to propery application page */}
              </Link>

              <Link
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-center text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.06]"
                href={`/app/reviews/new?listingId=${listingId}&from=/app/listings/${listingId}`}
              >
                Review this listing
              </Link>

              <div className="flex flex-col items-center gap-1">
                <p className="text-sm text-white/50">Have questions?</p>
                <Link className="text-sm text-white/60 hover:text-white underline underline-offset-4 transition"
                href={`/app/profile/${landlordId}`}>
                  Message landlord
                </Link>
              </div>
            </>
          )}

          {!panelLoading && isLandlord && landlordIsOwner && (
            <Link className="w-full py-6 text-center rounded-2xl bg-primary text-black text-lg font-semibold hover:brightness-110 transition"
            href={`/app/listings/edit/${listingId}`}>{/* pass in id so it can rehydrate the info with the listing info*/}
            Edit Listing
          </Link>
          )}
        </div>

        {/* Reviews */}
        <h3 className="text-lg font-bold text-white/50 text-center">Reviews</h3>
        <ReviewSlider
          reviews={reviews}
          totalReviews={reviews.length}
          averageRating={
            reviews.length > 0
              ? reviews.reduce((acc, r) => acc + (r.rating ?? 0), 0) / reviews.length
              : 0        
            }
          />
      </aside>
    </>
  );
}
