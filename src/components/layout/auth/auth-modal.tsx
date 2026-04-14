"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, SyntheticEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, X } from "lucide-react";

type AuthMode = "login" | "register";
type RegisterRole = "CONSULTANT" | "LANDLORD";

type AuthFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
};

type NoticeState = {
  tone: "info" | "success";
  message: string;
  actionLink?: string;
  actionLabel?: string;
};

const initialFormState: AuthFormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  username: "",
};

function getRegisterRoleFromEmail(email: string): RegisterRole | null {
  const normalizedEmail = email.trim().toLowerCase();
  const [, domain = ""] = normalizedEmail.split("@");

  if (!domain) return null;

  return domain.split(".")[0] === "gmail" ? "CONSULTANT" : "LANDLORD";
}

function formatRegisterRole(role: RegisterRole | null) {
  if (role === "CONSULTANT") return "Consultant";
  if (role === "LANDLORD") return "Landlord";
  return null;
}

export default function AuthModal({
  visible,
  authMode,
  onClose,
}: {
  visible: boolean;
  authMode: AuthMode;
  onClose: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formState, setFormState] = useState<AuthFormState>(() => ({ ...initialFormState }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<NoticeState | null>(null);

  const updateField = <K extends keyof AuthFormState>(field: K, value: AuthFormState[K]) =>
    setFormState((current) => ({ ...initialFormState, ...current, [field]: value }));

  async function sendVerificationEmail(email: string) {
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
      setError(payload?.error ?? "Failed to send verification email");
      return false;
    }

    setNotice({
      tone: "info",
      message: payload?.message ?? "Verification email sent",
      actionLink: payload?.link,
      actionLabel: "verify this email",
    });
    return true;
  }

  async function sendPasswordResetEmail(email: string) {
    if (!email.trim()) {
      setError("Enter your email address first so we know where to send the reset link");
      return false;
    }

    setError("");
    setNotice(null);
    setIsSubmitting(true);

    const response = await fetch("/api/auth/magic-links/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        type: "PASSWORD_RESET",
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(payload?.error ?? "Failed to send password reset email");
      setIsSubmitting(false);
      return false;
    }

    setNotice({
      tone: "info",
      message: payload?.message ?? "If the account exists, a password reset email has been sent",
      actionLink: payload?.link,
      actionLabel: "reset your password",
    });
    setIsSubmitting(false);
    return true;
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice(null);

    if (authMode === "register" && formState.password !== formState.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    if (authMode === "register") {
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formState.firstName,
          lastName: formState.lastName,
          username: formState.username,
          email: formState.email,
          password: formState.password,
        }),
      });

      if (!registerResponse.ok) {
        const payload = await registerResponse.json().catch(() => ({}));
        setError(payload?.error ?? "Unable to register");
        setIsSubmitting(false);
        return;
      }

      const payload = await registerResponse.json().catch(() => ({}));
      setNotice({
        tone: "success",
        message: payload?.verificationEmailSent === false
          ? "Account created. Verification email could not be sent automatically, so use resend below before signing in."
          : "Account created. Check your inbox and verify your email before accessing the app.",
        actionLink: payload?.verificationLink,
        actionLabel: "verify this email",
      });
      setFormState((current) => ({
        ...current,
        password: "",
        confirmPassword: "",
      }));
      setIsSubmitting(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email: formState.email,
      password: formState.password,
      redirect: false,
      callbackUrl: "/app",
    });

    setIsSubmitting(false);

    if (!signInResult || signInResult.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/app");
  }

  if (!visible) return null;

  const verified = searchParams.get("verified");
  const verifiedReason = searchParams.get("reason");
  const loginNotice: NoticeState | null = authMode === "login"
    ? verified === "1"
      ? { tone: "success" as const, message: "Email verified. You can log in and access your account now." }
      : verified === "0"
        ? {
            tone: "info" as const,
            message: verifiedReason === "expired"
              ? "That verification link has expired. Log in and request a new one."
              : verifiedReason === "used"
                ? "That verification link has already been used. Try logging in."
                : "That verification link is no longer valid. Log in and request a new one.",
          }
        : null
    : null;
  const activeNotice = notice ?? loginNotice;

  //password validation
  const passwordHas2Numbers = (formState.password.match(/\d/g) || []).length >= 2;
  const passwordHasSpecialChar = /[!@#$%^&*(),.?":{}|<>£{}]/.test(formState.password);
  const passwordsMatch = formState.password === formState.confirmPassword;
  const passwordValid = formState.password.length >= 8 && passwordHas2Numbers && passwordHasSpecialChar && passwordsMatch;

  const inferredRegisterRole = getRegisterRoleFromEmail(formState.email);

  //just a few tailwind string classes that are reusable and got a lil long
  const formInput: string = "h-12 w-full rounded-2xl border border-border/80 bg-card/70 px-4 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      <Card className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-[2rem] border border-border/80 bg-card/65 py-0 shadow-2xl shadow-black/30 backdrop-blur-2xl">
        <div className="relative px-6 pb-6 pt-6 md:px-8 md:pb-8 md:pt-8">
          <CardHeader className="space-y-6 px-0 pb-2 pt-0">
            <div className="flex items-start justify-between gap-4">
              <div className="inline-flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="Flat DM logo"
                  width={48}
                  height={48}
                  className="rounded-2xl border border-border/80 bg-background/80 p-1"
                />
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-primary">
                    Flat DM
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Focused rental workflow
                  </p>
                </div>
              </div>
              <Link
                href="/"
                className="px-3 py-1 tracking-[0.22em] text-muted-foreground transition hover:text-foreground"
                aria-label="Close authentication modal"
              >
                <X />
              </Link>
            </div>

          </CardHeader>

          <CardContent className="px-0 pb-0 pt-4">
            <div className="mb-6 grid grid-cols-2 rounded-2xl border border-border/70 bg-card/50 p-1">
              <Link
                href="/login"
                className={`block w-full rounded-xl px-4 py-3 text-center text-sm font-medium transition ${
                  authMode === "login"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={`block w-full rounded-xl px-4 py-3 text-center text-sm font-medium transition ${
                  authMode === "register"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Register
              </Link>
            </div>

            {error ? (
              <p className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            {activeNotice ? (
              <div className={`mb-4 rounded-2xl px-4 py-3 text-sm ${
                activeNotice.tone === "success"
                  ? "border border-green-500/30 bg-green-500/10 text-green-100"
                  : "border border-primary/20 bg-primary/10 text-foreground"
              }`}>
                <p>{activeNotice.message}</p>
                {activeNotice.actionLink ? (
                  <p className="mt-2">
                    For demonstration purposes only here is the link sent by email:{" "}
                    <Link href={activeNotice.actionLink} className="underline underline-offset-4">
                      {activeNotice.actionLabel ?? "open link"}
                    </Link>
                  </p>
                ) : null}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              {authMode === "register" ? (
                <div className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="auth-first-name"
                        className="text-sm font-medium text-foreground"
                      >
                        First Name
                      </label>
                      <input
                        id="auth-first-name"
                        name="firstName"
                        type="text"
                        required
                        value={formState.firstName ?? ""}
                        onChange={(event) =>
                          updateField("firstName", event.target.value)
                        }
                        className={formInput}
                        placeholder="First name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="auth-last-name"
                        className="text-sm font-medium text-foreground"
                      >
                        Last Name
                      </label>
                      <input
                        id="auth-last-name"
                        name="lastName"
                        type="text"
                        required
                        value={formState.lastName ?? ""}
                        onChange={(event) =>
                          updateField("lastName", event.target.value)
                        }
                        className={formInput}
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="auth-username"
                      className="text-sm font-medium text-foreground"
                    >
                      Username
                    </label>
                    <input
                      id="auth-username"
                      name="username"
                      type="text"
                      required
                      value={formState.username ?? ""}
                      onChange={(event) =>
                        updateField("username", event.target.value)
                      }
                      className={formInput}
                      placeholder="Choose a username"
                    />
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <label
                  htmlFor="auth-email"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  required
                  value={formState.email ?? ""}
                  onChange={(event) => updateField("email", event.target.value)}
                  className={formInput}
                  placeholder="name@example.com"
                />
              </div>

              {authMode === "register" && inferredRegisterRole ? (
                <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
                    {inferredRegisterRole === "CONSULTANT" ? "FDM address" : "Non-FDM address"}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    Registering as a {formatRegisterRole(inferredRegisterRole)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please note for demonstration purposes, we pretend gmail addresses are of the FDM domain.
                  </p>
                </div>
              ) : null}

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="auth-password"
                    className="text-sm font-medium text-foreground"
                  >
                    Password
                  </label>
                </div>
                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  minLength={authMode === "register" ? 8 : undefined}
                  required
                  value={formState.password ?? ""}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  className={formInput}
                  placeholder={
                    authMode === "register"
                      ? "Minimum 8 characters"
                      : "Enter your password"
                  }
                />
              </div>

              {authMode === "login" ? (
                <div className="-mt-2 flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-primary transition hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => sendPasswordResetEmail(formState.email)}
                    disabled={isSubmitting}
                  >
                    Forgot password?
                  </button>
                </div>
              ) : null}

              {authMode === "register" ? (
                <div className="space-y-2">
                  <label
                    htmlFor="auth-confirm-password"
                    className="text-sm font-medium text-foreground"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="auth-confirm-password"
                    name="confirmPassword"
                    type="password"
                    minLength={8}
                    required
                    value={formState.confirmPassword ?? ""}
                    onChange={(event) =>
                      updateField("confirmPassword", event.target.value)
                    }
                    className={formInput}
                    placeholder="Re-enter your password"
                  />
                </div>
              ) : null}

              {authMode === "register" ? (
                <div className="space-y-2">
                  {formState.password && (
                    <div className="">
                      <div className="mb-1 flex items-center gap-2">
                        {formState.password.length >= 8 ? <Check className="text-green-500 w-4 h-4" /> : <X className="text-red-500 w-4 h-4"/>}
                        <p className={"text-sm" + (formState.password.length >= 8 ? "text-green-500" : "text-red-500")}>
                          Password must be at least 8 characters long.
                        </p>
                      </div>
                      
                      <div className="mb-1 flex items-center gap-2">
                        {passwordHas2Numbers ? <Check className="text-green-500 w-4 h-4" /> : <X className="text-red-500 w-4 h-4"/>}
                        <p className={"text-sm" + (passwordHas2Numbers ? "text-green-500" : "text-red-500")}>
                          Password must contain at least 2 numbers.
                        </p>
                      </div>

                      <div className="mb-1 flex items-center gap-2">
                        {passwordHasSpecialChar ? <Check className="text-green-500 w-4 h-4" /> : <X className="text-red-500 w-4 h-4"/>}
                        <p className={"text-sm" + (passwordHasSpecialChar ? "text-green-500" : "text-red-500")}>
                          Password must contain at least 1 special character.
                        </p>
                      </div>

                      <div className="mb-1 flex items-center gap-2">
                        {passwordsMatch ? <Check className="text-green-500 w-4 h-4" /> : <X className="text-red-500 w-4 h-4"/>}
                        <p className={"text-sm" + (passwordsMatch ? "text-green-500" : "text-red-500")}>
                          Passwords must match.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              <Button type="submit" size="lg" disabled={isSubmitting || (!passwordValid && authMode === "register")} className="h-12 w-full rounded-2xl text-sm font-semibold">
                {isSubmitting ? 
                  (authMode === "register" ? "Creating account..." : "Logging in...") 
                  :
                  (authMode === "register" ? "Register" : "Login")
                }
              </Button>

              {authMode === "register" && notice ? (
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-2xl text-sm font-semibold"
                  onClick={() => sendVerificationEmail(formState.email)}
                  disabled={isSubmitting || !formState.email}
                >
                  Resend verification email
                </Button>
              ) : null}
            </form>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
