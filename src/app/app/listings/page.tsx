"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import SearchAndFilterPanel from "./components/SearchAndFilterPanel";
import ListingPropertyCard from "./components/ListingPropertyCard";
import PaginationBar from "./components/PaginationBar";
import { useListingsState } from "./state/ListingsStateProvider";
import { useAllItemsState } from "./state/AllItemsStateProvider";
import { queryWithFiltersSortingAndPages } from "./prisma/queryWithFiltersSortingAndPages";

export default function ListingsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const { listingParameters, setListingParameters } = useListingsState();
  const {
    ListingsResults,
    setListingsResults,
    paginationMeta,
    setPaginationMeta,
    querySignature,
    setQuerySignature,
  } = useAllItemsState();

  const fetchSignature = useMemo(() => {
    const { page, sort_by, sort_order, ...rest } = listingParameters;
    return JSON.stringify(rest);
  }, [listingParameters]);

  useEffect(() => {
    if (querySignature === fetchSignature) {
      return;
    }

    let isCancelled = false;

    const loadListings = async () => {
      setIsLoading(true);
      setPaginationMeta((prev) => ({
        ...prev,
        page: 1,
        totalPages: 1,
      }));

      try {
        const items = await queryWithFiltersSortingAndPages(listingParameters);

        if (isCancelled) {
          return;
        }

        setListingsResults(items);
        setQuerySignature(fetchSignature);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadListings();

    return () => {
      isCancelled = true;
    };
  }, [
    fetchSignature,
    listingParameters,
    querySignature,
    setPaginationMeta,
    setListingsResults,
    setQuerySignature,
  ]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const pageRaw = Number(listingParameters.page);
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
    const totalItems = ListingsResults.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / paginationMeta.pageSize));
    const effectivePage = Math.min(page, totalPages);

    setPaginationMeta((prev) => {
      if (
        prev.page === effectivePage &&
        prev.totalItems === totalItems &&
        prev.totalPages === totalPages
      ) {
        return prev;
      }

      return {
        ...prev,
        page: effectivePage,
        totalItems,
        totalPages,
      };
    });
  }, [
    isLoading,
    ListingsResults.length,
    listingParameters.page,
    paginationMeta.pageSize,
    setPaginationMeta,
  ]);

  const sortedResults = useMemo(() => {
    const sortBy = listingParameters.sort_by ?? "updated_at";
    const sortOrder = listingParameters.sort_order === "asc" ? "asc" : "desc";
    const sorted = [...ListingsResults];

    const compareNumber = (a: number, b: number) =>
      sortOrder === "asc" ? a - b : b - a;

    const compareDate = (a: Date | string, b: Date | string) => {
      const timeA = new Date(a).getTime();
      const timeB = new Date(b).getTime();
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    };

    sorted.sort((a, b) => {
      switch (sortBy) {
        case "rent":
          return compareNumber(a.rent, b.rent);
        case "area":
          return compareNumber(a.area, b.area);
        case "created_at":
          return compareDate(a.createdAt, b.createdAt);
        case "updated_at":
          return compareDate(a.updatedAt, b.updatedAt);
        case "available_from":
          // There is no direct available_from field on PropertyListing yet.
          return compareDate(a.updatedAt, b.updatedAt);
        case "distance":
          // Distance sorting is intentionally not implemented yet.
          return compareDate(a.updatedAt, b.updatedAt);
        default:
          return 0;
      }
    });

    return sorted;
  }, [ListingsResults, listingParameters.sort_by, listingParameters.sort_order]);

  // Get current page listings
  const listings = useMemo(() => {
    const start = (paginationMeta.page - 1) * paginationMeta.pageSize;
    const end = start + paginationMeta.pageSize;
    return sortedResults.slice(start, end);
  }, [paginationMeta.page, paginationMeta.pageSize, sortedResults]);

  return (
    <div className="space-y-6 pb-10">
      <SearchAndFilterPanel />

      <PaginationBar
        currentPage={paginationMeta.page}
        totalPages={paginationMeta.totalPages}
        onPageChange={(newPage) =>
          setListingParameters((prev) => ({
            ...prev,
            page: Math.min(Math.max(newPage, 1), paginationMeta.totalPages),
          }))
        }
      />

      {isLoading ? (
        <Card className="border border-white/10 bg-[#242424] px-5 py-10 text-white/70">
          <div className="flex items-center justify-center gap-3">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-[#c9fb00]" />
            <span>Loading listings...</span>
          </div>
        </Card>
      ) : listings.length === 0 ? (
        <Card className="border border-white/10 bg-[#242424] px-5 py-6 text-white/60">
          No listings found. Please adjust the search and filter criteria.
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const listingUrl = `/app/listings/${listing.id}`;

            return (
              <ListingPropertyCard
                key={listing.id}
                listing={listing}
                href={listingUrl}
              />
            );
          })}
        </div>
      )}

      <PaginationBar
        currentPage={paginationMeta.page}
        totalPages={paginationMeta.totalPages}
        onPageChange={(newPage) =>
          setListingParameters((prev) => ({
            ...prev,
            page: Math.min(Math.max(newPage, 1), paginationMeta.totalPages),
          }))
        }
      />
    </div>
  );
}