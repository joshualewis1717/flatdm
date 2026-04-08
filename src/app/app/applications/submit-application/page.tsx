'use client'
import {useState } from "react";
import { ApplicationForm } from "../types";
import InputField from "../components/Submitform/UI/InputField";
import { submitApplication } from "../prisma/clientServices";
import { useSessionContext } from "@/components/shared/app-frame";


// page where consultants can submit an application form for a specific listing

type SubmitApplicationPageProps = {
  listingId: number;// id of the lisitng that this application procress applies towards
};

export default function SubmitApplicationPage({ listingId = 20 }: SubmitApplicationPageProps) {
  const [form, setForm] = useState<ApplicationForm>({
    moveInDate: null,
    moveOutDate: null,
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [specifyMoveOut, setSpecifyMoveOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {isConsultant} = useSessionContext();

  async function handleSubmit(e: React.SubmitEvent){
    e.preventDefault();
    setError(null);

    if (!form.moveInDate || !form.firstName || !form.lastName || !form.email || !form.phoneNumber) {
      setError("One or more of the required fields are empty");
      return;
    }

    setLoading(true);
    const { error } = await submitApplication(
      listingId,
      form.moveInDate,
      specifyMoveOut ? form.moveOutDate : null
    );
    setLoading(false);

    if (error) {
      setError(error);
    } else {
      setSuccess(true);
    }
  };

  // function to keep track of text input fields with UI
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
  
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }


  if (success) {
    return (
      <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-6 text-center">
        <h1 className="font-bold text-5xl">Application Submitted</h1>
        <p className="text-white/50 text-sm">Your application has been sent. You'll hear back soon.</p>
      </div>
    );
  }


  if (!isConsultant || !listingId) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-6">
      <h1 className="font-bold text-5xl text-center">Submit Application</h1>
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8 space-y-4">
        <div className="flex gap-x-2">
          <p className="text-red-500">*</p>
          <p className="text-xs text-white/50">indicates required fields</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="enter first name"
            required
          />

          <InputField
            label="Last Name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="enter last name"
            required
          />

          <InputField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="enter email address"
            required
          />

          <InputField
            label="Phonenumber"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="please enter phoneNumber"
            required
          />

          <InputField
            label="Intended Move-in Date"
            type="date"
            name="moveInDate"
            value={form.moveInDate}
            onDateChange={(date) => setForm({ ...form, moveInDate: date ?? null })}
            placeholder="dd/mm/yyyy"
            required
          />

             {/* Optional move-out */}
          <div className="flex flex-col space-y-2">
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={specifyMoveOut}
                onChange={() => setSpecifyMoveOut((prev) => !prev)}
                className="accent-primary"
              />
              Specify expected move-out date
            </label>

            {specifyMoveOut && (
              <InputField
                label="Expected Move-out Date"
                type="date"
                name="moveOutDate"
                value={form.moveOutDate}
                onDateChange={(date) => setForm({ ...form, moveOutDate: date ?? null })}
              />
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-4 pt-2">
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
              className="flex-1 rounded-2xl bg-primary text-black py-3 font-semibold hover:bg-green-400 disabled:opacity-50"
            >
              {loading ? "Submitting…" : "Submit"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}