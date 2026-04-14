"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import SearchBar from "./UI/SearchBar";
import FiltersSheet from "./FiltersSheet";
import LocationSuggestionHolder from "./LocationSuggestionHolder";
import { useListingsState } from "../state/ListingsStateProvider";
import type { ListingParameters } from "../types";
import { CompleteSuggestion, type CompleteSuggestionResult } from "../ors/GetSuggestions";

const DISTANCE_OPTIONS_MILES = [0.25, 0.5, 1, 3, 5, 10, 15, 20, 30, 40] as const;
const SUGGESTION_DEBOUNCE_MS = 300;
const SORT_OPTIONS: Array<{
  value: string;
  label: string;
  sortBy: NonNullable<ListingParameters["sort_by"]>;
  sortOrder: NonNullable<ListingParameters["sort_order"]>;
}> = [
  { value: "highest_price", label: "Highest Price", sortBy: "rent", sortOrder: "desc" },
  { value: "lowest_price", label: "Lowest Price", sortBy: "rent", sortOrder: "asc" },
  { value: "largest_area", label: "Largest Area", sortBy: "area", sortOrder: "desc" },
  {
    value: "newly_listed_updated",
    label: "Newest",
    sortBy: "updated_at",
    sortOrder: "desc",
  },
  { value: "closest", label: "Closest", sortBy: "distance", sortOrder: "asc" },
];

function hasActiveFilters(listingParameters: ListingParameters): boolean {
  const { sort_by, sort_order, distance_to_location, location_lat, location_lng, page, search, ...filtered } = listingParameters;
  return Object.values(filtered).some((value) => value !== undefined);
}

function getSortPresetValue(listingParameters: ListingParameters): string {
  const match = SORT_OPTIONS.find(
    (option) =>
      option.sortBy === listingParameters.sort_by &&
      option.sortOrder === listingParameters.sort_order
  );

  return match?.value ?? "";
}

// Helper Components at end of file after main component

export default function SearchAndFilterPanel() {
  const { listingParameters, setListingParameters } = useListingsState();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [stickyTopOffset, setStickyTopOffset] = useState(96);
  const searchValue =
    typeof listingParameters.search === "string" ? listingParameters.search : "";
  const distanceValue =
    typeof listingParameters.distance_to_location === "number"
      ? String(listingParameters.distance_to_location)
      : "";
  const sortValue = getSortPresetValue(listingParameters);

  // Calculate and set the top offset for the sticky header based on the height of the page header
  useEffect(() => {
    const header = document.getElementById("app-page-header");

    if (!header) {
      return;
    }

    const updateOffset = () => {
      setStickyTopOffset(Math.ceil(header.getBoundingClientRect().height));
    };

    updateOffset();

    const resizeObserver = new ResizeObserver(updateOffset);
    resizeObserver.observe(header);
    window.addEventListener("resize", updateOffset);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateOffset);
    };
  }, []);

  return (
    <>
      <div
        className="-mx-4 -mt-6 sticky z-20 border-b border-white/10 bg-background/80 px-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        style={{ top: `${stickyTopOffset}px` }}
      >
        <section className="flex w-full flex-col-reverse items-stretch gap-2 py-2 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-stretch">
            <SearchWithSuggestions
              searchValue={searchValue}
              hasSearchChanged={listingParameters.has_search_changed === true}
              onSearchChange={(value) =>
                setListingParameters((prev) => ({
                  ...prev,
                  search: value,
                  location_lat: undefined,
                  location_lng: undefined,
                  has_search_changed: true,
                }))
              }
              onSuggestionSelect={(item) => {
                setListingParameters((prev) => ({
                  ...prev,
                  search: item.label,
                  location_lat: item.lat,
                  location_lng: item.long,
                  page: 1,
                  has_search_changed: false,
                }));

                setListingParameters((prev) => ({
                  ...prev,
                  has_search_changed: false,
                }));
              }}
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
          <div className="flex w-full items-stretch gap-2 sm:w-auto sm:flex-none sm:justify-end">
            <div className="min-w-0 flex-1 sm:flex-none">
              <SortDropdown
                value={sortValue}
                onChange={(value) =>
                  setListingParameters((prev) => {
                    const selectedOption = SORT_OPTIONS.find((option) => option.value === value);

                    return {
                      ...prev,
                      sort_by: selectedOption?.sortBy,
                      sort_order: selectedOption?.sortOrder,
                      page: 1,
                    };
                  })
                }
              />
            </div>

            <div className="min-w-0 flex-1 sm:flex-none">
              <FiltersButton onClick={() => setIsFilterOpen(true)} hasFilters={hasActiveFilters(listingParameters)} />
            </div>
          </div>
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

function SortDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full sm:w-auto">
      <span className="pointer-events-none absolute left-3 top-1.5 text-[9px] font-medium uppercase tracking-[0.08em] text-white z-5">
        Sort
      </span>
      <select
        aria-label="Sort listings"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10.5 w-full cursor-pointer appearance-none rounded-[10px] border border-l-[0.5px] border-white/13 bg-[#2a2a2a]/70 pb-1.5 pl-2.75 pr-9 pt-3.5 text-sm leading-normal text-white/80 backdrop-blur-xl outline-none transition-colors hover:border-white/25 hover:text-white focus:border-[#c9fb00] sm:w-auto"
      >
        <option value="">Sort by</option>
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
    </div>
  );
}

function FiltersButton({ onClick, hasFilters }: { onClick: () => void; hasFilters: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border px-4 py-2.5 text-[13px] backdrop-blur-xl transition-colors sm:w-auto ${
        hasFilters
          ? "bg-[#c9fb00]/10 border-[#c9fb00]/25 hover:bg-[#c9fb00]/15 hover:border-white/25 hover:text-[#c9fb00]"
          : "border-white/13 bg-[#2a2a2a]/70 text-white/80 hover:border-white/25 hover:bg-[#343434]/75 hover:text-white focus-visible:border-[#c9fb00]"
      }`}
    >
      <SlidersHorizontal className={`h-4 w-4 ${hasFilters ? "text-[#c9fb00]" : "text-white/70"}`} />
      <span className={`${hasFilters? "text-[#c9fb00]" : ""}`}>Filters</span>
    </button>
  );
}

function SearchWithSuggestions({
  searchValue,
  hasSearchChanged,
  onSearchChange,
  onSuggestionSelect,
}: {
  searchValue: string;
  hasSearchChanged: boolean;
  onSearchChange: (value: string) => void;
  onSuggestionSelect: (item: CompleteSuggestionResult) => void;
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const { locationSuggestions, locationSuggestionsError } = useLocationSuggestions({
    isSearchFocused,
    searchValue,
  });
  const showSuggestions = isSearchFocused && hasSearchChanged;

  return (
    <div className="relative min-w-0 flex-1">
      <SearchBar
        ref={searchBarRef}
        value={searchValue}
        placeholder="Search Location..."
        onChange={onSearchChange}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
        containerClassName="min-w-0 flex-1"
        inputClassName="rounded-r-none border-r-[0.5px] focus:relative focus:z-10"
      />

      {showSuggestions ? (
        <LocationSuggestionHolder
          anchorRef={searchBarRef}
          suggestions={locationSuggestions}
          errorMessage={locationSuggestionsError}
          onSelect={onSuggestionSelect}
        />
      ) : null}
    </div>
  );
}

function useLocationSuggestions({
  isSearchFocused,
  searchValue,
}: {
  isSearchFocused: boolean;
  searchValue: string;
}) {
  const [locationSuggestions, setLocationSuggestions] = useState<CompleteSuggestionResult[]>([]);
  const [locationSuggestionsError, setLocationSuggestionsError] = useState<string | null>(null);

  // Fetch location suggestions with debouncing whenever the search value changes and is focused
  useEffect(() => {
    let isCancelled = false;
    const query = searchValue.trim();
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;

    if (!isSearchFocused || query.length < 2) {
      setLocationSuggestions([]);
      setLocationSuggestionsError(null);
      return;
    }

    setLocationSuggestions([]);
    setLocationSuggestionsError(null);

    debounceTimer = setTimeout(() => {
      const loadSuggestions = async () => {
        try {
          const results = await CompleteSuggestion(query);

          if (isCancelled) {
            return;
          }

          setLocationSuggestions(results.slice(0, 4));
          setLocationSuggestionsError(null);
        } catch (error) {
          console.error("Error fetching location suggestions for query:", query);
          console.error("Error details:", error);
          if (isCancelled) {
            return;
          }

          setLocationSuggestions([]);
          setLocationSuggestionsError("Database error, please try again later.");
        }
      };

      void loadSuggestions();
    }, SUGGESTION_DEBOUNCE_MS);

    return () => {
      isCancelled = true;
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [isSearchFocused, searchValue]);

  return { locationSuggestions, locationSuggestionsError };
}