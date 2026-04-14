"use client";

import ErrorMessage from "@/components/shared/ErrorMessage";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Parameters = {
  receiverId: number;
  className?: string;
};

export default function RequestButton({receiverId, className}: Parameters) {
  const  [error, setError] = useState<string | null>(null)
  const handleCreateRequest = async () => {
    try {
      setError(null)
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
      if (error instanceof Error) {
        console.error(error);
        setError(error.message);
      }

    }
  };

  return (
    <>
    <div className="flex gap-2">
      <Button
        type="button"
        onClick={handleCreateRequest}
        className={className}
      >
        Send Request
      </Button>

      {error && (
        <ErrorMessage text={error} />
      )}
    </div>
    </>
  );
}