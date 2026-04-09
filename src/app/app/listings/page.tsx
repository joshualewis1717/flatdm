"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import SearchAndFilterPanel from "./components/SearchAndFilterPanel";
import ListingPropertyCard from "./components/ListingPropertyCard";
import PaginationBar from "./components/PaginationBar";
import { useListingsState } from "./state/ListingsStateProvider";
import { queryAllListings } from "./prisma/rawQueries";

type ListingsData = Awaited<ReturnType<typeof queryAllListings>>;

export default function ListingsPage() {
  const [listings, setListings] = useState<ListingsData>([]);
  const router = useRouter();

  const { listingParameters } = useListingsState();

  useEffect(() => {
    const loadListings = async () => {
      const data = await queryAllListings();
      setListings(data ?? []);
    };

    loadListings();
  }, [listingParameters]);

  return (
    <div className="space-y-6 pb-10">
      <SearchAndFilterPanel />
      <PaginationBar />

      {listings.length === 0 ? (
        <Card className="border border-white/10 bg-[#242424] px-5 py-6 text-white/60">
          No listings found.
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const listingUrl = `listings/${listing.id}`;

            return (
              <ListingPropertyCard
                key={listing.id}
                listing={listing}
                onOpen={() => router.push(listingUrl)}
              />
            );
          })}
        </div>
      )}

      <PaginationBar />
    </div>
  );
}