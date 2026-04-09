"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bath, BedDouble, CalendarDays, Clock3, Home, ImageIcon, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import SearchAndFilterPanel from "./components/SearchAndFilterPanel";
import { getAllListings } from "./logic/clientServices/prisma";
import { useListingsState } from "./state/ListingsStateProvider";

type ListingsData = Awaited<ReturnType<typeof getAllListings>>;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

function getSharedLabel(maxOccupants: number) {
  if (maxOccupants > 1) {
    return `Shared, ${maxOccupants}`;
  }

  return "Private";
}

function PaginationBar() {
  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled
          className="inline-flex h-9 w-24 items-center justify-center rounded-xl border border-white/10 bg-white/3 text-sm font-medium text-white/35 cursor-not-allowed"
        >
          Previous
        </button>

        <div className="relative">
          <select
            aria-label="Select page"
            defaultValue="1"
            className="h-9 min-w-20 cursor-pointer appearance-none rounded-xl border border-white/10 bg-[#1e1e1e] px-3.5 pr-9 text-sm text-white outline-none transition-colors hover:border-white/20 focus:border-[#c9fb00]"
          >
            <option value="1">Page 1</option>
            <option value="2">Page 2</option>
            <option value="3">Page 3</option>
            <option value="4">Page 4</option>
            <option value="5">Page 5</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/45">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex h-9 w-24 items-center justify-center rounded-xl border border-[#c9fb00]/25 bg-[#c9fb00]/10 text-sm font-medium text-[#c9fb00] transition-colors hover:bg-[#c9fb00]/15 cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  const [listings, setListings] = useState<ListingsData>([]);
  const router = useRouter();

  const { listingParameters } = useListingsState();

  useEffect(() => {
    const loadListings = async () => {
      const data = await getAllListings();
      setListings(data ?? []);
    };

    loadListings();
  }, [listingParameters]);

  return (
    <div className="space-y-6 pb-10">
      <SearchAndFilterPanel />
      <PaginationBar />

      {listings.length === 0 ? (
        <Card className="border border-white/10 bg-[#242424] px-5 py-6 text-white/60">
          No listings found.
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const headline = listing.flatNumber ? `Flat ${listing.flatNumber}` : `Listing ${listing.id}`;
            const isAvailableNow = listing.availableFrom <= new Date();
            const thumbnail =
              listing.images.find((image) => image.isThumbnail) ?? listing.images[0] ?? null;
            const listingUrl = `listings/${listing.id}`;
            const nearbyAmenities = listing.property.amenities.slice(0, 3);
            const area = (listing as { area?: number }).area;

            return (
              <Card
                key={listing.id}
                tabIndex={0}
                role="link"
                aria-label={`Open ${headline}`}
                onClick={() => router.push(listingUrl)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(listingUrl);
                  }
                }}
                className="group cursor-pointer border border-white/10 bg-[#242424] p-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c9fb00]/30 hover:shadow-[0_18px_50px_rgba(0,0,0,0.28)] focus-visible:border-[#c9fb00] focus-visible:outline-none"
              >
                <div className="flex flex-col overflow-hidden md:flex-row">
                  <div className="relative min-h-48 w-full shrink-0 overflow-hidden border-b border-white/8 bg-[#1c1c1c] md:h-auto md:w-65 md:border-b-0 md:border-r md:border-white/8">
                    {thumbnail?.url ? (
                      <img
                        src={thumbnail.url}
                        alt={headline}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full min-h-48 w-full items-center justify-center bg-[linear-gradient(135deg,rgba(201,251,0,0.18),rgba(255,255,255,0.03))] text-white/45">
                        <div className="flex flex-col items-center gap-2">
                          <ImageIcon className="h-7 w-7 text-[#c9fb00]" />
                          <span className="text-xs uppercase tracking-[0.2em]">No image</span>
                        </div>
                      </div>
                    )}

                    <div className="absolute left-3 top-3 rounded-full border border-[#c9fb00]/25 bg-[#111111]/70 px-2.5 py-1 text-[11px] font-semibold text-[#c9fb00] backdrop-blur">
                      {isAvailableNow ? "Available" : "Upcoming"}
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
                          <Home className="h-3.5 w-3.5 text-[#c9fb00]" />
                          Result #{listing.id}
                        </div>
                        <h3 className="mt-2 truncate text-[17px] font-semibold text-white">
                          {headline}
                        </h3>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-semibold text-[#c9fb00]">
                          {formatCurrency(listing.rent)}
                        </div>
                        <div className="text-xs text-white/45">per month</div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/45">
                      <span className="flex items-center gap-1.5 text-white/70">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Available {formatDate(listing.availableFrom)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5" />
                        Updated {formatDate(listing.updatedAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {getSharedLabel(listing.maxOccupants)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Home className="h-3.5 w-3.5" />
                        Area {typeof area === "number" ? `${area} m²` : "N/A"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 text-[12px] text-white/70 sm:grid-cols-3">
                      <div className="rounded-xl border border-white/8 bg-white/3 px-3 py-2">
                        <div className="flex items-center gap-1.5 text-white/45">
                          <BedDouble className="h-3.5 w-3.5 text-[#c9fb00]" />
                          Bedrooms
                        </div>
                        <div className="mt-1 font-medium text-white">{listing.bedrooms}</div>
                      </div>

                      <div className="rounded-xl border border-white/8 bg-white/3 px-3 py-2">
                        <div className="flex items-center gap-1.5 text-white/45">
                          <Bath className="h-3.5 w-3.5 text-[#c9fb00]" />
                          Bathrooms
                        </div>
                        <div className="mt-1 font-medium text-white">{listing.bathrooms}</div>
                      </div>

                      <div className="rounded-xl border border-white/8 bg-white/3 px-3 py-2">
                        <div className="flex items-center gap-1.5 text-white/45">
                          <Clock3 className="h-3.5 w-3.5 text-[#c9fb00]" />
                          Min stay
                        </div>
                        <div className="mt-1 font-medium text-white">{listing.minStay} months</div>
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-white/60">
                      {listing.description}
                    </p>

                    <div className="mt-4 rounded-xl border border-white/8 bg-white/3 px-3 py-2">
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-white/45">
                        <MapPin className="h-3.5 w-3.5 text-[#c9fb00]" />
                        Nearby amenities
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {nearbyAmenities.length > 0 ? (
                          nearbyAmenities.map((amenity) => (
                            <span
                              key={amenity.id}
                              className="rounded-full border border-white/10 bg-[#1c1c1c] px-2.5 py-1 text-[11px] text-white/70"
                            >
                              {amenity.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-white/45">No nearby amenities listed.</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white/35">
                      <span>Click to open listing</span>
                      <span>Listing #{listing.propertyId}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <PaginationBar />
    </div>
  );
}