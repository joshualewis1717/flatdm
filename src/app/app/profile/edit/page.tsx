import Link from "next/link";
import { ArrowLeft, PencilLine } from "lucide-react";

import { Button } from "@/components/ui/button";

const fieldLabels: Record<string, string> = {
  fullName: "full name",
  username: "username",
  email: "email",
  phone: "phone number",
  bio: "bio",
};

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ field?: string }>;
}) {
  const { field } = await searchParams;
  const label = field ? fieldLabels[field] ?? "profile details" : "profile details";

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">Edit profile</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Update your {label}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
          This is the edit hub for profile fields. The buttons from your profile now route here so we can add field-specific forms next without changing the profile layout again.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-2xl px-5">
            <Link href="/app/profile">
              <ArrowLeft />
              Back to profile
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-2xl border-white/12 bg-white/[0.03] px-5 text-white hover:bg-white/[0.06]">
            <Link href="/app/profile/edit">
              <PencilLine />
              Edit another field
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
