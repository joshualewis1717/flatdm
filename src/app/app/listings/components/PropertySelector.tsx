'use client'
import { useState } from "react";
import { ChevronDown, Check, MapPin } from "lucide-react";
import { Amenity, ExistingProperty } from "../types";
// a selector for landlords to choose to autofill from a previously saved location, or to start from scratch

type PropertySelectorProps = {
  landlordId: number;
  onSelect: (property: ExistingProperty | null) => void;
};

// ─── Mock data — replace with a real fetch ──────────────────────────────────
const MOCK_PROPERTIES: ExistingProperty[] = [
  {
    id: 1,
    buildingName: "Maple Court",
    address: "12 Maple Street",
    city: "London",
    postcode: "E1 6RF",
    hasExistingListings: true,
    amenities: [
      { id: 1, propertyId: 1, name: "Bus Stop", type: "TRANSPORT", distance: 0.3 },
      { id: 2, propertyId: 1, name: "Tesco Express", type: "RECREATIONAL", distance: 0.2 },
    ],
  },
  {
    id: 2,
    buildingName: null,
    address: "8 Birch Lane",
    city: "London",
    postcode: "SW9 0AB",
    hasExistingListings: false,
    amenities: [],
  },
];
// ─────────────────────────────────────────────────────────────────────────────

type Mode = "idle" | "existing" | "new";

export default function PropertySelector({ landlordId, onSelect }: PropertySelectorProps) {
  const [mode, setMode] = useState<Mode>("idle");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ExistingProperty | null>(null);

  const chooseExisting = (prop: ExistingProperty) => {
    setSelected(prop);
    setOpen(false);
    onSelect(prop);
  };

  const handleExistingMode = () => {
    setMode("existing");
    setSelected(null);
    onSelect(null);
  };


  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleExistingMode}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border transition ${
            mode === "existing"
              ? "border-primary/60 bg-primary/10 text-primary"
              : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white/80"
          }`}
        >
          <MapPin className="w-4 h-4" />
          Use previously used location
        </button>
      </div>

      {/* Existing building dropdown */}
      {mode === "existing" && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70 hover:border-white/20 transition"
          >
            {selected ? (
              <span className="text-white">
                {selected.buildingName ? `${selected.buildingName} — ` : ""}{selected.address}, {selected.postcode}
              </span>
            ) : (
              <span>Select a location…</span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <ul className="absolute z-10 mt-1 w-full rounded-xl border border-white/10 bg-[#0f0f13] shadow-xl overflow-hidden">
              {MOCK_PROPERTIES.map((prop) => (
                <li key={prop.id}>
                  <button
                    type="button"
                    onClick={() => chooseExisting(prop)}
                    className="w-full flex items-start justify-between px-4 py-3 text-sm hover:bg-white/[0.05] transition text-left"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {prop.buildingName ?? prop.address}
                      </p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {prop.address}, {prop.city}, {prop.postcode}
                      </p>
                    </div>
                    {selected?.id === prop.id && <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}