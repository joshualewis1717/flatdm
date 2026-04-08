import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


// function to getand serve a specific image from db
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const image = await prisma.listingImage.findUnique({
    where: { id: Number(id) },
    select: { data: true, mimeType: true },
  });

  if (!image) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(image.data, {
    headers: {
      "Content-Type": image.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}



// route to delete an image (non thumbnail) from db
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await prisma.listingImage.delete({
    where: { id: Number(id) },
  });

  return new NextResponse(null, { status: 204 });
}