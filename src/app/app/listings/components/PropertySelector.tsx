'use client'
import { useState, useEffect } from "react";
import { ChevronDown, Check, MapPin } from "lucide-react";
import { ExistingProperty } from "../types";
import { getPropertiesForLandlord } from "../logic/clientServices/prisma";
type PropertySelectorProps = {
  landlordId: number;
  onSelect: (property: ExistingProperty | null) => void;
};

type Mode = "idle" | "existing";

export default function PropertySelector({ landlordId, onSelect }: PropertySelectorProps) {
  const [mode, setMode] = useState<Mode>("idle");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ExistingProperty | null>(null);
  const [properties, setProperties] = useState<ExistingProperty[]>([]);
  const [loading, setLoading] = useState(false);

    // fetch once on mount so it's ready when the user clicks
    useEffect(() => {
      const load = async () => {
        setLoading(true);
        try {
          const data = await getPropertiesForLandlord(landlordId);
          setProperties(data);
        } catch (e) {
          console.error("Failed to load properties", e);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [landlordId]);

  const handleExistingMode = async () => {
    setMode("existing");
    setSelected(null);
    onSelect(null);

    if (properties.length === 0) {
      setLoading(true);
      try {
        const data = await getPropertiesForLandlord(landlordId);
        setProperties(data);
      } catch (e) {
        console.error("Failed to load properties", e);
      } finally {
        setLoading(false);
      }
    }
  };

  const chooseExisting = (prop: ExistingProperty) => {
    setSelected(prop);
    setOpen(false);
    onSelect(prop);
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

      {mode === "existing" && (
        <div className="relative">
          <button
            type="button"
            onClick={() => !loading && setOpen((o) => !o)}
            disabled={loading}
            className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70 hover:border-white/20 transition disabled:opacity-50"
          >
            {loading ? (
              <span className="text-white/40">Loading locations…</span>
            ) : selected ? (
              <span className="text-white">
                {selected.buildingName ? `${selected.buildingName} — ` : ""}{selected.address}, {selected.postcode}
              </span>
            ) : (
              <span>Select a location…</span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && !loading && (
            <ul className="absolute z-10 mt-1 w-full rounded-xl border border-white/10 bg-[#0f0f13] shadow-xl overflow-hidden">
              {properties.length === 0 ? (
                <li className="px-4 py-3 text-sm text-white/40">No saved locations found.</li>
              ) : (
                properties.map((prop) => (
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
                ))
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}