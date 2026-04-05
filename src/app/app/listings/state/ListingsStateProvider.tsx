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
import type { ListingParameters } from "../types";

type ListingsState = {
  listingParameters: ListingParameters;
  setListingParameters: Dispatch<SetStateAction<ListingParameters>>;
};

const ListingsStateContext = createContext<ListingsState | null>(null);

export function ListingsStateProvider({ children }: { children: ReactNode }) {
  const [listingParameters, setListingParameters] = useState<ListingParameters>({
    changed: false,
  });

  const value = useMemo(
    () => ({ listingParameters, setListingParameters }),
    [listingParameters],
  );

  return (
    <ListingsStateContext.Provider value={value}>
      {children}
    </ListingsStateContext.Provider>
  );
}

export function useListingsState() {
  const context = useContext(ListingsStateContext);

  if (!context) {
    throw new Error("useListingsState must be used within ListingsStateProvider");
  }

  return context;
}