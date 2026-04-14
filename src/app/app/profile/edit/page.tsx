import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import EditProfileForm from "@/app/app/profile/edit/edit-profile-form";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ErrorMessage from "@/components/shared/ErrorMessage";

const fieldLabels: Record<string, string> = {
  fullName: "full name",
  username: "username",
  email: "email",
  phone: "phone number",
  description: "description",
  bio: "bio",
};

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ field?: string }>;
}) {
  const session = await auth();
  const { field } = await searchParams;

  if (!session?.user?.id) {
    notFound();
  }
  let user;

  try {
    user = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
      select: {
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        profile: {
          select: {
            phone: true,
            description: true,
            bio: true,
          },
        },
      },
    });
  } catch(err) {
      return <ErrorMessage text="Database error" />;
  }

  if (!user) {
    notFound();
  }

  const label = field ? fieldLabels[field] ?? "profile details" : "profile details";

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary/85">Edit profile</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Update your {label}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
          Keep your core account details current so your profile, sidebar identity card, and trust signals stay accurate across the app.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="outline" className="rounded-2xl border-white/12 bg-white/[0.03] px-5 text-white hover:bg-white/[0.06]">
            <Link href="/app/profile">
              <ArrowLeft />
              Back to profile
            </Link>
          </Button>
          {/* <Button asChild size="lg" variant="outline" className="rounded-2xl border-white/12 bg-white/[0.03] px-5 text-white hover:bg-white/[0.06]">
            <Link href="/app/profile/edit">
              <PencilLine />
              Edit another field
            </Link>
          </Button> */}
        </div>

        <EditProfileForm
          initialValues={{
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            phone: user.profile?.phone ?? "",
            description: user.profile?.description ?? "",
            bio: user.profile?.bio ?? "",
          }}
          focusField={field}
        />
      </section>
    </div>
  );
}
