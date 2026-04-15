"use client";

import ErrorMessage from "@/components/shared/ErrorMessage";
import { useState } from "react";
import type { RequestStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Parameters = {
  receiverId: number;
  className?: string;
  initialStatus?: RequestStatus | null;
};

export default function RequestButton({
  receiverId,
  className,
  initialStatus = null,
}: Parameters) {
  const [status, setStatus] = useState<RequestStatus | null>(initialStatus);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null)


  const handleCreateRequest = async () => {
    if (isSending) return;
    setIsSending(true);


    try {
      setError(null)
      setIsSending(true);
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
      if (error instanceof Error) {
        console.error(error);
        setError(error.message);
      }

      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
    <div className="flex gap-2">
      <Button
        type="button"
        onClick={handleCreateRequest}
        disabled={isSending}
        className={className}> {/* Styling */}
          {isSending ? "Sending..." : "Send Request"}
      </Button>

      {error && (
        <ErrorMessage text={error} />
      )}
    </div>
    </>
  );
}
