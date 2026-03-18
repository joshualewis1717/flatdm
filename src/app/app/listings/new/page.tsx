'use client'
import { useState } from "react";
import TextBox from "../../application/components/TextBox";
import { ListingForm, Amenity, AmenityType, DistanceRange } from "../types";

// page for landlords to create a new listing
type NewListingsPageProps = {
  landlordId: string;
};

export default function NewListingsPage({ landlordId }: NewListingsPageProps) {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setForm((prev) => ({
      ...prev,
      AvailableFrom: date ? date.getTime() : undefined,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ ...form, amenities, images });
  };

  // Amenity helpers 
  const addAmenity = () => {
    setAmenities((prev) => [
      ...prev,
      { id: String(amenityCounter), type: "OTHER" as AmenityType, name: "", distance: 0 },
    ]);
    setAmenityCounter((c) => c + 1);
  };

  const updateAmenity = <K extends keyof Amenity>(id: string, field: K, value: Amenity[K]) => {
    setAmenities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const removeAmenity = (id: string) => {
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
          <TextBox
            label="Listing Title"
            name="title"
            value={form.title}
            required
            onChange={handleChange}
            placeholder="Enter listing title"
          />
          <TextBox
            label="Property (Building)"
            name="property"
            value={form.property}
            required
            onChange={handleChange}
            placeholder="Select building or property"
          />
          <TextBox
            label="Address"
            name="address"
            value={form.address}
            required
            onChange={handleChange}
            placeholder="Full property address"
          />
        </section>

        {/* Property Details */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Property Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <TextBox
              label="Rooms"
              type="number"
              name="rooms"
              value={String(form.rooms)}
              required
              onChange={handleChange}
              placeholder="Number of rooms"
            />
            <TextBox
              label="Bathrooms"
              type="number"
              name="bathrooms"
              value={String(form.bathrooms)}
              required
              onChange={handleChange}
              placeholder="Number of bathrooms"
            />
            <TextBox
              label="Beds"
              type="number"
              name="beds"
              value={String(form.beds)}
              required
              onChange={handleChange}
              placeholder="Number of beds"
            />
            <TextBox
              label="Max Occupants"
              type="number"
              name="maxOccupants"
              value={String(form.maxOccupants)}
              required
              onChange={handleChange}
              placeholder="Max occupants"
            />
            <TextBox
              label="Size (sqm)"
              type="number"
              name="size"
              value={String(form.size)}
              required
              onChange={handleChange}
              placeholder="Floor size in sqm"
            />
          </div>

          <div className="flex items-center gap-3 text-white/70">
            <input
              type="checkbox"
              name="roommatesAllowed"
              checked={form.roommatesAllowed}
              onChange={handleChange}
              className="accent-primary"
            />
            <label>Roommates allowed</label>
          </div>
        </section>

        {/* Pricing & Availability */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Pricing & Availability</h2>
          <TextBox
            label="Rent per person (£)"
            type="number"
            name="rent"
            value={String(form.rent)}
            required
            onChange={handleChange}
            placeholder="Rent per person"
          />
          <TextBox
            label="Available From"
            type="date"
            name="AvailableFrom"
            value={form.AvailableFrom ? new Date(form.AvailableFrom) : null}
            required
            onDateChange={handleDateChange}
            placeholder="Earliest availability"
          />
          <TextBox
            label="Minimum Stay (months)"
            type="number"
            name="minStay"
            value={String(form.minStay)}
            onChange={handleChange}
            placeholder="Minimum stay duration"
          />
        </section>

        {/* Description */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Description</h2>
          <TextBox
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            textarea
            placeholder="Enter listing description"
          />
        </section>

        {/* Amenities */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Amenities</h2>
            <button
              type="button"
              onClick={addAmenity}
              className="text-sm text-primary hover:underline"
            >
              + Add Amenity
            </button>
          </div>

          {amenities.length === 0 && (
            <p className="text-sm text-white/50">No amenities added</p>
          )}

          {amenities.map((a) => (
            <div key={a.id} className="border border-white/10 rounded-xl p-4 space-y-3 bg-black/20">

              {/* Amenity Type dropdown */}
              <TextBox
                label="Type"
                required
                type="select"
                value={a.type}
                onValueChange={(val) =>
                  updateAmenity(a.id, "type", val as AmenityType)
                }
                options={[
                  { label: "Healthcare", value: "HEALTHCARE" },
                  { label: "Transport", value: "TRANSPORT" },
                  { label: "Recreational", value: "RECREATIONAL" },
                  { label: "Other", value: "OTHER" },
                ]}
              />

              {/* Name */}
              <TextBox
                label="Name"
                value={a.name}
                onChange={(e) => updateAmenity(a.id, "name", e.target.value)}
                placeholder="Name of amenity"
              />

              {/* Distance radios
                  Amenity.distance is number, so we map DistanceRange labels
                  to representative midpoint numbers for storage             */}
              <div className="text-sm text-white/70 space-y-1">
                <p>Distance</p>
                <div className="flex gap-4">
                  {([["0-2", 1], ["2-5", 3], ["5-10", 7]] as [DistanceRange, number][]).map(
                    ([label, val]) => (
                      <label key={label} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`distance-${a.id}`}
                          checked={a.distance === val}
                          onChange={() => updateAmenity(a.id, "distance", val)}
                          className="accent-primary"
                        />
                        {label} km
                      </label>
                    )
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeAmenity(a.id)}
                className="text-xs text-red-400 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </section>

        {/* Images */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Images</h2>
            <button
              type="button"
              onClick={addImage}
              className="text-sm text-primary hover:underline"
            >
              + Add Image
            </button>
          </div>

          {images.length === 0 && (
            <p className="text-sm text-white/50">No images added</p>
          )}

          <div className="flex flex-wrap gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/10">
                <img src={img} className="w-full h-full object-cover" alt="" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 text-xs bg-black/70 px-1 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex-1 rounded-2xl bg-black/70 text-white py-3 font-semibold hover:bg-black/80"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 rounded-2xl bg-primary text-primary-foreground py-3 font-semibold hover:bg-primary/80"
          >
            Save Listing
          </button>
        </div>

      </form>
    </div>
  );
}