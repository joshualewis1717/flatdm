'use client'

import { useEffect, useState } from "react";
import EmptyState from "../components/dashboard/UI/generic/EmptyState";
import DashboardSection from "../components/dashboard/layout/DashboardSection";
import Divider from "../components/dashboard/layout/Divider";
import ApplicantCard from "../components/dashboard/UI/userCards/ApplicantCard";
import ConfirmedCard from "../components/dashboard/UI/userCards/ConfirmedCard";
import LandlordCard from "../components/dashboard/UI/userCards/LandlordCard";
import { Application } from "../types";
import { getApplicationsForApplicant, getApplicationsForLandlord, withdrawApplication, updateApplicationStatus, respondToOffer,
} from "../prisma/clientServices";
import { useSessionContext } from "@/components/shared/app-frame";
// main page for landlords and consultants to see their applications and interact with them in various ways

type Props = {
  applicantId?: number;
  landlordId?: number;
};

export default function ApplicationDashBoardPage({ applicantId=5, landlordId }: Props) {

  const {isConsultant, isLandlord} = useSessionContext();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (isConsultant && applicantId) {
        const data = await getApplicationsForApplicant();
        setApps(data);
      } else if (isLandlord && landlordId) {
        const data = await getApplicationsForLandlord();
        setApps(data);
      }
      setLoading(false);
    };
    fetch();
  }, [applicantId, landlordId]);

  // optimistically remove or update an application in local state
  const removeApp = (id: number) =>
    setApps((prev) => prev.filter((a) => a.id !== id));

  const updateApp = (id: number, status: Application["status"]) =>
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

  const handleApplicantAction = async (id: number, action: "accept" | "reject" | "withdraw") => {
    if (action === "withdraw") {
      await withdrawApplication(id);
      removeApp(id);
    } else if (action === "accept") {
      await respondToOffer(id, true);
      updateApp(id, "CONFIRMED");
    } else if (action === "reject") {
      await respondToOffer(id, false);
      updateApp(id, "REJECTED");
    }
  };

  const handleLandlordAction = async (id: number, action: "accept" | "reject") => {
    if (action === "accept") {
      await updateApplicationStatus(id, "APPROVED");
      updateApp(id, "APPROVED");
    } else {
      await updateApplicationStatus(id, "REJECTED");
      updateApp(id, "REJECTED");
    }
  };

  if (loading) return <p className="text-sm text-white/40 p-8">Loading applications…</p>;

  const appOffers    = apps.filter(a => a.status === "APPROVED");
  const appPending   = apps.filter(a => a.status === "PENDING");
  const appConfirmed = apps.filter(a => a.status === "CONFIRMED");
  const appRejected  = apps.filter(a => a.status === "REJECTED");

  const llIncoming  = apps.filter(a => a.status === "PENDING");
  const llOffers    = apps.filter(a => a.status === "APPROVED");
  const llConfirmed = apps.filter(a => a.status === "CONFIRMED");

  return (
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

        {/* ── APPLICANT VIEW ── */}
        {isConsultant && (
          <>
            {appOffers.length > 0 && (
              <>
                <DashboardSection title="Action Required" subtitle="Respond before offers expire" count={appOffers.length}>
                  {appOffers.map(app => <ApplicantCard key={app.id} application={app} onAction={handleApplicantAction} />)}
                </DashboardSection>
                <Divider />
              </>
            )}

            <DashboardSection title="In Progress" subtitle="Awaiting landlord decision" count={appPending.length}>
              {appPending.length === 0
                ? <EmptyState label="No active applications" />
                : appPending.map(app => <ApplicantCard key={app.id} application={app} onAction={handleApplicantAction} />)
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
                : appRejected.map(app => <ApplicantCard key={app.id} application={app} onAction={handleApplicantAction} />)
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
                : llIncoming.map(app => <LandlordCard key={app.id} app={app} onAction={handleLandlordAction} />)
              }
            </DashboardSection>

            <Divider />

            <DashboardSection title="Pending Offers" subtitle="Waiting for applicant response" count={llOffers.length}>
              {llOffers.length === 0
                ? <EmptyState label="No outstanding offers" />
                : llOffers.map(app => <LandlordCard key={app.id} app={app} onAction={handleLandlordAction} />)
              }
            </DashboardSection>

            <Divider />

            <DashboardSection title="Confirmed Tenants" subtitle="Offers accepted" count={llConfirmed.length}>
              {llConfirmed.length === 0
                ? <EmptyState label="No confirmed tenants yet" />
                : llConfirmed.map(app => <LandlordCard key={app.id} app={app} onAction={handleLandlordAction} />)
              }
            </DashboardSection>
          </>
        )}

      </div>
    </div>
  );
}