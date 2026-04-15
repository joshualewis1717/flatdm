import { notFound } from "next/navigation";

import ErrorMessage from "@/components/shared/ErrorMessage";
import ProfileView from "@/components/shared/profile-view";
import { auth } from "@/lib/auth";
import { getProfilePageData, PROFILE_DATABASE_ERROR_MESSAGE } from "@/lib/profile";

export default async function ProfilePage() {
  const session = await auth();
  let profile = null;

  if (!session?.user?.id) {
    notFound();
  }

  try {
    profile = await getProfilePageData(Number(session.user.id));
  } catch {
    return <ErrorMessage text={PROFILE_DATABASE_ERROR_MESSAGE} />;
  }

  if (!profile) {
    notFound();
  }

  return (
    <ProfileView
      profile={profile}
      isOwnProfile
      hasExistingConversation={false}
    />
  );
}
