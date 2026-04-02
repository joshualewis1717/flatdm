'use client'
import { BedDouble, Bath, Users, Ruler, CalendarClock, Clock } from "lucide-react";
import ImageSlider from "../components/ImageSlider";
import PropertyStatsGrid from "./PropertyStatsGrid";
import RoommateProfileList from "./RoomateProfileList";
import AmenityList from "../components/AmenityList";
import { Amenity } from "../types";

// Panel to display the static listing specific data in full

type ListingInfoPanelProps = {
  listingId: string;
};

export default function ListingInfoPanel({ listingId }: ListingInfoPanelProps) {
  // Mock data — replace with db fetch via listingId
  const title = "Example Listing Name";
  const description = "This is a description of the property.";
  const rent = 1000;
  const lastUpdated = new Date();
  const landlordName = "LANDLORD";

  const totalRooms = 3;
  const bathrooms = 2;
  const beds = 4;
  const maxOccupants = 5;
  const roommatesAllowed = true;
  const shared = true;
  const area = 120;
  const minStay = 6;

  const images = [
    "/images/listing1.jpg",
    "/images/listing2.jpg",
    "/images/listing3.jpg",
  ];

  const roommates = [
    { id: 1, name: "Alice Johnson" },
    { id: 2, name: "Bob Smith" },
    { id: 3, name: "Charlie Lee" },
    { id: 4, name: "Diana Chen" },
    { id: 5, name: "Ethan Davis" },
    { id: 6, name: "Fiona Garcia" },
    { id: 7, name: "George Patel" },
    { id: 8, name: "Hannah Nguyen" },
    { id: 9, name: "Ian Martinez" },
    { id: 10, name: "Julia Kim" },
    { id: 11, name: "Kevin Brown" },
  ];

  const amenities: Amenity[] = [
    { id: 1, name: "Bus Stop", distance: 0.3, type: "TRANSPORT" },
    { id: 2, name: "Hospital", distance: 1.2, type: "HEALTHCARE" },
    { id: 3, name: "Park", distance: 0.5, type: "RECREATIONAL" },
  ];

  const stats = [
    { icon: <BedDouble className="w-4 h-4" />, label: "Rooms", value: totalRooms },
    { icon: <Bath className="w-4 h-4" />, label: "Bathrooms", value: bathrooms },
    { icon: <BedDouble className="w-4 h-4" />, label: "Beds", value: beds },
    { icon: <Users className="w-4 h-4" />, label: "Max Occupants", value: maxOccupants },
    { icon: <Ruler className="w-4 h-4" />, label: "Area", value: `${area} m²` },
    { icon: <Clock className="w-4 h-4" />, label: "Min Stay", value: `${minStay} months` },
    { icon: <CalendarClock className="w-4 h-4" />, label: "Shared", value: shared ? "Yes" : "No" },
    {
      icon: <Users className="w-4 h-4" />,
      label: "Roommates",
      value: roommatesAllowed ? "Allowed" : "Not allowed",
      highlight: roommatesAllowed,
    },
  ];

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] overflow-hidden max-w-5xl mx-auto">
      <ImageSlider images={images} />

      <div className="p-6 sm:p-8 space-y-6">
        {/* Title + last updated */}
        <div className="flex items-start justify-between">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-white/50 mt-1">last updated at: {lastUpdated.toLocaleDateString()}</p>
        </div>

        {/* Rent */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1">
          <p className="text-3xl sm:text-4xl font-semibold text-primary">
            £{rent} <span className="text-base font-normal text-white/50">/ month</span>
          </p>
        </div>

        <p className="text-xs text-white/50 -mt-2">Listed by {landlordName}</p>

        <PropertyStatsGrid stats={stats} />

        <RoommateProfileList
          roommates={roommates}
          onShowMore={() => console.log("Open full roommate list")}
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