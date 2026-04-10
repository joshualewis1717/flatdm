import React, { useState } from "react";
import { deleteReviewById } from "@/app/app/reports/db_access";

type Props = {
  reviewId: string;
};

export function RemoveReviewButton({ reviewId }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
        await deleteReviewById(reviewId={reviewId});
    } catch (err) {
        console.error("Failed to delete review:", err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={`Remove review ${reviewId}`}
      style={{
        backgroundColor: "#dc2626", // red
        color: "white",
        border: "none",
        padding: "8px 12px",
        borderRadius: 6,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? "Removing…" : "Remove"}
    </button>
  );
}
