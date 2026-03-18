'use client'
import { useState } from "react";
import { ArrowLeft, ArrowRight, BedDouble, Bath, Users, Ruler, CalendarClock, Clock } from "lucide-react";

// Panel to display the static listing specific data in full

type Amenity = {
  id: number;
  name: string;
  distance?: number;
  type: "transport" | "healthcare" | "recreational" | string;
};

type ListingInfoPanelProps = {
  listingId: string;
};

export default function ListingInfoPanel({ listingId }: ListingInfoPanelProps) {

  // mock data in reality we will get it from db via listingId
  const title = "Example Listing Name";
  const description = "This is a description of the property.";
  const rent = 1000;
 // const availableFrom = new Date("2026-01-01");
  const lastUpdated = new Date();
  const landlordName = "LANDLORD";

  // house info
  const totalRooms = 3;
  const bathrooms = 2;
  const beds = 4;
  const maxOccupants = 5;
  const roommatesAllowed = true;
  const shared = true;
  const area = 120; // sqm^2
  const minStay = 6; // months

  // amenities
  const amenities: Amenity[] = [
    { id: 1, name: "Bus Stop", distance: 0.3, type: "transport" },
    { id: 2, name: "Hospital", distance: 1.2, type: "healthcare" },
    { id: 3, name: "Park", distance: 0.5, type: "recreational" },
  ];

  const [selectedAmenityType, setSelectedAmenityType] = useState<string | null>(null);

  // mock images
  const images = [
    "/images/listing1.jpg",
    "/images/listing2.jpg",
    "/images/listing3.jpg",
  ];

  // mock roommate data
  const roommates = [
    { id: 1, name: "Alice Johnson", avatarUrl: null },
    { id: 2, name: "Bob Smith", avatarUrl: null },
    { id: 3, name: "Charlie Lee", avatarUrl: null },
    { id: 4, name: "Diana Chen", avatarUrl: null },
    { id: 5, name: "Ethan Davis", avatarUrl: null },
    { id: 6, name: "Fiona Garcia", avatarUrl: null },
    { id: 7, name: "George Patel", avatarUrl: null },
    { id: 8, name: "Hannah Nguyen", avatarUrl: null },
    { id: 9, name: "Ian Martinez", avatarUrl: null },
    { id: 10, name: "Julia Kim", avatarUrl: null },
    { id: 11, name: "Kevin Brown", avatarUrl: null },
  ];

  const [currentImage, setCurrentImage] = useState(0);

  const prevImage = () => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImage = () => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  const amenityTypes = Array.from(new Set(amenities.map((a) => a.type)));

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] overflow-hidden max-w-5xl mx-auto">

      {/* Image slider  make new component*/}
      <div className="relative w-full h-60 sm:h-72 bg-white/10">
        <img
          src={images[currentImage]}
          alt={`Listing image ${currentImage + 1}`}
          className="w-full h-full object-cover"
        />
        <button
          onClick={prevImage}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
        >
          <ArrowLeft />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
        >
          <ArrowRight />
        </button>
        {/* Thumbnail previews */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`h-12 w-12 rounded-md overflow-hidden border-2 ${
                idx === currentImage ? "border-primary" : "border-white/20"
              } cursor-pointer`}
              onClick={() => setCurrentImage(idx)}
            >
              <img src={images[idx]} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Info panel */}
      <div className="p-6 sm:p-8 space-y-6">

        {/* Title + date */}
        <div className="flex items-start justify-between">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-white/50 mt-1">{"last updated at: " + lastUpdated.toLocaleDateString()}</p>
        </div>

        {/* Rent + availability */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1">
          <p className="text-3xl sm:text-4xl font-semibold text-primary">
            £{rent} <span className="text-base font-normal text-white/50">/ month</span>
          </p>
          {/* we probs don't need to show this info?
          <p className="text-sm text-white/70">
            Available from {availableFrom.toLocaleDateString()}
          </p>
          */}
        </div>

        {/* Owned by */}
        <p className="text-xs text-white/50 -mt-2">Listed by {landlordName}</p>

        {/*grid/ bar for house info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <BedDouble className="w-4 h-4" />, label: "Rooms", value: totalRooms },
            { icon: <Bath className="w-4 h-4" />, label: "Bathrooms", value: bathrooms },
            { icon: <BedDouble className="w-4 h-4" />, label: "Beds", value: beds },
            { icon: <Users className="w-4 h-4" />, label: "Max Occupants", value: maxOccupants },
            { icon: <Ruler className="w-4 h-4" />, label: "area", value: `${area} m²` },// do square sign instead
            { icon: <Clock className="w-4 h-4" />, label: "Min Stay", value: `${minStay} months` },
            { icon: <CalendarClock className="w-4 h-4" />, label: "Shared", value: shared ? "Yes" : "No" },
            {
              icon: <Users className="w-4 h-4" />,
              label: "Roommates",
              value: roommatesAllowed ? "Allowed" : "Not allowed",
              highlight: roommatesAllowed,
            },
          ].map(({ icon, label, value, highlight }) => (
            <div
              key={label}
              className="bg-white/[0.04] border border-white/10 rounded-xl p-3 flex flex-col gap-1.5"
            >
              <div className={`flex items-center gap-1.5 text-xs ${highlight ? "text-primary" : "text-white/50"}`}>
                {icon}
                <span>{label}</span>
              </div>
              <p className={`text-sm font-medium ${highlight ? "text-primary" : "text-white"}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Roommates section */}
        {roommates.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-white/85 mb-3">Current Roommates</h3>
            <div className="flex -space-x-3">
              {roommates.slice(0, 10).map((rm) => (
                <div
                  key={rm.id}
                  title={rm.name}
                  className="w-10 h-10 rounded-full border-2 border-white/20 hover:border-primary cursor-pointer bg-white/10 flex items-center justify-center text-xs text-white/70 font-medium transition-colors"
                >
                  {rm.name.split(" ").map(n => n[0]).join("")}
                </div>
              ))}
              {roommates.length > 10 && (
                <button
                  onClick={() => console.log("Open full roommate list")}
                  className="w-10 h-10 flex items-center justify-center text-xs text-white/70 bg-white/[0.05] rounded-full border-2 border-white/20 hover:border-primary cursor-pointer"
                >
                  +{roommates.length - 10}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-white/85">About this property</h3>
          <p className="text-sm leading-7 text-white/70">{description}</p>
        </div>

        {/* Amenities section */}
        {amenities.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-2xl font-medium text-white/85">Nearby Amenities</h3>

            {/* Amenity type buttons */}
            <div className="flex gap-2 flex-wrap">
              {amenityTypes.map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setSelectedAmenityType(prev => prev === type ? null : type)
                  }
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                    selectedAmenityType === type
                      ? "bg-primary text-black"
                      : "bg-white/[0.05] text-white/70 hover:bg-white/10"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Amenity list */}
            <div className="space-y-2">
              {selectedAmenityType ? (
                amenities
                  .filter((a) => a.type === selectedAmenityType)
                  .map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3"
                    >
                      <p className="text-sm font-medium text-white">{a.name}</p>
                      {a.distance && (
                        <p className="text-xs text-white/50">{a.distance} km away</p>
                      )}
                    </div>
                  ))
              ) : (
                <p className="text-sm text-white/50">Select a category to see details</p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}