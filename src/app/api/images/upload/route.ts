import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// route to upload image to db
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const listingId = Number(formData.get("listingId"));
  const isThumbnail = formData.get("isThumbnail") === "true";
  const file = formData.get("file") as File | null;

  if (!file || !listingId) {
    return NextResponse.json({ error: "Missing file or listingId" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // clear existing thumbnail if replacing
  if (isThumbnail) {
    await prisma.listingImage.deleteMany({ where: { listingId, isThumbnail: true } });
  }

  const image = await prisma.listingImage.create({
    data: {
      listingId,
      isThumbnail,
      mimeType: file.type,
      data: buffer,
      sizeBytes: buffer.byteLength,
    },
  });

  return NextResponse.json({ id: image.id });
}