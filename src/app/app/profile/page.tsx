import { notFound } from "next/navigation";

import ProfileView from "@/components/shared/profile-view";
import { auth } from "@/lib/auth";
import { getProfilePageData } from "@/lib/profile";

export default async function ProfilePage() {
  const session = await auth();


  if (!session?.user?.id) {
    notFound();
  }

  const profile = await getProfilePageData(Number(session.user.id));

  if (!profile) {
    notFound();
  }

  return <ProfileView profile={profile} isOwnProfile hasExistingConversation={false} />;
}
