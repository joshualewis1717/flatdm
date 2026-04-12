import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OffenceSeverity, ReportCategory, ReportStatus } from "@prisma/client";

const jsonError = (error: string, status: number) => NextResponse.json({ error }, { status });

type ReportTargetType = "conversation" | "listing" | "review";

type ResolvedReportTarget = {
  conversationId: number | null;
  listingId: number | null;
  reviewId: number | null;
  targetUserId: number | null;
};

async function getUserId() {
  const session = await auth();
  const userId = Number(session?.user?.id);

  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

async function resolveConversationTarget( userId: number, targetId: number): Promise<ResolvedReportTarget> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: targetId },
    select: {
      id: true,
      userAId: true,
      userBId: true,
      isDeletedA: true,
      isDeletedB: true,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const isUserA = conversation.userAId === userId;
  const isUserB = conversation.userBId === userId;

  if (!isUserA && !isUserB) {
    throw new Error("Forbidden");
  }

  if ((isUserA && conversation.isDeletedA) || (isUserB && conversation.isDeletedB)) {
    throw new Error("Conversation not available");
  }

  return {
    conversationId: conversation.id,
    listingId: null,
    reviewId: null,
    targetUserId: isUserA ? conversation.userBId : conversation.userAId,
  };
}

async function resolveListingTarget(targetId: number,providedTargetUserId: number | null): Promise<ResolvedReportTarget> {
  const listing = await prisma.propertyListing.findUnique({  
    where: { id: targetId },
    select: { id: true },
  });

  if (!listing) throw new Error("Listing not found"); 

  return {
    conversationId: null,
    listingId: targetId, 
    reviewId: null,
    targetUserId: providedTargetUserId,
  };
}

async function resolveReviewTarget( userId: number, targetId: number, providedTargetUserId: number | null): Promise<ResolvedReportTarget> {
  return {
    conversationId: null,
    listingId: null,
    reviewId: null,
    targetUserId: providedTargetUserId,
  };
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return jsonError("Unauthorized", 401);

    const body = await req.json();

    const category = body.category as ReportCategory | undefined;
    const severity = body.severity as OffenceSeverity | undefined;

    const description = typeof body.description === "string" ? body.description.trim() : "";

    const targetType = body.targetType as ReportTargetType | undefined;
    const targetId = Number(body.targetId);
    const providedTargetUserId = body.targetUserId == null ? null : Number(body.targetUserId);

    const reason = typeof body.reason === "string" ? body.reason.trim() : "";

    if (!category || !Object.values(ReportCategory).includes(category)) {
      return jsonError("Invalid category", 400);
    }

    if (!severity || !Object.values(OffenceSeverity).includes(severity)) {
      return jsonError("Invalid severity", 400);
    }

    if (!targetType || !["conversation", "listing", "review"].includes(targetType)) {
      return jsonError("Invalid targetType", 400);
    }

    if (!Number.isInteger(targetId)) {
      return jsonError("Invalid targetId", 400);
    }

    if (!reason) {
      return jsonError("Invalid reason", 400);
    }

    let resolvedTarget: ResolvedReportTarget;

    if (targetType === "conversation") {
      resolvedTarget = await resolveConversationTarget(userId, targetId);
    } else if (targetType === "listing") {
      resolvedTarget = await resolveListingTarget(targetId, providedTargetUserId);
    } else {
      resolvedTarget = await resolveReviewTarget(userId, targetId, providedTargetUserId);
    }

    const report = await prisma.report.create({
      data: {
        reporterId: userId,
        targetUserId: resolvedTarget.targetUserId ?? undefined,
        conversationId: resolvedTarget.conversationId,
        listingId: resolvedTarget.listingId,
        reviewId: resolvedTarget.reviewId,
        category,
        reason,
        description: description || null,
        status: ReportStatus.OPEN,
        assignedModeratorId: null,
        severity: severity,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      // conversation specific error messages  
      if (error.message === "Conversation not found") {
        return jsonError("Conversation not found", 404);
      }

      if (error.message === "Forbidden") {
        return jsonError("Forbidden", 403);
      }

      if (error.message === "Conversation not available") {
        return jsonError("Conversation not available", 404);
      }

      // listing specific error messages
      if (error.message === "Listing not found") {
        return jsonError("Listing not found", 404);
      }
    }

    return jsonError("Server error", 500);
  }
}