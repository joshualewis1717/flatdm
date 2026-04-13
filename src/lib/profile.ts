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
  description: string | null;
  bio: string | null;
  stats: {
    applications: number;
    listings: number;
    properties: number;
    unreadMessages: number;
    reviews: number;
    averageReview: number | null;
    reports: number;
    reportsInProcess: number;
    unopenedReports: number;
    totalReportsHandled: number;
    rentalHistory: number;
  };
};

export async function getProfilePageData(userId: number): Promise<ProfilePageData | null> {
  const [user, unreadMessages, reviewAggregate, reportsInProcess, unopenedReports, totalReportsHandled] = await Promise.all([
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
            description:true,
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
    prisma.review.aggregate({
      where: {
        targetUserId: userId,
        isDeleted: false,
      },
      _avg: {
        rating: true,
      },
    }),
    prisma.report.count({
      where: {
        assignedModeratorId: userId,
        status: "UNDER_REVIEW",
      },
    }),
    prisma.report.count({
      where: {
        status: "OPEN",
      },
    }),
    prisma.report.count({
      where: {
        assignedModeratorId: userId,
        status: "RESOLVED",
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
    description: user.profile?.description ?? null,
    bio: user.profile?.bio ?? null,
    stats: {
      applications: user._count.applications,
      listings: user._count.listings,
      properties: user._count.properties,
      unreadMessages,
      reviews: user._count.reviewsReceived,
      averageReview: reviewAggregate._avg.rating ?? null,
      reports: user._count.reportsMade,
      reportsInProcess,
      unopenedReports,
      totalReportsHandled,
      rentalHistory: user._count.occupants,
    },
  };
}
