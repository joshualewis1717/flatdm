"use client";

import { useEffect, useState } from "react";
import SearchAndFilterPanel from "./components/SearchAndFilterPanel";
import { getAllListings } from "./logic/clientServices/prisma";
import { useListingsState } from "./state/ListingsStateProvider";

export default function ListingsPage() {
  // State for the listings data:
  const [listings, setListings] = useState<unknown[]>([]);

  const { listingParameters, setListingParameters } = useListingsState();

  // Load listings on component mount:
  useEffect(() => {
    const loadListings = async () => {
      const data = await getAllListings();
      setListings(data ?? []);
    };

    loadListings();
  }, []);

  // Update listings on parameters change (for now, just re-fetch all listings):
  useEffect(() => {
    const loadListings = async () => {
      const data = await getAllListings();
      setListings(data ?? []);
    };

    loadListings();
  }, [listingParameters]);

  return (
    <div className="space-y-6">
      <SearchAndFilterPanel
        listingParameters={listingParameters}
        setListingParameters={setListingParameters}
      />

      {listings.map((listing, index) => (
        <p key={index}>{JSON.stringify(listing)}</p>
      ))}
    </div>
  );
}