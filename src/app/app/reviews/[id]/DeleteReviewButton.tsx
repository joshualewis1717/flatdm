"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import ErrorMessage from "@/components/shared/ErrorMessage";
import { Button } from "@/components/ui/button";
import { deleteReview } from "./actions";
import { REVIEWS_DATABASE_ERROR_MESSAGE } from "@/lib/reviews";

type Props = {
  reviewId: number;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export default function DeleteReviewButton({ reviewId, size = "lg", className }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteReview(reviewId);
      setDone(true);
      setTimeout(() => router.push("/app/reviews"), 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : REVIEWS_DATABASE_ERROR_MESSAGE);
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-2 text-sm text-white/50">
        Deleted — redirecting…
      </span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {confirming ? (
        <div className="flex flex-wrap gap-2">
          <Button
            size={size}
            variant="destructive"
            className={`rounded-2xl px-5 ${className ?? ""}`}
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 />
            {deleting ? "Deleting…" : "Confirm delete"}
          </Button>
          <Button
            size={size}
            variant="outline"
            className={`rounded-2xl border-white/12 bg-white/[0.03] px-5 text-white hover:bg-white/[0.06] ${className ?? ""}`}
            onClick={() => setConfirming(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          size={size}
          variant="destructive"
          className={`rounded-2xl px-5 ${className ?? ""}`}
          onClick={() => setConfirming(true)}
        >
          <Trash2 />
          Delete review
        </Button>
      )}
      {error ? <ErrorMessage text={error} /> : null}
    </div>
  );
}
