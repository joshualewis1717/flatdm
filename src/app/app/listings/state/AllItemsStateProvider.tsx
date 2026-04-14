"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AllItemsState, ListingsResultItem, PaginationMeta } from "../types";

// What this state stores: 
// - the current listings results, 
// - pagination meta (current page, total pages, etc.) 
// - query signature that can be used to determine if the current filters/sorting have changed (and thus if we need to refetch data from the server) 

const DEFAULT_PAGE_SIZE = 1;

const AllItemsStateContext = createContext<AllItemsState | null>(null);

export function AllItemsStateProvider({ children }: { children: ReactNode }) {
  const [ListingsResults, setListingsResults] = useState<ListingsResultItem[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  });
  const [querySignature, setQuerySignature] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      ListingsResults,
      setListingsResults,
      paginationMeta,
      setPaginationMeta,
      querySignature,
      setQuerySignature,
    }),
    [ListingsResults, paginationMeta, querySignature],
  );

  return (
    <AllItemsStateContext.Provider value={value}>
      {children}
    </AllItemsStateContext.Provider>
  );
}

export function useAllItemsState() {
  const context = useContext(AllItemsStateContext);

  if (!context) {
    throw new Error("useAllItemsState must be used within AllItemsStateProvider");
  }

  return context;
}
