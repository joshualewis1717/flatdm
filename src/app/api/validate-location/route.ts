import { NextRequest, NextResponse } from "next/server";

const ORS_BASE_URL = "https://api.openrouteservice.org";
const POSTCODES_IO_URL = "https://api.postcodes.io/postcodes";

/****************POSTCODE.IO **********/

// Source of truth for UK postcodes (ors is not reliable for this)
async function lookupPostcode(postcode: string) {
  const res = await fetch(
    `${POSTCODES_IO_URL}/${encodeURIComponent(postcode.replace(/\s+/g, ""))}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;

  const data = await res.json();
  if (data.status !== 200 || !data.result) return null;

  return data.result as {
    latitude: number;
    longitude: number;
    admin_district: string;
    admin_ward: string;
    parish: string;
    region: string;
  };
}

/********** ORS ****************/
// Only used for soft street presence check, not for lat/lng
async function geocodeStreet( apiKey: string, streetName: string, postcode: string): Promise<{ label: string; lat: number; lng: number } | null> {
  const url = new URL(`${ORS_BASE_URL}/geocode/search`);
  url.searchParams.set("text", `${streetName}, ${postcode}, UK`);
  url.searchParams.set("size", "10"); // grab a few results to increase match chance
  url.searchParams.set("boundary.country", "GB");

  const res = await fetch(url.toString(), {
    headers: { Authorization: apiKey },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = await res.json();
  const features = Array.isArray(data?.features) ? data.features : [];

  for (const f of features) {
    const coords = f?.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) continue;
    const lng = Number(coords[0]);
    const lat = Number(coords[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    return { label: f?.properties?.label ?? "", lat, lng };
  }

  return null;
}

/*********** helpers */

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

// Strip house numbers: "221B", "10-12", "Flat 3"
function stripHouseNumber(street: string) {
  return street
    .replace(/^(flat|apartment|unit|no\.?)\s*[\w-]+\s*/i, "")
    .replace(/^\s*[\d]+[a-z]?[-–]?[\d]*\s*/i, "")
    .trim();
}

// Remove common UK suffix words for fuzzy matching
function coreStreetName(street: string) {
  return normalize(stripHouseNumber(street))
    .replace(/\b(street|st|road|rd|avenue|ave|lane|ln|drive|dr|close|cl|court|ct|place|pl|way|grove|crescent|cres|terrace|terr|row|walk|gardens|garden|gdns?)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Haversine distance in metres
function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// City match against all available postcodes.io fields
function cityMatchesPostcodeData(city: string,postcodeResult: Awaited<ReturnType<typeof lookupPostcode>>) {
  if (!postcodeResult) return false;

  const needle = normalize(city);// try to see if user inputted city is valid or not
  const haystack = [postcodeResult.admin_district,   postcodeResult.admin_ward,   postcodeResult.parish,   postcodeResult.region, ]
    .filter(Boolean)
    .map(normalize);

  return haystack.some((h) => h.includes(needle) || needle.includes(h));
}


/************** Route logic ****************/

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.ORS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ORS_API_KEY missing" }, { status: 500 });
    }

    const params = request.nextUrl.searchParams;
    const city       = params.get("city")?.trim()        ?? "";
    const streetName = params.get("streetName")?.trim()  ?? "";
    const postcode   = params.get("postcode")?.trim()    ?? "";
    if (!postcode) {
      return NextResponse.json({ error: "postcode is required" }, { status: 400 });
    }

    //Validate postcode via postcodes.io

    const postcodeData = await lookupPostcode(postcode);

    if (!postcodeData) {
      return NextResponse.json(
        { valid: false, error: "location not found" },
        { status: 404 }
      );
    }

    const { latitude, longitude } = postcodeData;

    // City validation (soft validation)
    // Only reject if city was provided AND clearly doesn't match any known field

    // Only warn, don't fail
    if (city && !cityMatchesPostcodeData(city, postcodeData)) {
      console.warn("City mismatch ignored:", city, postcodeData);
    }

    // ── STEP 3: Street validation (soft — ORS proximity + name check)
    // Only reject if ORS returns something that is clearly in a different area.
    // If ORS returns nothing, we trust the postcode and pass.

    if (streetName) {
      const streetResult = await geocodeStreet(apiKey, streetName, postcode);

      if (streetResult) {
        // If ORS result is >5km from postcode centroid it's might be wrong, but first check edge case in case if street is very long
        const dist = distanceMeters(latitude, longitude, streetResult.lat, streetResult.lng);
        if (dist > 5000) {
          console.warn("Far distance, checking name match instead...");
          
          const inputCore  = coreStreetName(streetName);
          const labelCore  = coreStreetName(streetResult.label);

          const inputWords = new Set(inputCore.split(" ").filter(Boolean));
          const labelWords = labelCore.split(" ").filter(Boolean);
          const hasOverlap = labelWords.some((w) => inputWords.has(w));

          if (!hasOverlap) {
            return NextResponse.json(
              { valid: false, error: "location not found" },
              { status: 404 }
            );
          }
        }

        // Soft name check — only reject if the label clearly contains a different street
        const inputCore  = coreStreetName(streetName);
        const labelCore  = coreStreetName(streetResult.label);

        // If both cores are non-empty and share no words at all → likely wrong
        if (inputCore && labelCore) {
          const inputWords = new Set(inputCore.split(" ").filter(Boolean));
          const labelWords = labelCore.split(" ").filter(Boolean);
          const hasOverlap = labelWords.some((w) => inputWords.has(w));

          if (!hasOverlap) {
            return NextResponse.json(
              { valid: false, error: "location not found" },
              { status: 404 }
            );
          }
        }
      }
      // If streetResult is null ORS couldn't find it, trust the postcode anyway since UK addresses is unrieliable with ors
    }

    return NextResponse.json({ valid: true, lat: latitude, lng: longitude,});

  } catch (error) {
    console.error("Error in validate-location route:", error);
    return NextResponse.json({ error: "Failed to validate location" }, { status: 500 });
  }
}