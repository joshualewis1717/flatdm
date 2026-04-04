'use client'
import { useState } from "react";
import InputField from "../../application/components/InputField";
import { PropertyListingForm, AmenityDraft, AmenityType, DistanceRange, Amenity, ExistingProperty } from "../types";
import AddAmenitiesPanel from "../components/AddAmenityPanel";
import AddImagesPanel from "../components/AddImagePanel";
import AddThumbnailPanel from "../components/AddThumbnailPanel";
import PropertySelector from "../components/PropertySelector";

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

export default function NewListingsPage({ landlordId }: NewListingsPageProps) {
  const [amenities, setAmenities] = useState<AmenityDraft[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [amenityCounter, setAmenityCounter] = useState(0);

  const [selectedProperty, setSelectedProperty] = useState<ExistingProperty | null>(null);
  const isExistingProperty = selectedProperty?.hasExistingListings ?? false;

  const [form, setForm] = useState<PropertyListingForm>({
    buildingName: "",
    description: "",
    rent: 0,
    availableFrom: new Date(),
    rooms: 0,
    bedrooms: 0,
    bathrooms: 0,
    beds: 0,
    area: 0,
    maxOccupants: 1,
    minStay: 0,
    flatNumber: "",
    thumbnail: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setForm((prev) => ({ ...prev, availableFrom: date ?? prev.availableFrom }));
  };

  const handlePropertySelect = (property: ExistingProperty | null) => {
    setSelectedProperty(property);
    if (property) {
      setForm((prev) => ({ ...prev, selectedPropertyId: property.id }));
      if (property.hasExistingListings) {
        const drafts: AmenityDraft[] = property.amenities.map((a) => ({
          ...a,
          distance: null,
        }));
        setAmenities(drafts);
        setAmenityCounter(drafts.length);
      } else {
        setAmenities([]);
      }
    } else {
      setForm((prev) => ({ ...prev, selectedPropertyId: undefined }));
      setAmenities([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thumbnail) {
      alert("Please add a thumbnail image before saving.");
      return;
    }
    const resolvedAmenities: Amenity[] = amenities.map((a) => ({
      ...a,
      distance: a.distance ? DISTANCE_RANGE_TO_KM[a.distance] : 0,
    }));
    // Service layer splits this into Property + PropertyListing rows
    console.log({ ...form, thumbnail, images, amenities: resolvedAmenities });
  };

  const addAmenity = () => {
    setAmenities((prev) => [
      ...prev,
      {
        id: amenityCounter,
        propertyId: form.selectedPropertyId ?? 0,
        type: "OTHER" as AmenityType,
        name: "",
        distance: null,
      },
    ]);
    setAmenityCounter((c) => c + 1);
  };

  const updateAmenity = <K extends keyof AmenityDraft>(id: number, field: K, value: AmenityDraft[K]) => {
    setAmenities((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const removeAmenity = (id: number) => {
    setAmenities((prev) => prev.filter((a) => a.id !== id));
  };

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

        {/* Building selector */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Location</h2>
          <p className="text-xs text-white/50">
            Select a location you've registered before to autofill some information
          </p>

          <PropertySelector landlordId={landlordId} onSelect={handlePropertySelect} />

          {isExistingProperty && selectedProperty && (
            <div className="flex gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
              <span className="mt-0.5 text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />
                </svg>
              </span>
            </div>
          )}
        </section>

        {/* address, merge all fields except for flat number into one string and store as address in db */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Basic Information</h2>
          <InputField
            label="building name"
            name="title"
            value={form.buildingName}
            required
            onChange={handleChange}
            placeholder="Mary Land Hotel"
          />
          <div className="space-y-1">
            <InputField
              label="Flat Number"
              name="flatNumber"
              value={form.flatNumber ?? ""}
              onChange={handleChange}
              placeholder="e.g. 4B (leave blank if entire building)"
            />
            <p className="text-xs text-white/40 pl-1">
              Leave blank if this listing covers the entire building.
            </p>
          </div>
          <InputField
            label="city"
            name="city"
            value={form.flatNumber ?? ""}
            onChange={handleChange}
            placeholder="e.g. London"
          />

          <InputField
            label="street name"
            name="streeName"
            value={form.flatNumber ?? ""}
            onChange={handleChange}
            placeholder="e.g. 250 Baker street"
          />

          <InputField
            label="postcode"
            name="postCode"
            value={form.flatNumber ?? ""}
            onChange={handleChange}
            placeholder="e.g. JK5 6DB"
          />
        </section>


        {/* Property Details */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Property Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Rooms" type="number" name="rooms" value={String(form.rooms)} required onChange={handleChange} placeholder="Total rooms" />
            <InputField label="Bedrooms" type="number" name="bedrooms" value={String(form.bedrooms)} required onChange={handleChange} placeholder="Number of bedrooms" />
            <InputField label="Bathrooms" type="number" name="bathrooms" value={String(form.bathrooms)} required onChange={handleChange} placeholder="Number of bathrooms" />
            <InputField label="Beds" type="number" name="beds" value={String(form.beds)} required onChange={handleChange} placeholder="Number of beds" />
            <InputField label="Area (m²)" type="number" name="area" value={String(form.area)} required onChange={handleChange} placeholder="Floor area in m²" />
          </div>

          {/* Max Occupants with shared-tenancy notice */}
          <div className="space-y-2">
            <InputField
              label="Max Occupants"
              type="number"
              name="maxOccupants"
              value={String(form.maxOccupants)}
              required
              onChange={handleChange}
              placeholder="Max number of occupants"
            />
            {form.maxOccupants > 1 && (
              <div className="flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                <span className="mt-0.5 shrink-0 text-amber-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </span>
                <p className="text-xs text-amber-300/80">
                  Setting max occupants above 1 means this listing can be shared — for example,{" "}
                  {form.maxOccupants} separate people can each rent a room in this flat, with
                  each person paying their own rent individually.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Pricing & Availability */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Pricing & Availability</h2>
          <InputField label="Rent per person (£)" type="number" name="rent" value={String(form.rent)} required onChange={handleChange} placeholder="Rent per person per month" />
          <InputField label="Available From" type="date" name="availableFrom" value={form.availableFrom ?? null} required onDateChange={handleDateChange} placeholder="Earliest availability" />
          <InputField label="Minimum Stay (months)" type="number" name="minStay" value={String(form.minStay)} onChange={handleChange} placeholder="Minimum stay duration" />
        </section>

        {/* Description */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Description</h2>
          <InputField label="Description" name="description" type="textarea" value={form.description} onChange={handleChange} placeholder="Enter listing description" />
        </section>

        <AddThumbnailPanel thumbnail={thumbnail} onSet={setThumbnail} onRemove={() => setThumbnail(null)} />

        <AddImagesPanel images={images} onAdd={addImage} onRemove={removeImage} />

        <AddAmenitiesPanel
          amenities={amenities}
          onAdd={addAmenity}
          onRemove={removeAmenity}
          onUpdate={updateAmenity}
        />

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