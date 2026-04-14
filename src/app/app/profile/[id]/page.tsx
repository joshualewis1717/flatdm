import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
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

  const conversation = await prisma.conversation.findFirst({
  where: {
    OR: [
      { userAId: viewerId, userBId: profileId },
      { userAId: profileId, userBId: viewerId },
    ],
  },
    select: { id: true },
    });



  return <ProfileView profile={profile} isOwnProfile={viewerId === profileId} hasExistingConversation={!!conversation} viewerId={viewerId} />;
}
