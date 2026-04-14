import "server-only";

import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const overviewRoles = ["CONSULTANT", "LANDLORD", "MODERATOR"] as const;

export type OverviewMetric = {
  key: string;
  label: string;
  value: number;
};

export type OverviewStats = {
  role: Role;
  metrics: [OverviewMetric, OverviewMetric];
};

export function isOverviewRole(value: string | undefined): value is Role {
  return overviewRoles.includes(value as Role);
}

async function countReceivedMessages(userId: number) {
  return prisma.message.count({
    where: {
      senderId: { not: userId },
      isDeleted: false,
      conversation: {
        OR: [
          { userAId: userId, isDeletedA: false },
          { userBId: userId, isDeletedB: false },
        ],
      },
    },
  });
}

export async function getOverviewStats({
  userId,
  role,
}: {
  userId: number;
  role: Role;
}): Promise<OverviewStats> {
  if (role === "LANDLORD") {
    const [liveListings, unreadMessages] = await Promise.all([
      prisma.propertyListing.count({
        where: {
          landlordId: userId,
          isDeleted: false,
        },
      }),
      countReceivedMessages(userId),
    ]);

    return {
      role,
      metrics: [
        { key: "liveListings", label: "Live listings", value: liveListings },
        { key: "unreadMessages", label: "Unread messages", value: unreadMessages },
      ],
    };
  }

  if (role === "MODERATOR") {
    const [activeReports, resolvedIssues] = await Promise.all([
      prisma.report.count({
        where: {
          status: { in: ["OPEN", "UNDER_REVIEW"] },
        },
      }),
      prisma.report.count({
        where: {
          assignedModeratorId: userId,
          status: "RESOLVED",
        },
      }),
    ]);

    return {
      role,
      metrics: [
        { key: "activeReports", label: "Reports", value: activeReports },
        { key: "resolvedIssues", label: "Resolved issues", value: resolvedIssues },
      ],
    };
  }

  const [activeApplications, unreadMessages] = await Promise.all([
    prisma.propertyApplication.count({
      where: {
        userId,
        status: { in: ["PENDING", "APPROVED"] },
        listing: {
          isDeleted: false,
        },
      },
    }),
    countReceivedMessages(userId),
  ]);

  return {
    role,
    metrics: [
      { key: "activeApplications", label: "Active applications", value: activeApplications },
      { key: "unreadMessages", label: "Unread messages", value: unreadMessages },
    ],
  };
}
