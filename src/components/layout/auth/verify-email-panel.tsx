"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type VerifyEmailPanelProps = {
  email: string;
  firstName?: string | null;
};

type ResendState = {
  error: string;
  message: string;
  verificationLink?: string;
};

export default function VerifyEmailPanel({ email, firstName }: VerifyEmailPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, setState] = useState<ResendState>({ error: "", message: "" });

  async function handleResend() {
    setIsSubmitting(true);
    setState({ error: "", message: "" });

    const response = await fetch("/api/auth/magic-links/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        type: "EMAIL_VERIFICATION",
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setState({
        error: payload?.error ?? "Failed to resend verification email",
        message: "",
      });
      setIsSubmitting(false);
      return;
    }

    setState({
      error: "",
      message: payload?.message ?? "Verification email sent",
      verificationLink: payload?.link,
    });
    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex min-h-[80vh] max-w-2xl items-center">
        <div className="w-full rounded-[2rem] border border-border/70 bg-card/70 p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">
            Email Verification Required
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            {firstName ? `Check your inbox, ${firstName}.` : "Check your inbox."}
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            You need to verify <span className="font-medium text-foreground">{email}</span> before you can access the app.
            Use the link we sent you, then come back here and open your account again.
          </p>

          {state.error ? (
            <p className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {state.error}
            </p>
          ) : null}

          {state.message ? (
            <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-foreground">
              <p>{state.message}</p>
              {state.verificationLink ? (
                <p className="mt-2">
                  Dev link:{" "}
                  <Link href={state.verificationLink} className="underline underline-offset-4">
                    verify this email
                  </Link>
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button type="button" size="lg" className="rounded-2xl" onClick={handleResend} disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Resend verification email"}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="rounded-2xl"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
