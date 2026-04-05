'use client'
import { useState, useEffect } from "react";
import { ChevronDown, Check, MapPin } from "lucide-react";
import { ExistingProperty } from "../../../types";
import { getPropertiesForLandlord } from "../../../prisma/clientServices";

// Component for landlords to select from their previously used properties (buildings) when creating a new listing.
type PropertySelectorProps = {
  landlordId: number;
  onSelect: (property: ExistingProperty | null) => void;
};

type Mode = "idle" | "existing";// should it show the suggesstions or just be idle and do nothing

export default function PropertySelector({ landlordId, onSelect }: PropertySelectorProps) {
  const [mode, setMode] = useState<Mode>("idle");
  const [open, setOpen] = useState(false);// should it show the dropdown of suggestions or not
  const [selected, setSelected] = useState<ExistingProperty | null>(null);// which property did it select
  const [properties, setProperties] = useState<ExistingProperty[]>([]);
  const [loading, setLoading] = useState(false);

  // function to fetch the landlord properties from database
  async function getLandlordProperties() {
    setLoading(true);
    try{
    const data = await getPropertiesForLandlord();
    setProperties(data.map(property => ({
      ...property,
      amenities: property.amenities.map(amenity => ({
        ...amenity,
        propertyId: property.id,
      })),
    })));
    } catch (e) {
      console.error("Failed to load properties", e);
    } finally {
      setLoading(false);
    }
  }


  // function to handle when user clicks the "use existing property" button, sets mode and fetches properties if we haven't already
  async function handleExistingMode(){
    setMode("existing");
    setSelected(null);
    onSelect(null);

    if (properties.length === 0) {
       getLandlordProperties();
    }
  };

  // function to handle when user clicks one of the existing properties from drop down
  function chooseExisting(prop: ExistingProperty){
    setSelected(prop);
    setOpen(false);
    onSelect(prop);
  };

  /******** use effects  */

  // fetch once on mount so it's ready when the user clicks
  useEffect(() => {
    getLandlordProperties();
  }, [landlordId]);

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
            {/* show loading state whilst fetching from db, TODO: replace with an actual spinner */}
            {loading ? (
              <span className="text-white/40">Loading locations…</span>
            ) : selected ? (
              <span className="text-white">
                {selected.buildingName}, {selected.streetName}, {selected.postcode}
              </span>
            ) : (
              <span>Select a location…</span>
            )}
            
            {/* Chevron icon rotates when dropdown is open */}
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && !loading && (
            <ul className="absolute z-10 mt-1 w-full rounded-xl border border-white/10 bg-[#0f0f13] shadow-xl overflow-hidden">
              {properties.length === 0 ? (
                <li className="px-4 py-3 text-sm text-white/40">No saved locations found.</li>
              ) : (
                properties.map((prop) => (
                  // each property option in the dropdown is a button, clicking it sets the selected property and closes the dropdown
                  <li key={prop.id}>
                    <button
                      type="button"
                      onClick={() => chooseExisting(prop)}
                      className="w-full flex items-start justify-between px-4 py-3 text-sm hover:bg-white/[0.05] transition text-left"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {prop.buildingName}
                        </p>
                        <p className="text-white/40 text-xs mt-0.5">
                          {prop.streetName}, {prop.city}, {prop.postcode}
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