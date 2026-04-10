import Link from "next/link";
import { useMemo, useState } from "react";
import { Bath, BedDouble, CalendarDays, ChevronLeft, ChevronRight, Clock3, Home, ImageIcon, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

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

type ListingPropertyCardProps = {
  listing: any;
  href: string;
};

export default function ListingPropertyCard({ listing, href }: ListingPropertyCardProps) {
  const headline = listing.flatNumber ? `Flat ${listing.flatNumber}` : `Listing ${listing.id}`;
  const isAvailableNow = listing.availableFrom <= new Date();
  const imageUrls = useMemo(() => {
    const images = Array.isArray(listing.images) ? listing.images : [];
    const sorted = [...images].sort((a: any, b: any) => Number(b.isThumbnail) - Number(a.isThumbnail));
    return sorted.map((image: any) => `/api/images/${image.id}`);
  }, [listing.images]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const hasImages = imageUrls.length > 0;
  const hasMultipleImages = imageUrls.length > 1;
  const nearbyAmenities = listing.property.amenities.slice(0, 3);
  const area = (listing as { area?: number }).area;

  const showPreviousImage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  const showNextImage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % imageUrls.length);
  };

  return (
    <Link
      href={href}
      aria-label={`Open ${headline}`}
      className="group block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9fb00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111]"
    >
      <Card className="border border-white/10 bg-[#242424] p-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c9fb00]/30 hover:shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col overflow-hidden md:flex-row">
        <div className="relative min-h-48 w-full shrink-0 overflow-hidden border-b border-white/8 bg-[#1c1c1c] md:h-auto md:w-65 md:border-b-0 md:border-r md:border-white/8">
          {hasImages ? (
            <img
              src={imageUrls[activeImageIndex]}
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

          {hasMultipleImages ? (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={showPreviousImage}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 p-1.5 text-white/85 transition-colors hover:bg-black/65 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 cursor-pointer" />
              </button>

              <button
                type="button"
                aria-label="Next image"
                onClick={showNextImage}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 p-1.5 text-white/85 transition-colors hover:bg-black/65 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4 cursor-pointer" />
              </button>

              <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/10 bg-black/35 px-2 py-1 backdrop-blur-sm">
                {imageUrls.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Go to image ${index + 1}`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setActiveImageIndex(index);
                    }}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      index === activeImageIndex ? "bg-[#c9fb00]" : "bg-white/45"
                    }`}
                  />
                ))}
              </div>
            </>
          ) : null}

          <div className="absolute left-3 top-3 rounded-full border border-[#c9fb00]/25 bg-[#111111]/70 px-2.5 py-1 text-[11px] font-semibold text-[#c9fb00] backdrop-blur">
            {isAvailableNow ? "Available" : "Upcoming"}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <h3 className="truncate text-[17px] font-semibold text-white">
                {headline}
              </h3>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/45">
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
            </div>

            <div className="text-right self-start">
              <div className="text-2xl font-semibold text-[#c9fb00]">
                {formatCurrency(listing.rent)}
              </div>
              <div className="text-xs text-white/45">per month</div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-[12px] text-white/70 grid-cols-3">
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

          {listing.description && <p className="mt-4 line-clamp-2 text-sm leading-6 text-white/60">
            {listing.description}
          </p>}

          <div className="mt-4 rounded-xl border border-white/8 bg-white/3 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-white/45">
              <MapPin className="h-3.5 w-3.5 text-[#c9fb00]" />
              Nearby amenities
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {nearbyAmenities.length > 0 ? (
                nearbyAmenities.map((amenity: any) => (
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
        </div>
        </div>
      </Card>
    </Link>
  );
}