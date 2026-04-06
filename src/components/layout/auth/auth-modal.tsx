"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, SyntheticEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, X } from "lucide-react";

type AuthMode = "login" | "register";
type RegisterRole = "CONSULTANT" | "LANDLORD" | "MODERATOR";

type AuthFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  username: string;
  role: RegisterRole;
};

const initialFormState: AuthFormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  username: "",
  role: "CONSULTANT",
};

export default function AuthModal({
  visible,
  authMode,
  onClose,
  onModeChange,
}: {
  visible: boolean;
  authMode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
}) {
  const router = useRouter();

  const [formState, setFormState] = useState<AuthFormState>(() => ({ ...initialFormState }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const switchAuthMode = (mode: AuthMode) => {
    setError("");
    setFormState((current) => ({ ...initialFormState, ...current }));
    onModeChange(mode);
  };

  const updateField = <K extends keyof AuthFormState>(field: K, value: AuthFormState[K]) =>
    setFormState((current) => ({ ...initialFormState, ...current, [field]: value }));
  
  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
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
          role: formState.role,
        }),
      });

      if (!registerResponse.ok) {
        const payload = await registerResponse.json().catch(() => ({}));
        setError(payload?.error ?? "Unable to register");
        setIsSubmitting(false);
        return;
      }
    }

    const signInResult = await signIn("credentials", {
      email: formState.email,
      password: formState.password,
      redirect: false,
      callbackUrl: "/app",
    });

    setIsSubmitting(false);

    if (!signInResult || signInResult.error) {
      setError(
        authMode === "register"
          ? "Account created, but login failed. Please login manually."
          : "Invalid email or password"
      );
      return;
    }

    router.push("/app");
  }

  if (!visible) return null;

  //password validation
  const passwordHas2Numbers = (formState.password.match(/\d/g) || []).length >= 2;
  const passwordHasSpecialChar = /[!@#$%^&*(),.?":{}|<>£{}]/.test(formState.password);
  const passwordValid = formState.password.length >= 8 && passwordHas2Numbers && passwordHasSpecialChar;

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
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 tracking-[0.22em] text-muted-foreground transition hover:text-foreground"
              >
                <X />
              </button>
            </div>

          </CardHeader>

          <CardContent className="px-0 pb-0 pt-4">
            <div className="mb-6 grid grid-cols-2 rounded-2xl border border-border/70 bg-card/50 p-1">
              <button
                type="button"
                onClick={() => switchAuthMode("login")}
                className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                  authMode === "login"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => switchAuthMode("register")}
                className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                  authMode === "register"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Register
              </button>
            </div>

            {error ? (
                <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 mb-4">
                  {error}
                </p>
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
                    </div>
                  )}
                </div>
              ) : null}

              {authMode === "register" ? (
                <div className="space-y-2">
                  <label
                    htmlFor="auth-role"
                    className="text-sm font-medium text-foreground"
                  >
                    Role
                  </label>
                  <select
                    id="auth-role"
                    name="role"
                    value={formState.role ?? "CONSULTANT"}
                    onChange={(event) =>  updateField("role", event.target.value as RegisterRole)}
                    className={formInput}
                  >
                    <option value="CONSULTANT">Consultant</option>
                    <option value="LANDLORD">Landlord</option>
                    <option value="MODERATOR">Moderator</option>
                  </select>
                </div>
              ) : null}

              <Button type="submit" size="lg" disabled={isSubmitting || !passwordValid} className="h-12 w-full rounded-2xl text-sm font-semibold">
                {isSubmitting ? 
                  (authMode === "register" ? "Creating account..." : "Logging in...") 
                  :
                  (authMode === "register" ? "Register" : "Login")
                }
              </Button>
            </form>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
