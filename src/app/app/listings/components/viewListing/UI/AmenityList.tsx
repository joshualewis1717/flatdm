'use client'
import { useState } from "react";
import {AmenityUI } from "../../../types";

// generic component to display information about the different amenities that a property listing may have


type AmenityListProps = {
  amenities: AmenityUI[];
};

export default function AmenityList({ amenities }: AmenityListProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const amenityTypes = Array.from(new Set(amenities.map((a) => a.type)));

  return (
    <div className="space-y-3">
      <h3 className="text-2xl font-medium text-white/85">Nearby Amenities</h3>

      {amenities.length === 0 && (
        <p className="text-sm text-white/50">No amenities listed for this property.</p>
      )}

      {amenities.length > 0 && (
        <>
          {/* Type filter buttons */}
          <div className="flex gap-2 flex-wrap">
            {amenityTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType((prev) => (prev === type ? null : type))}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                  selectedType === type
                    ? "bg-primary text-black"
                    : "bg-white/[0.05] text-white/70 hover:bg-white/10"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Amenity rows */}
          <div className="space-y-2">
            {selectedType ? (
              amenities
                .filter((a) => a.type === selectedType)
                .map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3"
                  >
                    <p className="text-sm font-medium text-white">{a.name}</p>
                    {a.distance != null && (
                      <p className="text-xs text-white/50">{a.distance} km away</p>
                    )}
                  </div>
                ))
            ) : (
              <p className="text-sm text-white/50">Select a category to see details</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}