'use client'
import { useState } from "react";
import { ApplicationForm } from "../types";
import TextBox from "../components/TextBox";

// page where consultants can submit an application form for a specific listing

type SubmitApplicationPageProps={
    listingId: string;// id of the lisitng that this application procress applies towards
}

export default function SubmitApplicationPage({listingId}: SubmitApplicationPageProps){
  const [form, setForm] = useState<ApplicationForm>({
    name: "",
    email: "",
    phone: "",
    moveInDate: null,
    moveOutDate: null,
    notes: undefined,
  });

  const [specifyMoveOut, setSpecifyMoveOut] = useState<boolean>(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    console.log({
      ...form,
      moveOutDate: specifyMoveOut ? form.moveOutDate : null,
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8 space-y-4">
        <p className="text-xs text-white/50">* required fields</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextBox
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />

          <TextBox
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="email@example.com"
            required
          />

          <TextBox
            label="Phone Number"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+44 123 456 7890"
            required
          />

          <TextBox
            label="Intended Move-in Date"
            type="date"
            name="moveInDate"
            value={form.moveInDate}
            onDateChange={(date) =>
              setForm({ ...form, moveInDate: date ?? null })
            }
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
              <TextBox
                label="Expected Move-out Date"
                type="date"
                name="moveOutDate"
                value={form.moveOutDate}
                onDateChange={(date) =>
                  setForm({ ...form, moveInDate: date ?? null })
                }
              />
            )}
          </div>

          <TextBox
            label="Additional Notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Any additional information..."
            textarea
          />

          {/* Buttons */}
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
              className="flex-1 rounded-2xl bg-primary text-black py-3 font-semibold hover:bg-green-400"
            >
              Submit
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}