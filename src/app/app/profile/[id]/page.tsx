import { notFound } from "next/navigation";
import type { RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import ErrorMessage from "@/components/shared/ErrorMessage";
import ProfileView from "@/components/shared/profile-view";
import { auth } from "@/lib/auth";
import { getProfilePageData, PROFILE_DATABASE_ERROR_MESSAGE } from "@/lib/profile";

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

  let profile = null;
  let conversation: { id: number } | null = null;
  let latestRequest: { status: RequestStatus } | null = null;

  try {
    profile = await getProfilePageData(profileId);

    if (profile) {
      [conversation, latestRequest] = await Promise.all([
        prisma.conversation.findFirst({
          where: {
            OR: [
              { userAId: viewerId, userBId: profileId },
              { userAId: profileId, userBId: viewerId },
            ],
          },
          select: { id: true },
        }),
        viewerId === profileId
          ? Promise.resolve(null)
          : prisma.messageRequest.findFirst({
              where: {
                senderId: viewerId,
                receiverId: profileId,
              },
              orderBy: {
                modifiedAt: "desc",
              },
              select: {
                status: true,
              },
            }),
      ]);
    }
  } catch {
    return <ErrorMessage text={PROFILE_DATABASE_ERROR_MESSAGE} />;
  }

  if (!profile) {
    notFound();
  }

  const requestStatus: RequestStatus | null = latestRequest?.status ?? null;

  return (
    <ProfileView
      profile={profile}
      isOwnProfile={viewerId === profileId}
      hasExistingConversation={!!conversation}
      requestStatus={requestStatus}
    />
  );
}
