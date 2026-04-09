import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// route to delete just the thumbnail from db (hanlded differently than other images)
export async function DELETE( _req: NextRequest,  { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await prisma.listingImage.deleteMany({
    where: { listingId: Number(id), isThumbnail: true },
  });

  return new NextResponse(null, { status: 204 });
}