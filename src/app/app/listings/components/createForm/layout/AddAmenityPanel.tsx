import InputField from "@/app/app/applications/components/Submitform/UI/InputField";
import { AmenityType } from "@prisma/client";
import { AmenityUI, DistanceRange } from "../../../types";
// panel for landlords to add in new amenity info

const AMENITY_TYPE_OPTIONS = [
  { label: "Healthcare",   value: "HEALTHCARE"   },
  { label: "Transport",    value: "TRANSPORT"    },
  { label: "Recreational", value: "RECREATIONAL" },
  { label: "Other",        value: "OTHER"        },
];

type AmenitiesPanelProps = {
  selectedProperty?: boolean;// user has selected an existing property (building) with pre-saved amenities in the property selector step, meaning these amenities will be shared across all listings under this property, vs creating a new property where amenities will only apply to this listing
  amenities: AmenityUI[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: <K extends keyof AmenityUI>(id: string, field: K, value: AmenityUI[K]) => void;
};

export default function AddAmenitiesPanel({ amenities,selectedProperty = false, onAdd, onRemove, onUpdate }: AmenitiesPanelProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Amenities</h2>
        <button type="button" onClick={onAdd} className="text-sm text-primary hover:underline">
          + Add Amenity
        </button>
      </div>

      {selectedProperty && (
        <div className="flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
          <span className="mt-0.5 text-amber-400">
            ⚠️
          </span>
          <p className="text-xs text-amber-300/80">
            Editing amenities here will update the entire building and affect all listings under this property.
          </p>
        </div>
      )}

      {amenities.length === 0 && (
        <p className="text-sm text-white/50">No amenities added</p>
      )}

      {amenities.map((a) => (
        <div key={a.id} className="border border-white/10 rounded-xl p-4 space-y-3 bg-black/20">
          <InputField
            label="Type"
            required
            type="select"
            value={a.type}
            onValueChange={(val: string) => onUpdate(a.id, "type", val as AmenityType)}
            options={AMENITY_TYPE_OPTIONS}
          />
          <InputField
            label="Name"
            value={a.name}
            onChange={(e: any) => onUpdate(a.id, "name", e.target.value)}
            placeholder="Name of amenity"
          />
          <InputField
            label="Distance (km)"
            type="number"
            value={a.distance ?? ""}
            onChange={(e: any) =>
              onUpdate(a.id, "distance", Number(e.target.value))
            }
            placeholder="e.g. 1.2"
          />
         
          <button
            type="button"
            onClick={() => onRemove(a.id)}
            className="text-xs text-red-400 hover:underline"
          >
            Remove
          </button>
        </div>
      ))}
    </section>
  );
}