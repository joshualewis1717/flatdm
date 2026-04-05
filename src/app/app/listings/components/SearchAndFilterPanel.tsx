"use client";

import type { Dispatch, SetStateAction } from "react";
import SearchBar from "./SearchBar";
import { useListingsState } from "../state/ListingsStateProvider";
import type { ListingParameters } from "../types";

type SearchAndFilterPanelProps = {

};

export default function SearchAndFilterPanel(_props: SearchAndFilterPanelProps = {}) {
  const { listingParameters, setListingParameters } = useListingsState();
  const searchValue = typeof listingParameters.search === "string" ? listingParameters.search : "";

  return (
    <div className="-mx-4 -mt-6 sticky top-24 z-20 border-b border-white/10 bg-background/80 px-4 backdrop-blur-xl sm:-mx-6 sm:top-24 sm:px-6 lg:-mx-8 lg:top-26 lg:px-8">
      <section className="flex w-full flex-row items-center gap-4 py-2">
        <p>Search</p>
        <SearchBar
          value={searchValue}
          onChange={(value) =>
            setListingParameters((prev) => ({
              ...prev,
              search: value,
            }))
          }
        />
      </section>
    </div>
  );
}