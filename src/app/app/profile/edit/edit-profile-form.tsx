"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isValidPhoneNumber } from "react-phone-number-input";

import PhoneInputField from "@/app/app/applications/components/Submitform/UI/PhoneInputField";
import ErrorMessage from "@/components/shared/ErrorMessage";
import SuccessMessage from "@/components/shared/SuccessMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EditProfileFormProps = {
  initialValues: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone: string;
    description: string;
    bio: string;
  };
  focusField?: string;
};

export default function EditProfileForm({
  initialValues,
  focusField,
}: EditProfileFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  function updateField<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    setPhoneError(null);

    if (form.phone && !isValidPhoneNumber(form.phone)) {
      setPhoneError("Enter a valid phone number including the country code.");
      setIsSaving(false);
      return;
    }

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const payload = (await response.json()) as { success: boolean; error?: string };

    if (!response.ok || !payload.success) {
      setError(payload.error ?? "Failed to save profile changes.");
      setIsSaving(false);
      return;
    }

    setSuccess("Profile updated successfully.");
    setIsSaving(false);
    router.refresh();
    setTimeout(() => {
      router.push("/app/profile");
      router.refresh();
    }, 700);
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error ? <ErrorMessage text={error} /> : null}
      {success ? <SuccessMessage text={success} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.28em] text-white/45">First name</span>
          <Input
            value={form.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
            autoFocus={focusField === "fullName"}
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.28em] text-white/45">Last name</span>
          <Input
            value={form.lastName}
            onChange={(event) => updateField("lastName", event.target.value)}
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.28em] text-white/45">Username</span>
          <Input
            value={form.username}
            onChange={(event) => updateField("username", event.target.value)}
            autoFocus={focusField === "username"}
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.28em] text-white/45">Email</span>
          <Input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            autoFocus={focusField === "email"}
          />
        </label>

        <div className="space-y-2 sm:col-span-2">
          <PhoneInputField
            label="Phone"
            value={form.phone}
            onValueChange={(value) => {
              updateField("phone", value);
              if (phoneError) {
                setPhoneError(null);
              }
            }}
          />
          {phoneError ? <p className="text-sm text-red-400">{phoneError}</p> : null}
        </div>

        <label className="space-y-2 sm:col-span-2">
          <span className="text-xs uppercase tracking-[0.28em] text-white/45">Description</span>
          <Input
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            autoFocus={focusField === "description"}
          />
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="text-xs uppercase tracking-[0.28em] text-white/45">Bio</span>
          <textarea
            value={form.bio}
            onChange={(event) => updateField("bio", event.target.value)}
            autoFocus={focusField === "bio"}
            rows={7}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            placeholder="Write a short summary about yourself."
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" className="rounded-2xl px-5" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="rounded-2xl border-white/12 bg-white/[0.03] px-5 text-white hover:bg-white/[0.06]"
          onClick={() => router.push("/app/profile")}
          disabled={isSaving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
