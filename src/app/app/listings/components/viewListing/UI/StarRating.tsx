// generic component that displays review stars

import { Star } from "lucide-react";

type StarRatingProps = {
  rating?: number; // out of 5, defaults to 5
  totalReviews: number;
};

export default function StarRating({ rating = 5, totalReviews }: StarRatingProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={i < rating ? "text-primary" : "text-white/20"}
          fill={i < rating ? "currentColor" : "none"}
          size={16}
        />
      ))}
      <span className="text-xs text-white/50 ml-1">{totalReviews} reviews</span>
    </div>
  );
}