'use client'
import { useEffect, useState } from "react";
import InputField from "@/app/app/applications/components/Submitform/UI/InputField";
import { PropertyListingForm, ExistingProperty, AmenityUI } from "../../types";
import { AmenityType } from "@prisma/client";
import AddAmenitiesPanel from "../../components/createForm/layout/AddAmenityPanel";
import AddImagesPanel from "../../components/createForm/layout/AddImagePanel";
import AddThumbnailPanel from "../../components/createForm/layout/AddThumbnailPanel";
import PropertySelector from "../../components/createForm/UI/PropertySelector";
import { createListing, updateListing, getListingById } from "../../prisma/clientServices";
import { useSessionContext } from "@/components/shared/app-frame";
import { useRouter } from "next/navigation";

type Props = {
  /** If provided → edit mode: load existing listing and update on submit */
  listingId?: number;
};

const EMPTY_FORM: PropertyListingForm = {
  buildingName: "",
  description: "",
  rent: 0,
  availableFrom: new Date(),
  rooms: 0,
  bedrooms: 0,
  bathrooms: 0,
  area: 0,
  maxOccupants: 1,
  minStay: 0,
  flatNumber: "",
  thumbnail: "",
};

export default function ListingForm({ listingId }: Props) {
  const isEditMode = !!listingId;

  const [amenities, setAmenities] = useState<AmenityUI[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode); // show spinner while fetching in edit mode
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { isLandlord } = useSessionContext();
  const router = useRouter();

  // Keep a stable key for PropertySelector so we can force-remount it on reset
  const [selectorKey, setSelectorKey] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<ExistingProperty | null>(null);
  const [form, setForm] = useState<PropertyListingForm>(EMPTY_FORM);

  /****** edit-mode: prefill ********/

  useEffect(() => {
    if (!isEditMode) return;

    async function fetchListing() {
      setPageLoading(true);
      const { result, error } = await getListingById(listingId!.toString());
      if (error) {
        setError(error);
        setPageLoading(false);
        return;
      }
      if (result) {
        const flatNumber = result.flatNumber === "WHOLE_PROPERTY" ? "" : (result.flatNumber ?? "");
        setForm({
          selectedPropertyId: result.propertyId,
          buildingName: result.buildingName,
          streetName: result.streetName,
          city: result.city,
          postcode: result.postcode,
          flatNumber,
          description: result.description,
          rent: result.rent,
          availableFrom: new Date(), // ignored, will be removed from DB
          rooms: result.totalRooms,
          bedrooms: result.bedrooms,
          bathrooms: result.bathrooms,
          area: result.area,
          maxOccupants: result.maxOccupants,
          minStay: result.minStay,
          thumbnail: result.thumbnail ?? "",
        });
        setThumbnail(result.thumbnail ?? null);
        setImages(result.images ?? []);
        setAmenities(result.amenities ?? []);
      }
      setPageLoading(false);
    }

    fetchListing();
  }, [listingId]);

  /****** redirect guard ********/

  useEffect(() => {
    if (!isLandlord) router.replace("/");
  }, [router, isLandlord]);

  /****** success / error side-effects ********/

  useEffect(() => {
    if (success) {
      alert(isEditMode ? "Listing updated successfully!" : "Listing created successfully!");
      if (!isEditMode) resetForm();
      setTimeout(() => setSuccess(false), 2000);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      alert(error);
      setTimeout(() => setError(null), 2000);
    }
  }, [error]);

  /****** handlers ********/

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, type, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  function handlePropertySelect(property: ExistingProperty | null) {
    setSelectedProperty(property);
    if (property) {
      setForm((prev) => ({
        ...prev,
        selectedPropertyId: property.id,
        buildingName: property.buildingName,
        streetName: property.streetName,
        city: property.city,
        postcode: property.postcode,
        flatNumber: "",
      }));
      setAmenities(property.hasExistingAmenities ? property.amenities : []);
    } else {
      setForm((prev) => ({
        ...prev,
        selectedPropertyId: undefined,
        streetName: "",
        city: "",
        postcode: "",
      }));
      setAmenities([]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (!thumbnail) {
      alert("Please add a thumbnail image before saving.");
      setLoading(false);
      return;
    }

    const payload = { ...form, thumbnail, images, amenities };

    const { error } = isEditMode
      ? await updateListing(listingId!, payload)
      : await createListing(payload);

    setLoading(false);
    if (error) setError(error);
    else setSuccess(true);
  }

  function addAmenity() {
    setAmenities((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "OTHER" as AmenityType,
        name: "",
        distance: -1,
      },
    ]);
  }

  function updateAmenity<K extends keyof AmenityUI>(id: string, field: K, value: AmenityUI[K]) {
    setAmenities((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  }

  function removeAmenity(id: string) {
    setAmenities((prev) => prev.filter((a) => a.id !== id));
  }

  function addImage() {
    setImages((prev) => [...prev, "https://via.placeholder.com/150"]);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setSelectedProperty(null);
    setAmenities([]);
    setImages([]);
    setThumbnail(null);
    // Force the PropertySelector to remount so its internal state clears too
    setSelectorKey((k) => k + 1);
  }

  /****** render guards ********/

  if (!isLandlord) return null;

  if (pageLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 sm:p-8 text-center">
        <p className="text-white/50 text-sm">Loading listing…</p>
      </div>
    );
  }

  /****** render ********/

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-6">
      <h1 className="font-bold text-5xl text-center">
        {isEditMode ? "Edit Listing" : "Create Listing"}
      </h1>

      <div className="flex gap-x-2 items-center">
        <p className="text-red-500">*</p>
        <p className="text-xs text-white/50">indicates required fields</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>

        {/* Property selector — shown in both modes */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Location</h2>
          <p className="text-xs text-white/50">
            {isEditMode
              ? "Select a different registered property to reassign this listing, or edit the address fields below directly."
              : "Select a location you've registered before to autofill some information."}
          </p>
          {/* key prop forces full remount on reset (create mode), clearing selector's internal state */}
          <PropertySelector
            key={selectorKey}
            onSelect={handlePropertySelect}
            initialPropertyId={isEditMode ? form.selectedPropertyId : undefined}
          />
        </section>

        {/* Basic information */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Basic Information</h2>
          <InputField
            label="Building name"
            name="buildingName"
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
            label="City"
            name="city"
            value={form.city ?? ""}
            onChange={handleChange}
            placeholder="e.g. London"
          />
          <InputField
            label="Street name"
            name="streetName"
            value={form.streetName ?? ""}
            onChange={handleChange}
            placeholder="e.g. 250 Baker Street"
          />
          <InputField
            label="Postcode"
            name="postcode"
            value={form.postcode ?? ""}
            onChange={handleChange}
            placeholder="e.g. JK5 6DB"
          />
        </section>

        {/* Property details */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Property Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Total Rooms" type="number" name="rooms" value={String(form.rooms)} required onChange={handleChange} placeholder="Total rooms" />
            <InputField label="Bedrooms" type="number" name="bedrooms" value={String(form.bedrooms)} required onChange={handleChange} placeholder="Number of bedrooms" />
            <InputField label="Bathrooms" type="number" name="bathrooms" value={String(form.bathrooms)} required onChange={handleChange} placeholder="Number of bathrooms" />
            <InputField label="Area (m²)" type="number" name="area" value={String(form.area)} required onChange={handleChange} placeholder="Floor area in m²" />
          </div>

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
                  {form.maxOccupants} separate people can each rent a room in this flat, with each person paying their own rent individually.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Pricing & availability */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Pricing & Availability</h2>
          <InputField label="Rent per person (£)" type="number" name="rent" value={String(form.rent)} required onChange={handleChange} placeholder="Rent per person per month" />
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
          selectedProperty={!!selectedProperty || isEditMode}
          amenities={amenities}
          onAdd={addAmenity}
          onRemove={removeAmenity}
          onUpdate={updateAmenity}
        />

        {loading && <p className="text-sm text-white/50">Saving listing…</p>}

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
            disabled={loading}
            className="flex-1 rounded-2xl bg-primary text-primary-foreground py-3 font-semibold hover:bg-primary/80 disabled:opacity-50"
          >
            {isEditMode ? "Save Changes" : "Save Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}