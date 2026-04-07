// component to handle all interactive elements that a user can do within a specicc listing page e.g apply, see reviews ec (links to other pages)
'use client'
import { useRouter } from "next/navigation";
import ReviewSlider from "../UI/ReviewSlider";
import { ListingReview} from "../../../types";
import { useSessionContext } from "@/components/shared/app-frame";
import { landlordOwnsListing } from "@/app/app/applications/prisma/clientServices";
import { useEffect, useState } from "react";

type InteractivePanelProps = {
  listingId: string;
};

export default function InteractivePanel({ listingId}: InteractivePanelProps) {
  const router = useRouter();
  // Mock data — replace with db fetch via listingId
  const {isConsultant, isLandlord} = useSessionContext();
  const [landlordIsOwner, setLandlordIsOwner] = useState<boolean>(false);
  const totalReviews = 12;
  const averageRating = 5;
  const reviews: ListingReview[] = [
    { id: 1, listingId: Number(listingId), rating: 5, comment: "Great place!", createdAt: new Date(), reviewerId: 1, username: "Alice" },
    { id: 2, listingId: Number(listingId), rating: 4, comment: "Really enjoyed it.", createdAt: new Date(), reviewerId: 2 , username: "Bob"},
    { id: 3, listingId: Number(listingId), rating: 5, comment: "Perfect for short stays.", createdAt: new Date(), reviewerId: 3, username: "Charlie" },
  ];


  // check if landlord owns the listing, if so, display edit button
  useEffect(()=>{
    async function checkLandlordOwnerShip(){
      const {result} = await landlordOwnsListing(Number(listingId));
      setLandlordIsOwner(result ?? false);
    }
    checkLandlordOwnerShip();
  }, [])

  return (
    <aside className="flex flex-col gap-6 w-full h-full bg-white/[0.05] rounded-[1.5rem] py-6 px-6">
      {/* Apply + message landlord */}
      <div className="flex-1 flex flex-col gap-6 items-center justify-center">
        
        {isConsultant && (
          <>
            <button className="w-full py-6 rounded-2xl bg-primary text-black text-lg font-semibold hover:brightness-110 transition"
             onClick={()=>router.push(`/app/applications/submit-application?listingId=${listingId}`)}>
            Apply Now {/* this button will need to use listingId to go to propery application page */}
            </button>

            <div className="flex flex-col items-center gap-1">
              <p className="text-sm text-white/50">Have questions?</p>
              <button className="text-sm text-white/60 hover:text-white underline underline-offset-4 transition">
                Message landlord
              </button>
            </div>
         </>
        )}

        {isLandlord &&  landlordIsOwner &&  (
           <button className="w-full py-6 rounded-2xl bg-primary text-black text-lg font-semibold hover:brightness-110 transition"
           onClick={()=>router.push('/app/listings/new')}>{/* pass in id so it can rehydrate the info with the listing info*/}
           Edit Listing
         </button>
        )}
      </div>

      {/* Reviews */}
      <h3 className="text-lg font-bold text-white/50 text-center">Reviews</h3>
      <ReviewSlider
        reviews={reviews}
        totalReviews={totalReviews}
        averageRating={averageRating}
      />
    </aside>
  );
}