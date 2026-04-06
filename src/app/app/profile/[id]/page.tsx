import { notFound } from "next/navigation";

import ProfileView from "@/components/shared/profile-view";
import { auth } from "@/lib/auth";
import { getProfilePageData } from "@/lib/profile";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    notFound();
  }

  const viewerId = Number(session.user.id);
  const profileId = Number(id);

  if (Number.isNaN(profileId)) {
    notFound();
  }

  const profile = await getProfilePageData(profileId);

  if (!profile) {
    notFound();
  }

  return <ProfileView profile={profile} isOwnProfile={viewerId === profileId} />;
}
