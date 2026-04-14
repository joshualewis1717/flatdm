"use client";

import { useState } from "react";
import ReportButton from "@/app/app/reports/ReportButton";
import ReportPanel from "@/app/app/reports/ReportPanel";

type ReviewActionsProps = {
  reviewId: number;
  reviewerId: number;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
};

export default function ReviewActions({
  reviewId,
  reviewerId,
  size = "sm",
  className,
  variant = "outline",
}: ReviewActionsProps) {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <ReportPanel
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
        onError={setError}
        targetType="review"
        targetId={reviewId}
        targetUserId={reviewerId}
        title="Report review"
      />

      <ReportButton
        size={size}
        variant={variant}
        className={className}
        onClick={() => {
          setError(null);
          setIsReportOpen(true);
        }}
      />
    </>
  );
}