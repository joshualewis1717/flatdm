"use client";

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { ListingParameters } from "../types";

// What this state stores:
// - the current listing parameters (filters, sorting, pagination) that are used to query the listings from the server
// - a setter function to update these parameters

const UNSAVED_CHANGES_MESSAGE =
  "You have unsaved listing progress. If you leave this page, your changes will be lost.";

function hasMeaningfulValue(value: unknown) {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return true;
}

function getHasUnsavedChanges(params: ListingParameters) {
  const {
    page: _page,
    ...rest
  } = params;

  return Object.values(rest).some(hasMeaningfulValue);
}

function isListingsPath(pathname: string) {
  return (
    pathname === "/listings" ||
    pathname.startsWith("/listings/") ||
    pathname === "/app/listings" ||
    pathname.startsWith("/app/listings/")
  );
}

type ListingsState = {
  listingParameters: ListingParameters;
  setListingParameters: Dispatch<SetStateAction<ListingParameters>>;
};

const ListingsStateContext = createContext<ListingsState | null>(null);

export function ListingsStateProvider({ children }: { children: ReactNode }) {
  const [listingParameters, setRawListingParameters] = useState<ListingParameters>({});

  const setListingParameters: Dispatch<SetStateAction<ListingParameters>> = useCallback(
    (nextState) => {
      setRawListingParameters((prev) => {
        const resolvedState =
          typeof nextState === "function"
            ? (nextState as (prevState: ListingParameters) => ListingParameters)(prev)
            : nextState;

        return resolvedState;
      });
    },
    [],
  );


  // Track unsaved changes based on filter/search params
  const hasUnsavedChangesRef = useRef(false);
  useEffect(() => {
    hasUnsavedChangesRef.current = getHasUnsavedChanges(listingParameters);
  }, [listingParameters]);

  // Warn users about unsaved changes when they try to leave the page or navigate away
  useEffect(() => {
    // Function to confirm if the user wants to leave when there are unsaved changes
    const confirmLeave = () =>
      !hasUnsavedChangesRef.current || window.confirm(UNSAVED_CHANGES_MESSAGE);

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // If there are no unsaved changes, allow the unload without prompting
      if (!hasUnsavedChangesRef.current) {
        return;
      }

      // Standard way to trigger the browser's confirmation dialog:
      event.preventDefault();
      event.returnValue = "";
    };

    // Intercept in-app link clicks:
    const handleDocumentClick = (event: MouseEvent) => {
      // If no unsaved changes, no need to check further
      if (!hasUnsavedChangesRef.current) {
        return;
      }

      // Only intercept left-clicks without modifier keys
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      // Check if the click is on a link that would navigate away
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      // Finds the closest element that is a link (in case the click is on a child element inside a link)
      const anchor = target.closest("a");
      if (!anchor || !anchor.href || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      // Construct the URL to compare with the current location
      // If the link points to the same page (including search params), we allow it without confirmation
      const nextUrl = new URL(anchor.href, window.location.href);
      if (
        nextUrl.origin === window.location.origin &&
        nextUrl.pathname === window.location.pathname &&
        nextUrl.search === window.location.search
      ) {
        return;
      }

      // If the next URL is outside of listings paths, prompt the user
      if (!isListingsPath(nextUrl.pathname) && !confirmLeave()) {
        event.preventDefault(); // Prevent navigation
        event.stopPropagation(); // Stop the event from bubbling up further
        // Prevent other click handlers from running
      }
    };

    // Handle browser refresh/close:
    const handlePopState = () => {
      if (isListingsPath(window.location.pathname)) {
        return;
      }

      if (!confirmLeave()) {
        window.history.go(1); // Stay on the current page
      }
    };

    // Handle browser refresh/close:
    window.addEventListener("beforeunload", handleBeforeUnload);
    // Handle back/forward navigation:
    window.addEventListener("popstate", handlePopState);
    // Handle in-app link clicks:
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, []);

  // Memoize the context value to prevent unnecessary re-renders of consumers
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