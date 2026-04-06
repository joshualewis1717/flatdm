"use client";

import { SlidersHorizontal } from "lucide-react";
import SearchBar from "./SearchBar";
import { useListingsState } from "../state/ListingsStateProvider";

type SearchAndFilterPanelProps = {

};

export default function SearchAndFilterPanel(_props: SearchAndFilterPanelProps = {}) {
  const { listingParameters, setListingParameters } = useListingsState();
  const searchValue = typeof listingParameters.search === "string" ? listingParameters.search : "";

  return (
    <div className="-mx-4 -mt-6 sticky top-24 z-20 border-b border-white/10 bg-background/80 px-4 backdrop-blur-xl sm:-mx-6 sm:top-24 sm:px-6 lg:-mx-8 lg:top-26 lg:px-8">
      <section className="flex w-full flex-row items-center gap-4 py-2">
        <SearchBar
          value={searchValue}
          placeholder="Search Location..."
          onChange={(value) =>
            setListingParameters((prev) => ({
              ...prev,
              search: value,
            }))
          }
        />
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-[10px] border border-white/13 bg-[#2a2a2a]/70 backdrop-blur-xl px-4 py-2.5 text-[13px] text-white/80 outline-none transition-colors hover:border-white/25 hover:bg-[#343434]/75 hover:text-white focus-visible:border-[#c9fb00]"
          >
            <SlidersHorizontal className="h-4 w-4 text-white/70" />
            Filters
          </button>
      </section>
    </div>
  );
}