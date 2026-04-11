'use client'
import { useEffect, useMemo, useState } from "react";
import { BedDouble, Bath, Users, Ruler, CalendarClock, Clock, Armchair } from "lucide-react";
import ImageSlider from "../UI/ImageSlider";
import PropertyStatsGrid from "../UI/PropertyStatsGrid";
import RoommateProfileList from "../UI/RoomateProfileList";
import AmenityList from "../UI/AmenityList";
import { getListingById } from "../../../prisma/clientServices";
import { getListingTitle } from "@/app/app/logic/listing";
import { useAllItemsState } from "../../../state/AllItemsStateProvider";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorMessage from "@/components/shared/ErrorMessage";
import { FURNISHED_LEVEL_OPTIONS } from "../../createForm/ListingForm";
import { ListingInfoData } from "../../../types";
import { mapCachedListingToListingData } from "../../../prisma/mappers";
// Panel to display the static listing specific data in full

type ListingInfoPanelProps = {
  listingId: string;
};


export default function ListingInfoPanel({ listingId }: ListingInfoPanelProps) {
  const [data, setData] = useState<ListingInfoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { ListingsResults } = useAllItemsState();

  const numericListingId = Number(listingId);
  const cachedListing = useMemo(
    () => ListingsResults.find((listing) => listing.id === numericListingId) ?? null,
    [ListingsResults, numericListingId],
  );

  const furnishedLabelMap = useMemo(
    () =>
      Object.fromEntries(
        FURNISHED_LEVEL_OPTIONS.map((opt) => [opt.value, opt.label])
      ),
    []
  );
  
  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      setLoading(true);

      if (cachedListing) {
        setData(mapCachedListingToListingData(cachedListing));
        setLoading(false);
        return;
      }

      const { result, error } = await getListingById(listingId);

      if (isCancelled) {
        return;
      }

      if (error) {
        console.error("Failed to fetch listing data:", error);
        setData(null);
        setError(error);
      } else {
        setData(result);
      }

      setLoading(false);
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [cachedListing, listingId]);

  if (loading) return <LoadingSpinner text="Loading listing details…" />;
  if (error)   return <ErrorMessage text={error} />;
  if (!data)   return <ErrorMessage text="This listing could not be found." />;

  const {  flatNumber, description, rent, lastUpdated,
    bedrooms, bathrooms, maxOccupants, minStay,
    area, totalRooms,  thumbnail, images,
    buildingName, streetName, city, postcode,
    landlordName, amenities, availableFrom, currentOccupants, furnishedLevel } = data;

  const shared = maxOccupants > 1;// derive shared from max occupants
  const headline = getListingTitle(buildingName, flatNumber)
  const addressLine = `${streetName}, ${city}, ${postcode}`;

  // combine thumbnail + images for the slider, thumbnail first
  const sliderImages = [
    ...(thumbnail ? [thumbnail] : ['/defaultImage.svg']),
    ...(images ?? []),
  ];

  const stats = [
    { icon: <BedDouble    className="w-4 h-4" />, label: "Rooms",         value: totalRooms },
    { icon: <Bath         className="w-4 h-4" />, label: "Bathrooms",     value: bathrooms },
    { icon: <BedDouble    className="w-4 h-4" />, label: "Bedrooms",      value: bedrooms },
    {icon: <Armchair className="w-4 h-4"/>, label: "furnished level", value: furnishedLabelMap[furnishedLevel] ?? furnishedLevel},
    { icon: <Users        className="w-4 h-4" />, label: "Max Occupants", value: maxOccupants },
    { icon: <Ruler        className="w-4 h-4" />, label: "Area",          value: `${area} m²` },
    { icon: <Clock        className="w-4 h-4" />, label: "Min Stay",      value: `${minStay} months` },
    { icon: <CalendarClock className="w-4 h-4" />, label: "Shared",       value: shared ? "Yes" : "No", highlight: true },
  ];

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] overflow-hidden max-w-5xl mx-auto">
      <ImageSlider images={sliderImages} />

      <div className="p-6 sm:p-8 space-y-6">

        {/* Title + last updated */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
              {headline}
            </h2>
            <p className="text-sm text-white/40">{addressLine}</p>
          </div>
          
          <div className="flex flex-col gap-1">
            <p className="text-xs text-white/50 mt-1 shrink-0">
              last updated at: {lastUpdated.toLocaleDateString()}
            </p>
            <p className="text-xs text-primary mt-1 shrink-0">
              available from: {availableFrom? availableFrom.toLocaleDateString(): 'N/A'}
            </p>
          </div>
        </div>

        {/* Rent */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1">
          <div>
            <p className="text-3xl sm:text-4xl font-semibold text-primary">
              £{rent} <span className="text-base font-normal text-white/50">/ month</span>
            </p>
            {shared && (
              <p className="text-xs text-white/40 mt-1">
                Per person — up to {maxOccupants} people can share this listing
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-white/50 -mt-2">Listed by {landlordName}</p>

        <PropertyStatsGrid stats={stats} />

        <RoommateProfileList
          roomates={currentOccupants}
        />

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-white/85">About this property</h3>
          <p className="text-sm leading-7 text-white/70">{description}</p>
        </div>

        <AmenityList amenities={amenities} />
      </div>
    </section>
  );
}