"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

type Parameters = {
  receiverId: number;
  className?: string;
};

export default function RequestButton({receiverId, className}: Parameters) {
  const [isSending, setIsSending] = useState(false);
  const handleCreateRequest = async () => {
    if (isSending) return;
    setIsSending(true);
    try {
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
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleCreateRequest}
      disabled={isSending}
      className={className}> {/* Styling */}
        {isSending ? "Sending..." : "Send Request"}
    </Button>
  );
}