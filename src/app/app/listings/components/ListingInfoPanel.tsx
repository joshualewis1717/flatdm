'use client'
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";


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

    // mock data
    const title = "Example Listing Name";
    const description = "This is a description of the property.";
    const rent = 1000;
    const availableFrom = new Date("2026-01-01");
    const createdAt = new Date();
    const landlordName = "LANDLORD";

    // house info
    const totalRooms = 3;
    const bathrooms = 2;
    const shared = true;
    const size = 120; // sqm

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

    // moack roomtate data:
    // Example Roommates Data
    const roommates = [
        { id: 1, name: "Alice Johnson", avatarUrl: null },
        { id: 2, name: "Bob Smith", avatarUrl: null },
        { id: 3, name: "Charlie Lee", avatarUrl: null},
        { id: 4, name: "Diana Chen", avatarUrl: null },
        { id: 5, name: "Ethan Davis", avatarUrl: null},
        { id: 6, name: "Fiona Garcia", avatarUrl: null},
        { id: 7, name: "George Patel", avatarUrl: null},
        { id: 8, name: "Hannah Nguyen", avatarUrl: null },
        { id: 9, name: "Ian Martinez", avatarUrl: null },
        { id: 10, name: "Julia Kim", avatarUrl: null},
        { id: 11, name: "Kevin Brown", avatarUrl: null },
    ];
    const [currentImage, setCurrentImage] = useState(0);

    const prevImage = () => {
        setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };
    const nextImage = () => {
        setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const amenityTypes = Array.from(new Set(amenities.map((a) => a.type)));

    return (
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] overflow-hidden max-w-5xl mx-auto">
            {/* Image slider */}
            <div className="relative w-full h-60 sm:h-72 bg-white/10">
                <img
                src={images[currentImage]}
                alt={`Listing image ${currentImage + 1}`}
                className="w-full h-full object-cover"
                />
                {/* Arrows */}
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
                {images.map((img, idx) => (
                    <div
                    key={idx}
                    className={`h-12 w-12 rounded-md overflow-hidden border-2 ${
                        idx === currentImage ? "border-primary" : "border-white/20"
                    } cursor-pointer`}
                    onClick={() => setCurrentImage(idx)}
                    >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                ))}
                </div>
            </div>

            {/* Info panel */}
            <div className="p-6 sm:p-8 space-y-4 -mt-2">
                {/* Title + created */}
                <div className="flex items-start justify-between">
                <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">{title}</h2>
                <p className="text-xs text-white/50">{createdAt.toLocaleDateString()}</p>
                </div>

                {/* Rent + available */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <p className="text-3xl sm:text-4xl font-semibold text-primary">£{rent}</p>
                <p className="text-sm text-white/70">Available from {availableFrom.toLocaleDateString()}</p>
                </div>

                {/* Owned by */}
                <p className="text-xs text-white/50">Owned by {landlordName}</p>

                {/* Horizontal bar for house info */}
            <div className="bg-white/[0.05] p-6 rounded-xl border border-white/10 space-y-2 text-base">

                {/*<hr className="border-t-2 border-primary rounded-full" />*/}
                {/* Row 1 */}
                <div className="flex justify-between">
                    <span className="text-white/70">• Rooms: {totalRooms}</span>
                    <span className="text-white/70">• Bathrooms: {bathrooms}</span>
                </div>

                {/* Row 2 */}
                <div className="flex justify-between">
                    <span className="text-white/70">• Shared: {shared ? "Yes" : "No"}</span>
                    <span className="text-white/70">• Size: {size} sqm</span>
                </div>

                {/*<hr className="border-t-2 border-primary rounded-full" />*/}
            </div>

            {/* Roommates Section */}
            {roommates.length > 0 && (
            <div className="mt-4">
                <h3 className="text-sm font-medium text-white/85 mb-2">Current Roommates</h3>
                <div className="flex -space-x-3">
                {roommates.slice(0, 10).map((rm) => (
                    <img
                    key={rm.id}
                    src={rm.avatarUrl}
                    alt={rm.name}
                    title={rm.name}
                    className="w-10 h-10 rounded-full border-2 border-white/20 hover:border-primary cursor-pointer object-cover"
                    />
                ))}
                {roommates.length > 10 && (//TODO: REPLACE 10 WITH A CONST LATER
                    <button
                    onClick={() => console.log("Open full roommate list")}// open like a small box that shows all roomates
                    className="w-10 h-10 flex items-center justify-center text-xs text-white/70 bg-white/[0.05] rounded-full border-2 border-white/20 hover:border-primary cursor-pointer"
                    >
                    +{roommates.length - 10}
                    </button>
                )}
                </div>
            </div>
            )}
            {/* Description */}
            <p className="text-sm leading-7 text-white/70">{description}</p>

            {/* Amenities section */}
            {amenities.length > 0 && (
            <div className="space-y-3">
                <h3 className="text-2xl font-medium text-white/85">Amenities</h3>

                {/* Amenity type buttons */}
                <div className="flex gap-2 flex-wrap">
                {amenityTypes.map((type) => (
                    <button
                    key={type}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedAmenityType === type
                        ? "bg-primary text-black"
                        : "bg-white/[0.05] text-white/70"
                    }`}
                    onClick={() => setSelectedAmenityType(type)}
                    >
                    {type}
                    </button>
                ))}
                </div>

                {/* Display amenities of selected type */}
                <div className="mt-2 space-y-1">
                {selectedAmenityType
                    ? amenities
                        .filter((a) => a.type === selectedAmenityType)
                        .map((a) => (
                        <div key={a.id} className="text-white/70 flex flex-col">
                            <p className="text-lg font-bold">{a.name}</p>
                            <p className="text-sm">{a.distance ? `(${a.distance} km away)` : ""}</p>
                        </div>
                        ))
                    : <p className="text-sm text-white/50">Select an amenity type to see details</p>}
                </div>
            </div>
            )}
            </div>
        </section>
    );
}