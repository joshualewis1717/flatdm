"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || typeof token !== "string" || token.trim() === "") {
      setError("Reset token is missing from the link");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/magic-links/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error ?? "Unable to reset password");
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Unable to reset password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-card-foreground">Reset your password</h1>
          <p className="text-sm text-muted-foreground">
            Choose a new password for your account.
          </p>
        </div>

        {success ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-green-700">Your password has been reset successfully.</p>
            <Button asChild className="w-full">
              <Link href="/login">Return to login</Link>
            </Button>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {error ? 
              <div className="flex items-center gap-2 rounded-md border border-red-700 bg-red-400 p-2">
                <Info className="h-5 w-5 text-white" />
                <p className="text-sm text-white">{error}</p>
              </div>
            : null}

            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground" htmlFor="new-password">
                New password
              </label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground" htmlFor="confirm-password">
                Confirm password
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <Button className="w-full" disabled={submitting} type="submit">
              {submitting ? "Resetting..." : "Reset password"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
