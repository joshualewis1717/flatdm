'use client'

import { useEffect, useState } from "react";
import EmptyState from "../components/dashboard/UI/generic/EmptyState";
import DashboardSection from "../components/dashboard/layout/DashboardSection";
import Divider from "../components/dashboard/layout/Divider";
import ApplicantCard from "../components/dashboard/UI/userCards/ApplicantCard";
import ConfirmedCard from "../components/dashboard/UI/userCards/ConfirmedCard";
import LandlordCard from "../components/dashboard/UI/userCards/LandlordCard";
import { Application } from "../types";
import { getApplicationsForApplicant, getApplicationsForLandlord, updateApplicationStatus, respondToOffer,
} from "../prisma/clientServices";
import { useSessionContext } from "@/components/shared/app-frame";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorMessage from "@/components/shared/ErrorMessage";
import ConfirmModal, { ButtonVariant } from "@/components/shared/ConfirmModal";
// main page for landlords and consultants to see their applications and interact with them in various ways

// different actions users can do in dahsboard (merges appplicant and landlord for action)
// used for modal
type PendingAction = {
  id: number;
  action: "accept" | "reject" | "withdraw";
  title: string;// title of modal
  description: string;// description of modal
  confirmVariant?: ButtonVariant; // default is error variant for modal
};

export default function ApplicationDashBoardPage() {

  const {isConsultant, isLandlord} = useSessionContext();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);// loading for the entire page for when it loads
  const [actionLoading, setActionLoading] = useState(false);// loading for when a button is clicked and it is fetching from db
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);// what action is user trying to do specifically

  useEffect(() => {
    const fetch = async () => {
      if (isConsultant) {
        const {result, error} = await getApplicationsForApplicant();
        if (error) setError(error);
        else setApps(result ?? []);
      } else if (isLandlord) {
        const { result, error } = await getApplicationsForLandlord();
        if (error) setError(error);
        else setApps(result ?? []);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  // optimistically remove or update an application in local state
  function updateApp(id: number, status: Application["status"]){
  setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
};

// update UI to confirm one application and auto reject othetrs
function confirmAppAndRejectOthers(confirmedId: number){
  setApps((prev) =>
    prev.map((a) => {
      if (a.id === confirmedId) {
        return { ...a, status: "CONFIRMED" };
      }

      // only update active ones
      if (a.status === "PENDING" || a.status === "APPROVED") {
        return { ...a, status: "WITHDRAWN" };
      }

      return a;
    })
  );
};


// different actions that an applicant can do
async function handleApplicantAction(id: number, action: "accept" | "reject" | "withdraw"){
  if (action === "withdraw") {
    const { error } = await respondToOffer(id, "WITHDRAWN");
    if (error) setError(error);
    else updateApp(id, "WITHDRAWN");
  } else if (action === "accept") {
    const { error } = await respondToOffer(id, "CONFIRMED");
    if (error) setError(error);
    else confirmAppAndRejectOthers(id);
  } else if (action === "reject") {
    const { error } = await respondToOffer(id, "REJECTED");
    if (error) setError(error);
    else updateApp(id, "REJECTED");
  }
};

// different actions that a alandlord can do
async function handleLandlordAction (id: number, action: "accept" | "reject"){
  if (action === "accept") {
    const { error } = await updateApplicationStatus(id, "APPROVED");
    if (error) setError(error);
    else updateApp(id, "APPROVED");
  } else {
    const { error } = await updateApplicationStatus(id, "REJECTED");
    if (error) setError(error);
    else updateApp(id, "REJECTED");
  }
};

//function for applicants to open a confirm modal and map each eaction to different titles + text + hanlders.
function queueApplicantAction(id: number, action: "accept" | "reject" | "withdraw") {
  const config = {
    accept:   { title: "Accept Offer?", description: "This will confirm your tenancy and withdraw all other applications.",  confirmVariant: "success" as const },
    reject:   { title: "Reject Offer?", description: "You won't be able to undo this." },
    withdraw: { title: "Withdraw Application?", description: "Your application will be permanently withdrawn." },
  }[action];
  setPendingAction({ id, action, ...config });
}

// function for landlord to open a confirm modal and map each section to different tiles + text + handlers
function queueLandlordAction(id: number, action: "accept" | "reject") {
  const config = {
    accept: { title: "Approve Application?", description: "An offer will be sent to this applicant.",  confirmVariant: "success" as const},
    reject: { title: "Reject Application?", description: "This applicant will be notified." },
  }[action];
  setPendingAction({ id, action, ...config });
}


// function to handle when the modal is confirmed
async function handleConfirm() {
  if (!pendingAction) return;
  const { id, action } = pendingAction;

  if (action === "withdraw" || action === "accept" || action === "reject") {
    setActionLoading(true)
    if (isConsultant) await handleApplicantAction(id, action);// use applicant handler
    else if(isLandlord) await handleLandlordAction(id, action as "accept" | "reject");// use the landlord handler
    setActionLoading(false)
    setPendingAction(null); // close modal immediately, handler manages its own error state
  }
}
  if (loading) return <LoadingSpinner text="Loading your applications…" />;

  //consultant view
  const appOffers    = apps.filter(a => a.status === "APPROVED");
  const appPending   = apps.filter(a => a.status === "PENDING");
  const appConfirmed = apps.filter(a => a.status === "CONFIRMED");
  const appRejected  = apps.filter(a => a.status === "REJECTED" || a.status == 'WITHDRAWN');

  //landlord view
  const llIncoming  = apps.filter(a => a.status === "PENDING");
  const llOffers    = apps.filter(a => a.status === "APPROVED");
  const llConfirmed = apps.filter(a => a.status === "CONFIRMED");
  const llClosed = apps.filter(
    a => a.status === "REJECTED" || a.status === "WITHDRAWN"
  );

  return (
    <>
      <div className="min-h-screen bg-[var(--background)]">
        <div className="max-w-4xl mx-auto px-5 py-10 sm:px-8 sm:py-14 space-y-10">

          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {isLandlord ? "Manage Applications" : "My Applications"}
            </h1>
            <p className="text-white/40 text-sm">
              {isLandlord
                ? "Review applicants, make offers, and track confirmed tenants."
                : "Track your applications, respond to offers, and manage your next move."}
            </p>
          </div>

          {/* Action-level error banner, shown when an accept/reject/withdraw action fails */}
          {error && <ErrorMessage text={error} />}

          {/* ── APPLICANT VIEW ── */}
          {isConsultant && (
            <>
              {appOffers.length > 0 && (
                <>
                  <DashboardSection title="Action Required" subtitle="Respond before offers expire" count={appOffers.length}>
                    {appOffers.map(app => <ApplicantCard key={app.id} application={app} onAction={queueApplicantAction} />)}
                  </DashboardSection>
                  <Divider />
                </>
              )}

              <DashboardSection title="In Progress" subtitle="Awaiting landlord decision" count={appPending.length}>
                {appPending.length === 0
                  ? <EmptyState label="No active applications" />
                  : appPending.map(app => <ApplicantCard key={app.id} application={app} onAction={queueApplicantAction} />)
                }
              </DashboardSection>

              <Divider />

              {appConfirmed.length > 0 && (
                <>
                  <ConfirmedCard app={appConfirmed[0]} />
                  <Divider />
                </>
              )}

              <DashboardSection title="Rejected or Withdrawn" count={appRejected.length}>
                {appRejected.length === 0
                  ? <EmptyState label="Nothing here yet" />
                  : appRejected.map(app => <ApplicantCard key={app.id} application={app} onAction={queueApplicantAction} />)
                }
              </DashboardSection>
            </>
          )}

          {/* ── LANDLORD VIEW ── */}
          {isLandlord && (
            <>
              <DashboardSection title="Incoming Applications" subtitle="Review and decide" count={llIncoming.length}>
                {llIncoming.length === 0
                  ? <EmptyState label="No new applications" />
                  : llIncoming.map(app => <LandlordCard key={app.id} app={app} onAction={queueLandlordAction} />)
                }
              </DashboardSection>

              <Divider />

              <DashboardSection title="Pending Offers" subtitle="Waiting for applicant response" count={llOffers.length}>
                {llOffers.length === 0
                  ? <EmptyState label="No outstanding offers" />
                  : llOffers.map(app => <LandlordCard key={app.id} app={app} onAction={queueLandlordAction} />)
                }
              </DashboardSection>

              <Divider />

              <DashboardSection title="Confirmed Tenants" subtitle="Offers accepted" count={llConfirmed.length}>
                {llConfirmed.length === 0
                  ? <EmptyState label="No confirmed tenants yet" />
                  : llConfirmed.map(app => <LandlordCard key={app.id} app={app} onAction={queueLandlordAction} />)
                }
              </DashboardSection>

              <DashboardSection title="Closed Applications" count={llClosed.length}>
              {llClosed.length === 0
                ? <EmptyState label="Nothing here yet" />
                : llClosed.map(app => (
                    <LandlordCard key={app.id} app={app} onAction={queueLandlordAction} />
                  ))
              }
            </DashboardSection>
            </>
          )}

        </div>
      </div>

      {pendingAction && (
        <ConfirmModal
          title={pendingAction.title}
          description={pendingAction.description}
          onConfirm={handleConfirm}
          onCancel={() => setPendingAction(null)}
          loading={actionLoading}
          confirmVariant={pendingAction.confirmVariant}
        />
      )}
    </>
  );
}