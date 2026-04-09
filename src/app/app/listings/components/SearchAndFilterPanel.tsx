"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import SearchBar from "./SearchBar";
import FiltersSheet from "./FiltersSheet";
import { useListingsState } from "../state/ListingsStateProvider";

const DISTANCE_OPTIONS_MILES = [0.25, 0.5, 1, 3, 5, 10, 15, 20, 30, 40] as const;

// Helper Components at end of file after main component

export default function SearchAndFilterPanel() {
  const { listingParameters, setListingParameters } = useListingsState();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const searchValue =
    typeof listingParameters.search === "string" ? listingParameters.search : "";
  const distanceValue =
    typeof listingParameters.distance_to_location === "number"
      ? String(listingParameters.distance_to_location)
      : "";

  return (
    <>
      <div className="-mx-4 -mt-6 sticky top-24 z-20 border-b border-white/10 bg-background/80 px-4 backdrop-blur-xl sm:-mx-6 sm:top-24 sm:px-6 lg:-mx-8 lg:top-26 lg:px-8">
        <section className="flex w-full flex-row items-center gap-4 py-2">
          <div className="flex min-w-0 flex-1 items-stretch">
            <SearchBar
              value={searchValue}
              placeholder="Search Location..."
              onChange={(value) =>
                setListingParameters((prev) => ({ ...prev, search: value }))
              }
              containerClassName="min-w-0 flex-1"
              inputClassName="rounded-r-none border-r-[0.5px] focus:relative focus:z-10"
            />

            <DistanceDropdown
              value={distanceValue}
              onChange={(value) =>
                setListingParameters((prev) => ({
                  ...prev,
                  distance_to_location: value ? Number(value) : undefined,
                }))
              }
            />
          </div>

          <FiltersButton onClick={() => setIsFilterOpen(true)} />
        </section>
      </div>

      <FiltersSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        listingParameters={listingParameters}
        setListingParameters={setListingParameters}
      />
    </>
  );
}

function DistanceDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative shrink-0">
      <select
        aria-label="Distance from location"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10.5 cursor-pointer appearance-none rounded-l-none rounded-r-[10px] border border-l-[0.5px] border-white/13 bg-[#2a2a2a]/70 px-3.5 py-0 pr-9 text-sm leading-none text-white/80 backdrop-blur-xl outline-none transition-colors hover:border-white/25 hover:text-white focus:border-[#c9fb00]"
      >
        <option value="">Any distance</option>
        {DISTANCE_OPTIONS_MILES.map((distance) => (
          <option key={distance} value={distance}>
            {distance} miles
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
    </div>
  );
}

function FiltersButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-[10px] border border-white/13 bg-[#2a2a2a]/70 px-4 py-2.5 text-[13px] text-white/80 backdrop-blur-xl transition-colors hover:border-white/25 hover:bg-[#343434]/75 hover:text-white focus-visible:border-[#c9fb00]"
    >
      <SlidersHorizontal className="h-4 w-4 text-white/70" />
      Filters
    </button>
  );
}