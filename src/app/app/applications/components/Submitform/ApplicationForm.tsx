'use client'
import {useEffect, useState } from "react";
import type { ApplicationForm } from "../../types";
import InputField from "../../components/Submitform/UI/InputField";
import { getCurrentUserProfile, getExistingApplication, submitApplication } from "../../prisma/clientServices";
import { useSessionContext } from "@/components/shared/app-frame";
import { isValidPhoneNumber } from 'libphonenumber-js';
import { getListingById } from "@/app/app/listings/prisma/clientServices";
import { getListingTitle } from "@/app/app/logic/listing";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorMessage from "@/components/shared/ErrorMessage";
import SuccessMessage from "@/components/shared/SuccessMessage";
import { useRouter } from "next/navigation";


// page where consultants can submit an application form for a specific listing
// supports TWO modes: create mode and view mode, view mode is where application details are all prepopulated
// only the owner applicant and the respective landlord can see the details
// in create mode, the applicant can create and submit an application

type SubmitApplicationPageProps = {
  listingId?: number;// id of the lisitng that this application procress applies towards
  applicationId?: number;// optional application ID to see the form data in view only mode
};

export default function ApplicationForm({ listingId, applicationId}: SubmitApplicationPageProps) {
  const isViewMode = !!applicationId;
  const [readOnly, setReadOnly] = useState<boolean>(isViewMode);// if user is looking at this form in view mode, read only is true
  const [title, setTitle] = useState<string | null>(null);
  const [form, setForm] = useState<ApplicationForm>({
    moveInDate: null,
    moveOutDate: null,
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    message: "",
  });
  const [specifyMoveOut, setSpecifyMoveOut] = useState(false);
  const [loading, setLoading] = useState(false);// for submit button
  const [pageLoading, setPageLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {isConsultant, firstName, lastName, email} = useSessionContext();
  const router = useRouter();

  async function handleSubmit(e: React.SubmitEvent){
    e.preventDefault();
    setError(null);

    if(!listingId){
        setError("missing listing Id!!!")
        return;
    }

    if (!form.moveInDate || !form.firstName || !form.lastName || !form.email || !form.phoneNumber) {
      setError("One or more of the required fields are empty");
      return;
    }

    if (!isValidPhoneNumber(form.phoneNumber)){
      setError("invalid phone number format")
      return
    }

    setLoading(true);
    const { error } = await submitApplication( listingId, form.moveInDate, specifyMoveOut ? form.moveOutDate : null,
      form.phoneNumber, form.email, form.message);
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


  // use effect to retrieve necessary data in create mode
  useEffect(() => {
    async function fetchCreateModeDetails(){
      if (!isConsultant || !firstName || !lastName || isViewMode || !listingId) return;
      let phoneNumber = ""
    
      // fetch here to retrieve profile details for phone number
      const profileDetails = await getCurrentUserProfile();
      // the error here is not as important (if query fails, user can just type in phne number by themselves, so ignore error)
      if (profileDetails.result){
        phoneNumber = profileDetails.result.phone ?? "";
      }
      setPageLoading(true)
      setForm((prev) => ({
        ...prev,
        firstName: firstName ?? "",
        lastName: lastName ?? "",
        email: email ?? "",
        phoneNumber: phoneNumber
      }));

      const {result, error} = await getListingById(listingId.toString())
      if (error) setError(error)
      if(result){
        const listingTitle = getListingTitle(result.buildingName, result.flatNumber)
        setTitle(listingTitle)
      }
      setPageLoading(false)
  }
  fetchCreateModeDetails();
  }, [isConsultant]);


  // use effect to fetch application details if an application Id was submitted, sets form to view mode
  useEffect(()=>{
    async function fetchApplicationDetails(){
      if (!applicationId || !isViewMode) return

      setPageLoading(true);
      const {result, error} = await getExistingApplication(applicationId)
      if (error) setError(error);
      if(result){
        setForm((prev) => ({
            ...prev,
            firstName: result?.user.firstName ?? "",
            lastName: result?.user.lastName?? "",
            email: result?.user.email ?? "",
            phoneNumber: result?.phone ?? "",
            moveInDate: result?.moveInDate ? new Date(result.moveInDate) : null,
            moveOutDate: result?.moveOutDate ? new Date(result.moveOutDate) : null,
            message: result?.message ?? "",
          }));
    
          if (result?.moveOutDate){
            setSpecifyMoveOut(true)
          }
    
          const listingDetails = await getListingById(result.listingId.toString())// we need to also fetch building name, hence also fetch listing
          if (listingDetails.result){
            setTitle(getListingTitle(listingDetails.result.buildingName, listingDetails.result.flatNumber))
          }
    
      }

      setReadOnly(true)
      setPageLoading(false)

    }

    fetchApplicationDetails();
  }, [applicationId])// only do it when application id changes

  useEffect(()=>{
    if (success){
      setTimeout(()=>{
        setSuccess(false);
        router.push('/app/applications/dashboard')
      }, 3000)
    }
  }, [success])
  
  if (success) {
    return (
      <SuccessMessage position="top" text="Application Submitted"/>
    );
  }


  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-6">
      <h1 className="font-bold text-5xl text-center">Submit Application</h1>

      {/* Page-level loading state */}
      {pageLoading && <LoadingSpinner text="Loading application details…" />}

      {!pageLoading && (
        <>

          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                  {title}
          </h2>
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8 space-y-4">
            <div className="flex gap-x-2">
              <p className="text-red-500">*</p>
              <p className="text-xs text-white/50">indicates required fields</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/*TODO: make name be read only */}
              <InputField
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="enter first name"
                required
                readOnly={true}
              />

              <InputField
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="enter last name"
                required
                readOnly={true}
              />

              <InputField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="enter email address"
                required
                readOnly={readOnly}
              />

              <InputField
                label="Phonenumber"
                name="phoneNumber"
                type="tel"
                value={form.phoneNumber}
                onValueChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    phoneNumber: val,
                  }))
                }
                required
                readOnly={readOnly}
              />

              <InputField
                label="Intended Move-in Date"
                type="date"
                name="moveInDate"
                value={form.moveInDate}
                onDateChange={(date) => setForm({ ...form, moveInDate: date ?? null })}
                placeholder="dd/mm/yyyy"
                required
                readOnly={readOnly}
              />

                {/* Optional move-out */}
              <div className="flex flex-col space-y-2">
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={specifyMoveOut}
                    onChange={() => setSpecifyMoveOut((prev) => !prev)}
                    className="accent-primary"
                    readOnly={readOnly}
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
                    readOnly={readOnly}
                  />
                )}
              </div>

              <InputField
                label="Optional Message?"
                type="textarea"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="please enter any optional info that you want to tell landlord..."
                readOnly={readOnly}
              />

              {/* Inline form submission errors */}
              {error && <ErrorMessage text={error} />}

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="flex-1 rounded-2xl bg-black/70 text-white py-3 font-semibold hover:bg-black/80"
                >
                  Back
                </button>

                {!readOnly && (
                  <button
                    type="submit"
                    disabled={loading || readOnly}
                    className="flex-1 rounded-2xl bg-primary text-black py-3 font-semibold hover:bg-green-400 disabled:opacity-50"
                  >
                  {loading ? "Submitting…" : "Submit"}
                </button>
                )}
              </div>
            </form>
          </section>
        </>
      )}
    </div>
  );
}