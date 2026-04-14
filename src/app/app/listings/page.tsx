"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import SearchAndFilterPanel from "./components/SearchAndFilterPanel";
import ListingPropertyCard from "./components/ListingPropertyCard";
import PaginationBar from "./components/PaginationBar";
import { useListingsState } from "./state/ListingsStateProvider";
import { useAllItemsState } from "./state/AllItemsStateProvider";
import { queryWithFiltersSortingAndPages } from "./prisma/queryWithFiltersSortingAndPages";

const EARTH_RADIUS_MILES = 3958.8;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const haversineDistanceMiles = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
) => {
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const lat1 = toRadians(fromLat);
  const lat2 = toRadians(toLat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_MILES * c;
};

export default function ListingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { listingParameters, setListingParameters } = useListingsState();
  const {
    ListingsResults,
    setListingsResults,
    paginationMeta,
    setPaginationMeta,
    querySignature,
    setQuerySignature,
  } = useAllItemsState();

  // Create a stable signature for the current filters/sorting (excluding pagination) to determine when to refetch data (we use memoization)
  const fetchSignature = useMemo(() => {
    const { page, sort_by, sort_order, search, ...rest } = listingParameters;
    return JSON.stringify(rest);
  }, [listingParameters]);

  useEffect(() => {
    console.log("Fetch Sig Changed")
  
    return () => {
      console.log("Cleanup for fetch sig", fetchSignature)
    }
  }, [fetchSignature])
  

  // Whenever the fetchSignature changes (indicating a change in filters/sorting), we refetch the listings data from the server
  useEffect(() => {
    if (querySignature === fetchSignature) {
      return;
    }

    let isCancelled = false;

    const loadListings = async () => {
      setIsLoading(true);
      setLoadError(null);
      setPaginationMeta((prev) => ({
        ...prev,
        page: 1,
        totalPages: 1,
      }));
      console.log("refetching");

      try {
        const response = await queryWithFiltersSortingAndPages(listingParameters);

        if (isCancelled) {
          return;
        }

        if (response.result === null) {
          setListingsResults([]);
          setLoadError(response.error);
        } else {
          setListingsResults(response.result);
        }

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

  // Sync pagination meta (total items, total pages) whenever the listings results or current page changes
  // e.g. calculates total pages based on total items and page size
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

  // On refetched page, set page back to 1 (if not already there) to avoid invalid page numbers after filter/sorting changes
  useEffect(() => {
    if (listingParameters.page !== 1) {
      setListingParameters((prev) => ({ ...prev, page: 1 }));
    }
  }, [fetchSignature, setListingParameters]);

  // Apply client-side sorting to the current results
  const sortedResults = useMemo(() => {
    const sortBy = listingParameters.sort_by ?? "updated_at";
    const sortOrder = listingParameters.sort_order === "asc" ? "asc" : "desc";
    const sorted = [...ListingsResults];
    const locationLat = Number(listingParameters.location_lat);
    const locationLng = Number(listingParameters.location_lng);
    const hasLocationForDistanceSort =
      Number.isFinite(locationLat) && Number.isFinite(locationLng);

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
          return compareDate(a.availableFrom ?? new Date(0), b.availableFrom ?? new Date(0));
        case "distance":
          if (!hasLocationForDistanceSort) {
            return compareDate(a.updatedAt, b.updatedAt);
          }

          return compareNumber(
            haversineDistanceMiles(locationLat, locationLng, a.property.lat, a.property.lng),
            haversineDistanceMiles(locationLat, locationLng, b.property.lat, b.property.lng),
          );
        default:
          return 0;
      }
    });

    return sorted;
  }, [
    ListingsResults,
    listingParameters.location_lat,
    listingParameters.location_lng,
    listingParameters.sort_by,
    listingParameters.sort_order,
  ]);

  // Get current page listings
  // Factors in pagination and sorting, but not filtering (since most filtering is done server-side)
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
      ) : loadError ? (
        <Card className="border border-red-400/25 bg-[#242424] px-5 py-10 text-red-200">
          <div className="flex items-center justify-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-300" aria-hidden="true" />
            <span>{loadError}</span>
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