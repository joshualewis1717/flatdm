"use client";

import { useState } from "react";
import type { RequestStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";

type Parameters = {
  receiverId: number;
  className?: string;
  initialStatus?: RequestStatus | null;
};

function getButtonCopy(status: RequestStatus | null) {
  if (status === "PENDING") return "Requested";
  if (status === "REJECTED") return "Rejected";
  return "Request message";
}

export default function RequestButton({
  receiverId,
  className,
  initialStatus = null,
}: Parameters) {
  const [status, setStatus] = useState<RequestStatus | null>(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateRequest = async () => {
    if (status === "PENDING" || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ receiverId }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error("Create request failed:", response.status, data);
        throw new Error(data?.error ?? `Failed to create request (${response.status})`);
      }

      setStatus("PENDING");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleCreateRequest}
      disabled={status === "PENDING" || isSubmitting}
      className={className}
    >
      {getButtonCopy(status)}
    </Button>
  );
}
