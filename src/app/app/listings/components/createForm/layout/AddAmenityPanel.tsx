import InputField from "@/app/app/applications/components/Submitform/UI/InputField";
import { Amenity } from "@prisma/client";
import { AmenityType } from "@prisma/client";
import { DistanceRange } from "../../../types";
// panel for landlords to add in new amenity info
export type AmenityDraft = Omit<Amenity, "distance"> & {
  distance: DistanceRange | null;
};

const DISTANCE_OPTIONS = [
  { label: "0–2 km",  value: "0-2"  },
  { label: "2–5 km",  value: "2-5"  },
  { label: "5–10 km", value: "5-10" },
] satisfies { label: string; value: DistanceRange }[];

const AMENITY_TYPE_OPTIONS = [
  { label: "Healthcare",   value: "HEALTHCARE"   },
  { label: "Transport",    value: "TRANSPORT"    },
  { label: "Recreational", value: "RECREATIONAL" },
  { label: "Other",        value: "OTHER"        },
];

type AmenitiesPanelProps = {
  amenities: AmenityDraft[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: <K extends keyof AmenityDraft>(id: number, field: K, value: AmenityDraft[K]) => void;
};

export default function AddAmenitiesPanel({ amenities, onAdd, onRemove, onUpdate }: AmenitiesPanelProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Amenities</h2>
        <button type="button" onClick={onAdd} className="text-sm text-primary hover:underline">
          + Add Amenity
        </button>
      </div>

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
            label="Distance"
            type="radio"
            name={`distance-${a.id}`}
            value={a.distance ?? ""}
            radioOptions={DISTANCE_OPTIONS}
            onRadioChange={(val: string) => onUpdate(a.id, "distance", val as DistanceRange)}
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