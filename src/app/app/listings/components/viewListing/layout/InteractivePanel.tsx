// component to handle all interactive elements that a user can do within a specicc listing page e.g apply, see reviews ec (links to other pages)
'use client'
import { useRouter } from "next/navigation";
import ReviewSlider from "../UI/ReviewSlider";
import { Review } from "@prisma/client";

type InteractivePanelProps = {
  listingId: string;
  userId: string;// replace this with the token to see if it's a landlord or consultant or moderator etc.
};

export default function InteractivePanel({ listingId, userId }: InteractivePanelProps) {
  const router = useRouter();
  // Mock data — replace with db fetch via listingId
  const totalReviews = 12;
  const averageRating = 5;
  const isConsultant = false;// place holder, replace this with some token logic
  const isLandlord = !isConsultant;// also place holder, we willderive this from token
  const reviews: Review[] = [
    { id: 1, listingId: null, rating: 5, comment: "Great place!", createdAt: new Date(), authorId: 1, targetUserId: 2 },
    { id: 2, listingId: null, rating: 4, comment: "Really enjoyed it.", createdAt: new Date(), authorId: 2, targetUserId: 2 },
    { id: 3, listingId: null, rating: 5, comment: "Perfect for short stays.", createdAt: new Date(), authorId: 3, targetUserId: 2 },
  ];

  return (
    <aside className="flex flex-col gap-6 w-full h-full bg-white/[0.05] rounded-[1.5rem] py-6 px-6">
      {/* Apply + message landlord */}
      <div className="flex-1 flex flex-col gap-6 items-center justify-center">
        
        {isConsultant && (
          <>
            <button className="w-full py-6 rounded-2xl bg-primary text-black text-lg font-semibold hover:brightness-110 transition"
             onClick={()=>router.push('/app/applications/submit-application')}>
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

        {isLandlord && (
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