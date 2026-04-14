import { NextRequest, NextResponse } from "next/server";

const ORS_BASE_URL = "https://api.openrouteservice.org";
const FALLBACK_SIZE = 4;

type ORSFeature = {
  properties?: { label?: unknown };
  geometry?: { coordinates?: unknown };
};

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.ORS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "ORS_API_KEY is missing on server" }, { status: 500 });
    }

    const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    const sizeParam = Number(request.nextUrl.searchParams.get("size"));
    const size = Number.isInteger(sizeParam)
      ? Math.min(Math.max(sizeParam, 1), 10)
      : FALLBACK_SIZE;

    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const orsUrl = new URL(`${ORS_BASE_URL}/geocode/autocomplete`);
    orsUrl.searchParams.set("text", query);
    orsUrl.searchParams.set("size", String(size));

    const response = await fetch(orsUrl.toString(), {
      headers: {
        Authorization: apiKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      const detail = errorText || response.statusText;
      return NextResponse.json(
        { error: `ORS suggestion request failed: ${detail}` },
        { status: response.status }
      );
    }

    const data = (await response.json()) as { features?: unknown };
    const features: ORSFeature[] = Array.isArray(data?.features)
      ? (data.features as ORSFeature[])
      : [];

    const suggestions = features
      .flatMap((feature) => {
        const label = feature?.properties?.label;
        const coordinates = feature?.geometry?.coordinates;

        if (typeof label !== "string" || !Array.isArray(coordinates) || coordinates.length < 2) {
          return [];
        }

        const long = Number(coordinates[0]);
        const lat = Number(coordinates[1]);

        if (!Number.isFinite(lat) || !Number.isFinite(long)) {
          return [];
        }

        return [{ id: `${label}-${lat}-${long}`, label, lat, long }];
      })
      .slice(0, size);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error in location suggestions route:", error);
    return NextResponse.json({ error: "Failed to load location suggestions" }, { status: 500 });
  }
}
