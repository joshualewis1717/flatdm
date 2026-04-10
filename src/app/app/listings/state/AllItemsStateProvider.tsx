"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { Prisma } from "@prisma/client";

type ListingsResultItem = Prisma.PropertyListingGetPayload<{
  include: {
    images: true;
    property: {
      include: {
        amenities: true;
      };
    };
  };
}>;

export type PaginationMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

type AllItemsState = {
  ListingsResults: ListingsResultItem[];
  setListingsResults: Dispatch<SetStateAction<ListingsResultItem[]>>;
  paginationMeta: PaginationMeta;
  setPaginationMeta: Dispatch<SetStateAction<PaginationMeta>>;
  querySignature: string | null;
  setQuerySignature: Dispatch<SetStateAction<string | null>>;
};

const DEFAULT_PAGE_SIZE = 5;

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
