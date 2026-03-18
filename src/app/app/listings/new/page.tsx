'use client'
import { useState } from "react";
import InputField from "../../application/components/InputField";
import { ListingForm, Amenity, AmenityType, DistanceRange } from "../types";
import AddAmenitiesPanel from "../components/AddAmenityPanel";
import AddImagesPanel from "../components/AddImagePanel";
// page for landlords to create a new listing
// Converts the user-selected range string to a representative number for persistence.
const DISTANCE_RANGE_TO_KM: Record<DistanceRange, number> = {
  "0-2":  1,
  "2-5":  3,
  "5-10": 7,
};

type NewListingsPageProps = {
  landlordId: number;
};

// Amenity with distance stored as DistanceRange string to fit nicley in with rest of the components
type AmenityDraft = Omit<Amenity, "distance"> & {
  distance: DistanceRange | null;
};

export default function NewListingsPage({ landlordId }: NewListingsPageProps) {
  const [amenities, setAmenities] = useState<AmenityDraft[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [amenityCounter, setAmenityCounter] = useState(0);

  const [form, setForm] = useState<ListingForm>({
    title: "",
    property: "",
    address: "",
    rooms: 0,
    bathrooms: 0,
    beds: 0,
    maxOccupants: 0,
    size: 0,
    rent: 0,
    AvailableFrom: undefined,
    minStay: 0,
    roommatesAllowed: false,
    description: "",
  });

  // used for 'normal' input types that users can type into
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  // used for date picker
  const handleDateChange = (date: Date | undefined) => {
    setForm((prev) => ({ ...prev, AvailableFrom: date ? date.getTime() : undefined }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert AmenityDraft[] → Amenity[] only at submit time
    const resolvedAmenities: Amenity[] = amenities.map((a) => ({
      ...a,
      distance: a.distance ? DISTANCE_RANGE_TO_KM[a.distance] : 0,
    }));
    console.log({ ...form, amenities: resolvedAmenities, images });
  };

  // Amenity helpers
  const addAmenity = () => {
    setAmenities((prev) => [
      ...prev,
      { id: amenityCounter, type: "OTHER" as AmenityType, name: "", distance: null },
    ]);
    setAmenityCounter((c) => c + 1);
  };

  const updateAmenity = <K extends keyof AmenityDraft>(id: number, field: K, value: AmenityDraft[K]) => {
    setAmenities((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const removeAmenity = (id: number) => {
    setAmenities((prev) => prev.filter((a) => a.id !== id));
  };

  // Image helpers
  const addImage = () => setImages((prev) => [...prev, "https://via.placeholder.com/150"]);
  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-6">
      <h1 className="font-bold text-5xl text-center">Create Listing</h1>

      <div className="flex gap-x-2 items-center">
        <p className="text-red-500">*</p>
        <p className="text-xs text-white/50">indicates required fields</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>

        {/* Basic Info */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Basic Information</h2>
          <InputField label="Listing Title" name="title" value={form.title} required onChange={handleChange} placeholder="Enter listing title" />
          <InputField label="Property (Building)" name="property" value={form.property} required onChange={handleChange} placeholder="Select building or property" />
          <InputField label="Address" name="address" value={form.address} required onChange={handleChange} placeholder="Full property address" />
        </section>

        {/* Property Details */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Property Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Rooms" type="number" name="rooms" value={String(form.rooms)} required onChange={handleChange} placeholder="Number of rooms" />
            <InputField label="Bathrooms" type="number" name="bathrooms" value={String(form.bathrooms)} required onChange={handleChange} placeholder="Number of bathrooms" />
            <InputField label="Beds" type="number" name="beds" value={String(form.beds)} required onChange={handleChange} placeholder="Number of beds" />
            <InputField label="Max Occupants" type="number" name="maxOccupants" value={String(form.maxOccupants)} required onChange={handleChange} placeholder="Max occupants" />
            <InputField label="Size (sqm)" type="number" name="size" value={String(form.size)} required onChange={handleChange} placeholder="Floor size in sqm" />
          </div>
          <div className="flex items-center gap-3 text-white/70">
            <input type="checkbox" name="roommatesAllowed" checked={form.roommatesAllowed} onChange={handleChange} className="accent-primary" />
            <label>Roommates allowed</label>
          </div>
        </section>

        {/* Pricing & Availability */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Pricing & Availability</h2>
          <InputField label="Rent per person (£)" type="number" name="rent" value={String(form.rent)} required onChange={handleChange} placeholder="Rent per person" />
          <InputField label="Available From" type="date" name="AvailableFrom" value={form.AvailableFrom ? new Date(form.AvailableFrom) : null} required onDateChange={handleDateChange} placeholder="Earliest availability" />
          <InputField label="Minimum Stay (months)" type="number" name="minStay" value={String(form.minStay)} onChange={handleChange} placeholder="Minimum stay duration" />
        </section>

        {/* Description */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Description</h2>
          <InputField label="Description" name="description"  type="textarea" value={form.description} onChange={handleChange} placeholder="Enter listing description" />
        </section>

        {/* panel to add in amenity info to listing */}
        <AddAmenitiesPanel
          amenities={amenities}
          onAdd={addAmenity}
          onRemove={removeAmenity}
          onUpdate={updateAmenity}
        />
        {/* panel to add in images  to listing*/}
        <AddImagesPanel
          images={images}
          onAdd={addImage}
          onRemove={removeImage}
        />

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button type="button" onClick={() => window.history.back()} className="flex-1 rounded-2xl bg-black/70 text-white py-3 font-semibold hover:bg-black/80">
            Back
          </button>
          <button type="submit" className="flex-1 rounded-2xl bg-primary text-primary-foreground py-3 font-semibold hover:bg-primary/80">
            Save Listing
          </button>
        </div>

      </form>
    </div>
  );
}