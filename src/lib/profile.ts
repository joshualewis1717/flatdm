import { prisma } from "@/lib/prisma";

export type ProfileRole = "CONSULTANT" | "LANDLORD" | "MODERATOR";

export type ProfilePageData = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: ProfileRole;
  createdAt: Date;
  phone: string | null;
  bio: string | null;
  stats: {
    applications: number;
    listings: number;
    properties: number;
    unreadMessages: number;
    reviews: number;
    reports: number;
    rentalHistory: number;
  };
};

export async function getProfilePageData(userId: number): Promise<ProfilePageData | null> {
  const [user, unreadMessages] = await Promise.all([
    prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            phone: true,
            bio: true,
          },
        },
        _count: {
          select: {
            applications: true,
            listings: true,
            properties: true,
            reviewsReceived: true,
            reportsMade: true,
            occupants: true,
          },
        },
      },
    }),
    prisma.message.count({
      where: {
        senderId: { not: userId },
        conversation: {
          OR: [{ userAId: userId }, { userBId: userId }],
        },
      },
    }),
  ]);

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role as ProfileRole,
    createdAt: user.createdAt,
    phone: user.profile?.phone ?? null,
    bio: user.profile?.bio ?? null,
    stats: {
      applications: user._count.applications,
      listings: user._count.listings,
      properties: user._count.properties,
      unreadMessages,
      reviews: user._count.reviewsReceived,
      reports: user._count.reportsMade,
      rentalHistory: user._count.occupants,
    },
  };
}
