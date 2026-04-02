// component to handle all interactive elements that a user can do within a specicc listing page e.g apply, see reviews ec (links to other pages)
'use client'
import ReviewSlider from "./ReviewSlider";

type InteractivePanelProps = {
  listingId: string;
};

export default function InteractivePanel({ listingId }: InteractivePanelProps) {
  // Mock data — replace with db fetch via listingId
  const totalReviews = 12;
  const averageRating = 5;
  const reviews = [
    { id: 1, user: "Alice", comment: "Great place!" },
    { id: 2, user: "Bob", comment: "Really enjoyed it." },
    { id: 3, user: "Charlie", comment: "Perfect for short stays." },
  ];

  return (
    <aside className="flex flex-col gap-6 w-full h-full bg-white/[0.05] rounded-[1.5rem] py-6 px-6">
      {/* Apply + message landlord */}
      <div className="flex-1 flex flex-col gap-6 items-center justify-center">
        <button className="w-full py-6 rounded-2xl bg-primary text-black text-lg font-semibold hover:brightness-110 transition">
          Apply Now
        </button>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm text-white/50">Have questions?</p>
          <button className="text-sm text-white/60 hover:text-white underline underline-offset-4 transition">
            Message landlord
          </button>
        </div>
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