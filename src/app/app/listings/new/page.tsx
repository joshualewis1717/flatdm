'use client'
import { useEffect, useState } from "react";
import InputField from "../../applications/components/Submitform/UI/InputField";
import { PropertyListingForm, ExistingProperty, AmenityUI } from "../types";
import { AmenityType } from "@prisma/client";
import AddAmenitiesPanel from "../components/createForm/layout/AddAmenityPanel";
import AddImagesPanel from "../components/createForm/layout/AddImagePanel";
import AddThumbnailPanel from "../components/createForm/layout/AddThumbnailPanel";
import PropertySelector from "../components/createForm/UI/PropertySelector";
import { createListing } from "../prisma/clientServices";
import { useSessionContext } from "@/components/shared/app-frame";
import { useRouter } from "next/navigation";

// page for landlords to create a new listing
// Converts the user-selected range string to a representative number for persistence.


export default function NewListingsPage() {
  const [amenities, setAmenities] = useState<AmenityUI[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {isLandlord} = useSessionContext();
  const router = useRouter();

  const [selectedProperty, setSelectedProperty] = useState<ExistingProperty | null>(null);

  const [form, setForm] = useState<PropertyListingForm>({
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
  });

  /****** handlers **********/

  // handler to keep text input fields in sync with form state, also converts number inputs to actual numbers before storing in state
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>){
    const { name, type, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  // function to handle when a user selects a property from the property selector component, we autofill in the information
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

      // selector returned a property, we need to then map the amenities to our UI amenity draft type.
      if (property.hasExistingAmenities){
        setAmenities(property.amenities);
      } else {
        setAmenities([]);
      }
    } else {
      // reset the form if they deselect the property (go back to "new property" mode)
      setForm((prev) => ({
        ...prev,
        selectedPropertyId: undefined,
        streetName: "",
        city: "",
        postcode: "",
      }));
      setAmenities([]);
    }
  };

  // function to handle form submission, with validation to ensure a thumbnail is added before allowing submission. Converts amenity distance ranges to km values before sending to the backend.
  async function handleSubmit(e: React.SubmitEvent){
    e.preventDefault();
    setLoading(true);
  
    if (!thumbnail) {
      alert("Please add a thumbnail image before saving.");
      setLoading(false);
      return;
    }
    
    const { error } = await createListing({ ...form, thumbnail, images, amenities });
    setLoading(false);

    if (error) setError(error);
    else setSuccess(true);
  };


  // function to add in a new amenity to our form state
  function addAmenity(){
    setAmenities((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),// we need to generate a unique id for each amenity to keep track of them.
        // need a number instead of string since back end uses number id.
        type: "OTHER" as AmenityType,
        name: "",
        distance: -1, // default distance value indicating "not set", since 0 is a valid distance (within 1km)
      },
    ]);
  };

  // function to update a specific field of an amenity.
  function updateAmenity<K extends keyof AmenityUI>(id: string, field: K, value: AmenityUI[K]){
    setAmenities((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  // function to remove an amenity from our form state based on its id
  function removeAmenity(id: string){
    setAmenities((prev) => prev.filter((a) => a.id !== id));
  };

  // function to reset the form state
  function resetForm() {
    setForm({ buildingName: "",
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
      thumbnail: "", });
    setSelectedProperty(null);
    setAmenities([]);
    setImages([]);
    setThumbnail(null);
  }

  // function to add an image to form
  function addImage(){setImages((prev) => [...prev, "https://via.placeholder.com/150"])};// default image for testing

  // function to remove an image from form
  function removeImage(index: number){setImages((prev) => prev.filter((_, i) => i !== index))};

  useEffect(()=>{
    if (!isLandlord) router.replace('/')
  },[router, isLandlord])

  // very rough success alert using useEffect to trigger on success state change, can be improved with a proper toast notification system
  useEffect(()=>{
    if (success) {
      alert("Listing created successfully!");

      //reset everything 
      resetForm();
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    }
  }, [success])

  
  // very rough error alert using useEffect to trigger on success state change, can be improved with a proper toast notification system
  useEffect(()=>{
    if (error) {
      alert(error);
      setTimeout(() => {
        setError(null);
      }, 2000);
    }
  }, [error])

  if (!isLandlord) return null;

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

          <PropertySelector onSelect={handlePropertySelect} />
        </section>

        {/* address, merge all fields except for flat number into one string and store as address in db */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Basic Information</h2>
          <InputField
            label="building name"
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
            label="city"
            name="city"
            value={form.city ?? ""}
            onChange={handleChange}
            placeholder="e.g. London"
          />

          <InputField
            label="street name"
            name="streetName"
            value={form.streetName ?? ""}
            onChange={handleChange}
            placeholder="e.g. 250 Baker street"
          />

          <InputField
            label="postcode"
            name="postcode"
            value={form.postcode ?? ""}
            onChange={handleChange}
            placeholder="e.g. JK5 6DB"
          />
        </section>


        {/* Property Details */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Property Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="total Rooms" type="number" name="rooms" value={String(form.rooms)} required onChange={handleChange} placeholder="Total rooms" />
            <InputField label="Bedrooms" type="number" name="bedrooms" value={String(form.bedrooms)} required onChange={handleChange} placeholder="Number of bedrooms" />
            <InputField label="Bathrooms" type="number" name="bathrooms" value={String(form.bathrooms)} required onChange={handleChange} placeholder="Number of bathrooms" />
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
        selectedProperty={!!selectedProperty}
          amenities={amenities}
          onAdd={addAmenity}
          onRemove={removeAmenity}
          onUpdate={updateAmenity}
        />
        {loading && <p className="text-sm text-white/50">Saving listing...</p>}{/* replace with spinner later */}
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