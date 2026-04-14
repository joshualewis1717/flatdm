"use client";

import LocationSuggestion from "./LocationSuggestion";
import { AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import type { CompleteSuggestionResult } from "../ors/GetSuggestions";

type LocationSuggestionHolderProps = {
  anchorRef: RefObject<HTMLDivElement | null>;
  suggestions: CompleteSuggestionResult[];
  errorMessage?: string | null;
  onSelect: (item: CompleteSuggestionResult) => void;
};

type FloatingPosition = {
  left: number;
  top: number;
  width: number;
};

export default function LocationSuggestionHolder({
  anchorRef,
  suggestions,
  errorMessage,
  onSelect,
}: LocationSuggestionHolderProps) {
  const [position, setPosition] = useState<FloatingPosition | null>(null);

  const updatePosition = () => {
    const anchor = anchorRef.current;

    if (!anchor) {
      setPosition(null);
      return;
    }

    const rect = anchor.getBoundingClientRect();

    setPosition({
      left: rect.left,
      top: rect.bottom + 8,
      width: rect.width,
    });
  };

  useLayoutEffect(() => {
    updatePosition();
  }, [anchorRef, suggestions.length, errorMessage]);

  useEffect(() => {
    if (!anchorRef.current) {
      return;
    }

    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(anchorRef.current);

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [anchorRef]);

  if (suggestions.length === 0 && !errorMessage) {
    return null;
  }

  if (!position) {
    return null;
  }

  return createPortal(
    <div
      className="fixed z-50 overflow-hidden rounded-[12px] border border-white/13 bg-[#2a2a2a]/70 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl"
      style={{ left: position.left, top: position.top, width: position.width }}
    >
      <div className="border-b border-white/13 bg-white/3 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/70">
        {errorMessage ? "Error" : "Results"}
      </div>
      <div className="max-h-60 overflow-y-auto">
        {errorMessage ? (
          <div className="flex items-start gap-2 px-3 py-3 text-sm text-red-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        ) : (
          suggestions.map((item) => (
            <LocationSuggestion
              key={item.id}
              label={item.label}
              subtitle={item.subtitle}
              onSelect={() => onSelect(item)}
            />
          ))
        )}
      </div>
    </div>,
    document.body,
  );
}
