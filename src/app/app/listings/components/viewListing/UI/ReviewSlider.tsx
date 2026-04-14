'use client'
import { useState } from "react";
import StarRating from "./StarRating";
import { ListingReview } from "../../../types";
// component to display some reviews within a looping list

type ReviewCarouselProps = {
  reviews: ListingReview[];
  totalReviews: number;
  averageRating?: number;
};

export default function ReviewSlider({
  reviews, totalReviews, averageRating = 5,}: ReviewCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (reviews.length === 0) {
    return <p className="text-sm text-white/50">No reviews yet.</p>;
  }

  // loop back for when we reach beggining/ end
  const prevReview = () =>
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  const nextReview = () =>
    setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));

  return (
    <section className="flex-1 flex flex-col bg-white/[0.03] border border-white/10 rounded-[1.5rem] p-4 space-y-3">
      <StarRating rating={averageRating} totalReviews={totalReviews} />

      {/* Current review */}
      <div className="flex-1 flex flex-col justify-center items-start border-t border-white/10 pt-3">
        <p className="text-sm text-white/70 font-medium">
          {reviews[currentIndex].username}{/* back end service route to derive user from this */}
        </p>
        <p className="text-sm text-white/50 mt-1">
          {reviews[currentIndex].comment}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-2">
        <button
          onClick={prevReview}
          className="px-4 py-2 bg-white/10 rounded-lg text-white/70 hover:bg-white/20 transition"
        >
          Prev
        </button>
        <span className="text-xs text-white/30 self-center">
          {currentIndex + 1} / {reviews.length}
        </span>
        <button
          onClick={nextReview}
          className="px-4 py-2 bg-white/10 rounded-lg text-white/70 hover:bg-white/20 transition"
        >
          Next
        </button>
      </div>
    </section>
  );
}