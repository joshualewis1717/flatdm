import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dispatch, ReactNode, SetStateAction, useEffect, useRef, useState } from "react";
import { ListingParameters } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";

//
// Helper Components and Constants *after FiltersSheet component*
//

type FiltersSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingParameters: ListingParameters;
  setListingParameters: Dispatch<SetStateAction<ListingParameters>>;
};

export default function FiltersSheet({
  open,
  onOpenChange,
  listingParameters,
  setListingParameters
}: FiltersSheetProps) {
  // Draft Filters
  const [draftFilters, setDraftFilters] = useState<ListingParameters>(listingParameters);
  useEffect(() => {
    console.log("draftFilters updated:", draftFilters);
  }, [draftFilters]);

  // Update Draft Filters on Open
  useEffect(() => {
    if (open) {
      setDraftFilters(listingParameters);
    }
  }, [open, listingParameters]);

  // Partial Draft Filters Set'ing handler
  const updateDraftFilters = (updates: Partial<ListingParameters>) => {
    setDraftFilters((prev) => ({ ...prev, ...updates }));
  }

  // Reset Draft Filters
  const resetFilters = () => {
    setDraftFilters({ changed: false });
  };

  // Apply Draft Filters
  const applyFilters = () => {
    if (draftFilters != listingParameters) {
      setListingParameters((prev) => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(draftFilters).filter(([, value]) => value !== undefined)
        ), // (removes undefined key-value pairs)
      }));
    }
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* (Outer) Sheet Content */}
      <SheetContent
        side="top"
        className="w-screen max-w-none h-screen max-h-none inset-0 border-none gap-0"
      >
        <SheetHeader
          className="border-b border-zinc-700/60"
        >
          <SheetTitle>Listing Filters</SheetTitle>
          <SheetDescription>Refine your listings results</SheetDescription>
        </SheetHeader>

        {/* Inner Content */}
        <SheetInnerContent>
          <FilterGrouping title="Availability">
            <FilterSubGrouping title="Available By">
              <Input
                id="filter-available-from"
                type="date"
                className="scheme-dark text-foreground [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-80"
                value={draftFilters.available_from && draftFilters.available_from !== "now" ? draftFilters.available_from.slice(0, 10) : ""}
                disabled={draftFilters.available_from == "now"}
                onChange={(event) =>
                  updateDraftFilters({
                    available_from: event.target.value || undefined,
                  })
                }
              />

              <label className="mt-1 flex cursor-pointer items-center gap-2">
                <Checkbox
                  className="cursor-pointer"
                  checked={draftFilters.available_from == "now"}
                  onCheckedChange={(checked) => {
                    updateDraftFilters({ available_from: checked ? "now" : undefined })
                  }}
                />
                <span className="text-xs text-white/75">Available now</span>
              </label>
            </FilterSubGrouping>
            
            <FilterSubGrouping title="Occupancy">
              <label className="flex h-6 cursor-pointer items-center gap-2 px-0.5">
                <Checkbox
                  className="cursor-pointer"
                  checked={draftFilters.maxoccupants_max != 1}
                  onCheckedChange={() =>
                    updateDraftFilters({
                      maxoccupants_max: draftFilters.maxoccupants_max !== 1 ? 1 : undefined,
                    })
                  }
                />
                <span className="text-sm text-foreground">Shared Flat</span>
              </label>
              <NumberInput
                id="filter-maxoccupants-max"
                label="Max Occupants"
                value={draftFilters.maxoccupants_max}
                disabled={draftFilters.maxoccupants_max == 1}
                min={2}
                onChange={(value) => updateDraftFilters({ maxoccupants_max: value })}
              />
            </FilterSubGrouping>
            
            <FilterSubGrouping title="Minimum Stay (Months)">
              <label className="flex h-6 cursor-pointer items-center gap-2 px-0.5">
                <Checkbox
                  className="cursor-pointer"
                  checked={draftFilters.minstay_max != undefined}
                  onCheckedChange={() =>
                    updateDraftFilters({
                      minstay_max: draftFilters.minstay_max == undefined ? 1 : undefined,
                    })
                  }
                />
                <span className="text-sm text-foreground">Minimum Stay</span>
              </label>
              <NumberInput
                id="filter-minstay-max"
                value={draftFilters.minstay_max}
                disabled={draftFilters.minstay_max == undefined}
                min={0}
                onChange={(value) => updateDraftFilters({ minstay_max: value })}
              />
            </FilterSubGrouping>
            
            <FilterSubGrouping title="Furnished Level">
              <div className="relative">
                <select
                  id="filter-furnished-level"
                  value={draftFilters.furnished_level ?? ""}
                  onChange={(event) =>
                    updateDraftFilters({
                      furnished_level:
                        (event.target.value as ListingParameters["furnished_level"]) || undefined,
                    })
                  }
                  className="h-8 w-full cursor-pointer appearance-none rounded-lg border border-input bg-transparent pl-2.5 pr-9 text-sm text-foreground outline-none transition-colors hover:bg-neutral-700/35"
                >
                  <option value="">Any</option>
                  {FURNISHED_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {FURNISHED_LABELS[option]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
              </div>
            </FilterSubGrouping>
          </FilterGrouping>

          <FilterGrouping title="Price and Size">
            <MinMaxNumberSubGrouping
              title="Rent"
              minId="filter-rent-min"
              maxId="filter-rent-max"
              minValue={draftFilters.rent_min}
              maxValue={draftFilters.rent_max}
              minStep={50}
              maxStep={50}
              maxEmptyBaseValue={draftFilters.rent_min}
              onMinChange={(value) => updateDraftFilters({ rent_min: value })}
              onMaxChange={(value) => updateDraftFilters({ rent_max: value })}
            />
            
            <MinMaxNumberSubGrouping
              title="Bedrooms"
              minId="filter-bedrooms-min"
              maxId="filter-bedrooms-max"
              minValue={draftFilters.bedrooms_min}
              maxValue={draftFilters.bedrooms_max}
              maxEmptyBaseValue={draftFilters.bedrooms_min}
              onMinChange={(value) => updateDraftFilters({ bedrooms_min: value })}
              onMaxChange={(value) => updateDraftFilters({ bedrooms_max: value })}
            />
            
            <MinMaxNumberSubGrouping
              title="Bathrooms"
              minId="filter-bathrooms-min"
              maxId="filter-bathrooms-max"
              minValue={draftFilters.bathrooms_min}
              maxValue={draftFilters.bathrooms_max}
              maxEmptyBaseValue={draftFilters.bathrooms_min}
              onMinChange={(value) => updateDraftFilters({ bathrooms_min: value })}
              onMaxChange={(value) => updateDraftFilters({ bathrooms_max: value })}
            />
            
            <MinMaxNumberSubGrouping
              title="Area"
              minId="filter-area-min"
              maxId="filter-area-max"
              minValue={draftFilters.area_min}
              maxValue={draftFilters.area_max}
              minStep={250}
              maxStep={250}
              maxEmptyBaseValue={draftFilters.area_min}
              onMinChange={(value) => updateDraftFilters({ area_min: value })}
              onMaxChange={(value) => updateDraftFilters({ area_max: value })}
            />
          </FilterGrouping>

          <FilterGrouping title="Listing">
            <label className="flex h-8 cursor-pointer items-center gap-2 px-0.5">
              <Checkbox
                id="filter-has_photo"
                className="cursor-pointer"
                checked={Boolean(draftFilters.has_photo)}
                onCheckedChange={(checked) =>
                  updateDraftFilters({ has_photo: checked === true ? true : undefined })
                }
              />
              <span className="text-sm text-foreground">Has photos</span>
            </label>
          </FilterGrouping>

          <FilterGrouping title="Nearby Amenities">
            <div className="flex flex-col gap-2">
              <label className="flex h-8 cursor-pointer items-center gap-2 px-0.5">
                <Checkbox
                  className="cursor-pointer"
                  checked={Boolean(draftFilters.transport_nearby)}
                  onCheckedChange={(checked) =>
                    updateDraftFilters({ transport_nearby: checked === true ? true : undefined })
                  }
                />
                <span className="text-sm text-foreground">Transport</span>
              </label>

              <label className="flex h-8 cursor-pointer items-center gap-2 px-0.5">
                <Checkbox
                  className="cursor-pointer"
                  checked={Boolean(draftFilters.healthcare_nearby)}
                  onCheckedChange={(checked) =>
                    updateDraftFilters({ healthcare_nearby: checked === true ? true : undefined })
                  }
                />
                <span className="text-sm text-foreground">Healthcare</span>
              </label>

              <label className="flex h-8 cursor-pointer items-center gap-2 px-0.5">
                <Checkbox
                  className="cursor-pointer"
                  checked={Boolean(draftFilters.recreation_nearby)}
                  onCheckedChange={(checked) =>
                    updateDraftFilters({ recreation_nearby: checked === true ? true : undefined })
                  }
                />
                <span className="text-sm text-foreground">Recreation</span>
              </label>
            </div>
          </FilterGrouping>
        </SheetInnerContent>

        <SheetFooter
          className="border-t border-zinc-700/60 sm:flex-row sm:justify-end"
        >
          <Button type="button" variant="outline" className="cursor-pointer" onClick={resetFilters}>
            Reset
          </Button>
          <Button type="button" className="cursor-pointer transition-colors hover:bg-[#d5ff2f] hover:text-black" onClick={applyFilters}>
            Apply
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

//
//
// Helper Components
//
function SheetInnerContent({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 space-y-6">
      {children && children}
    </div>
  )
}

function FilterGrouping({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="space-y-3 rounded-xl border border-white/10 p-4">
      <h3 className="text-base font-semibold tracking-wide text-white">{title}</h3>
      {children && (
        <div className="grid gap-4 lg:grid-cols-2">
          {children}
        </div>
      )}
    </div>
  );
}


function FilterSubGrouping({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/2 p-3">
      <p className="text-sm font-semibold text-white">{title}</p>{children && children}
    </div>
  );
}

function NumberInput({
  id,
  label,
  value,
  disabled = false,
  min = 0,
  step = 1,
  emptyBaseValue,
  onChange,
  onBlur
}: {
  id: string;
  label?: string;
  value: number | undefined;
  disabled?: boolean;
  min?: number;
  step?: number;
  emptyBaseValue?: number;
  onChange: (nextValue: number | undefined, source: "input" | "button", isFocused?: boolean) => void;
  onBlur?: () => void;
}) {
  const baseValue = typeof value === "number" ? value : (emptyBaseValue ?? min);
  const isFocusedRef = useRef(false);
  if (onBlur == undefined) { onBlur = () => {} }

  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="text-sm font-medium text-white/80">{label}</label>}
      <div className="flex items-center gap-0">
        <Button
          type="button"
          variant="outline"
          className="h-8 w-8 cursor-pointer rounded-l-md rounded-r-none border-r-0 px-0"
          disabled={disabled}
          onClick={() => onChange(Math.max(min, baseValue - step), "button")}
        >
          -
        </Button>
        <Input
          id={id}
          type="number"
          min={min}
          step={step}
          className="rounded-none"
          value={value ?? ""}
          disabled={disabled}
          onChange={(event) => {
            const value = event.target.value;
            const isEmpty = value.trim() == "";

            if (isEmpty) {
              onChange(undefined, "input", isFocusedRef.current);
              return;
            }

            const valueAsNumber = (Number(value));
            const isNumber = typeof (valueAsNumber) === "number";

            if (isNumber) {
              onChange(Math.max(min, Number(value)), "input", isFocusedRef.current);
            } else {
              onChange(undefined, "input", isFocusedRef.current);
            }
          }}
          onFocus={() => {
            isFocusedRef.current = true;
          }}
          onBlur={() => {
            isFocusedRef.current = false;
            onBlur();
          }}
          // onBlur={(event) => {
          //   const value = event.target.value;
          //   const isEmpty = value.trim() == "";

          //   if (isEmpty) {
          //     onChange(min, "input");
          //     return;
          //   }

          //   const valueAsNumber = (Number(event.target.value));
          //   const isNumber = typeof (valueAsNumber) === "number";

          //   if (isNumber) {
          //     onChange(Math.max(min, Number(event.target.value)), "input");
          //   } else {
          //     onChange(min, "input");
          //   }
          // }}
        />
        <Button
          type="button"
          variant="outline"
          className="h-8 w-8 cursor-pointer rounded-l-none rounded-r-md border-l-0 px-0"
          disabled={disabled}
          onClick={() => onChange((value == undefined ? baseValue : baseValue + step), "button")}
        >
          +
        </Button>
      </div>
    </div>
  );
}

function MinMaxNumberSubGrouping({
  title,
  minId,
  maxId,
  minValue,
  maxValue,
  minStep,
  maxStep,
  maxEmptyBaseValue,
  onMinChange,
  onMaxChange,
}: {
  title: string;
  minId: string;
  maxId: string;
  minValue: number | undefined;
  maxValue: number | undefined;
  minStep?: number;
  maxStep?: number;
  maxEmptyBaseValue?: number;
  onMinChange: (nextValue: number | undefined, source: "input" | "button") => void;
  onMaxChange: (nextValue: number | undefined, source: "input" | "button") => void;
}) {
  if (minStep == undefined) {minStep = 1}
  if (maxStep == undefined) {maxStep = 1}
  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/2 p-3">
      <p className="text-sm font-semibold text-white">{title}</p>
      <div className="grid grid-cols-2 gap-3">
        <NumberInput 
          id={minId} 
          label="From" 
          value={minValue} 
          step={minStep} 
          onChange={(nextValue: number | undefined, source, isFocused) => {
            if (!isFocused) {
              onMinChange(nextValue, source);

              // if min is higher than man, set max to min
              if (maxValue != undefined && nextValue != undefined) {
                if (nextValue >= maxValue) {
                  onMaxChange(Math.max(0, nextValue+minStep), source);
                }
              }
            } else {
              onMinChange(nextValue, source);
            }
          }}
          onBlur={() => {
            // if min is higher than man, set max to min
            if (maxValue != undefined && minValue != undefined) {
              if (minValue >= maxValue) {
                onMaxChange(Math.max(0, minValue+minStep), "input");
              }
            }
          }}
        />
        <NumberInput
          id={maxId}
          label="To"
          value={maxValue}
          step={maxStep}
          emptyBaseValue={maxEmptyBaseValue}
          onChange={(nextValue: number | undefined, source, isFocused) => {
            if (!isFocused) {
              // if starting from undefined, don't push down min
              if (maxValue == undefined) {
                if (minValue != undefined && nextValue != undefined) {
                  if (nextValue <= minValue) {
                    nextValue = nextValue+maxStep;
                  }
                }
              }

              onMaxChange(nextValue, source);

              // if max is lower than min, set min to max
              if (minValue != undefined && nextValue != undefined) {
                if (nextValue <= minValue) {
                  onMinChange(Math.max(0, nextValue-maxStep), source);
                }
              }
            } else {
              onMaxChange(nextValue, source);
            }
          }}
          onBlur={() => {
              // if max is lower than min, set min to max
              if (minValue != undefined && maxValue != undefined) {
                if (maxValue <= minValue) {
                  onMinChange(Math.max(0, maxValue-maxStep), "input");
                }
              }
          }}
        />
      </div>
    </div>
  );
}

//
//
// Constants
//
const FURNISHED_OPTIONS: NonNullable<ListingParameters["furnished_level"]>[] = [
  "furnished",
  "unfurnished",
  "part_furnished",
];

const FURNISHED_LABELS: Record<NonNullable<ListingParameters["furnished_level"]>, string> = {
  furnished: "Furnished",
  unfurnished: "Unfurnished",
  part_furnished: "Part Furnished",
};