"use client";

import { Button } from "@/components/ui/button";

type Parameters = {
  receiverId: number;
  className?: string;
};

export default function RequestButton({receiverId, className}: Parameters) {
  const handleCreateRequest = async () => {
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
    }
  };

  return (
    <Button
      type="button"
      onClick={handleCreateRequest}
      className={className}> {/* Styling */}
        Send Request
    </Button>
  );
}