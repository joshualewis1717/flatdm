'use client'

import EmptyState from "../components/dashboard/generic/EmptyState";
import DashboardSection from "../components/dashboard/layout/DashboardSection";
import Divider from "../components/dashboard/layout/Divider";
import ApplicantCard from "../components/dashboard/userCards/ApplicantCard";
import ConfirmedCard from "../components/dashboard/userCards/ConfirmedCard";
import LandlordCard from "../components/dashboard/userCards/LandlordCard";
import { Application } from "../types";
// main page for landlords and consultants to see their applications and interact with them in various ways

type Props = {
  applicantId?: number;
  landlordId?: number;
};

// example data for testing UI

const APPLICANT_APPS: Application[] = [
  {
    id: 1,
    listingName: "Downtown Studio",
    listingAddress: "12 Canal Street, Manchester",
    applicantName: "Alice Smith",
    landlordName: "James Whitfield",
    status: "PENDING",
    submittedDate: "14 Mar 2026",
    rent: 1250,
  },
  {
    id: 10,
    listingName: "Downtown Studio",
    listingAddress: "12 Canal Street, Manchester",
    applicantName: "Alice Smith",
    landlordName: "James Whitfield",
    status: "PENDING",
    submittedDate: "14 Mar 2026",
    rent: 1250,
  },
  {
    id: 2,
    listingName: "City Apartment",
    listingAddress: "4 Deansgate, Manchester",
    applicantName: "Alice Smith",
    landlordName: "Sarah Chen",
    status: "ACCEPTED",
    submittedDate: "10 Mar 2026",
    lastUpdatedDate: "18 Mar 2026",
    expiryDate: "2026-03-24",
    rent: 1800,
  },
  {
    id: 3,
    listingName: "Northern Quarter Flat",
    listingAddress: "7 Tib Street, Manchester",
    applicantName: "Alice Smith",
    landlordName: "Marcus Osei",
    status: "REJECTED",
    submittedDate: "5 Mar 2026",
    lastUpdatedDate: "12 Mar 2026",
    rent: 1450,
  },
  {
    id: 4,
    listingName: "Castlefield Loft",
    listingAddress: "22 Liverpool Road, Manchester",
    applicantName: "Alice Smith",
    landlordName: "Priya Nair",
    status: "CONFIRMED",
    submittedDate: "1 Feb 2026",
    lastUpdatedDate: "20 Feb 2026",
    moveInDate: "1 Apr 2026",
    rent: 1650,
  },
];

const LANDLORD_APPS: Application[] = [
  {
    id: 5,
    listingName: "Ancoats Terrace",
    listingAddress: "3 Bengal Street, Manchester",
    applicantName: "Tom Richards",
    status: "PENDING",
    submittedDate: "16 Mar 2026",
    rent: 1100,
  },
  {
    id: 6,
    listingName: "Salford Quays Flat",
    listingAddress: "18 Quay St, Salford",
    applicantName: "Mei Lin",
    status: "ACCEPTED",
    submittedDate: "12 Mar 2026",
    lastUpdatedDate: "19 Mar 2026",
    expiryDate: "2026-03-23",
    rent: 1350,
  },
  {
    id: 7,
    listingName: "Oxford Road Studio",
    listingAddress: "55 Oxford Rd, Manchester",
    applicantName: "David Park",
    status: "CONFIRMED",
    submittedDate: "20 Jan 2026",
    lastUpdatedDate: "28 Jan 2026",
    moveInDate: "1 Apr 2026",
    rent: 950,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApplicationDashBoardPage({ applicantId =1, landlordId}: Props) {
  const isApplicant = !!applicantId;
  const isLandlord  = !!landlordId;

  const noop = () => {};

  const appOffers    = APPLICANT_APPS.filter(a => a.status === 'ACCEPTED');
  const appPending   = APPLICANT_APPS.filter(a => a.status === 'PENDING');
  const appConfirmed = APPLICANT_APPS.filter(a => a.status === 'CONFIRMED');
  const appRejected  = APPLICANT_APPS.filter(a => a.status === 'REJECTED');

  const llIncoming  = LANDLORD_APPS.filter(a => a.status === 'PENDING');
  const llOffers    = LANDLORD_APPS.filter(a => a.status === 'ACCEPTED');
  const llConfirmed = LANDLORD_APPS.filter(a => a.status === 'CONFIRMED');

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-4xl mx-auto px-5 py-10 sm:px-8 sm:py-14 space-y-10">

        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {isLandlord ? 'Manage Applications' : 'My Applications'}
          </h1>
          <p className="text-white/40 text-sm">
            {isLandlord
              ? 'Review applicants, make offers, and track confirmed tenants.'
              : 'Track your applications, respond to offers, and manage your next move.'}
          </p>
        </div>

        {/* ── APPLICANT VIEW ── */}
        {isApplicant && (
          <>
            {appOffers.length > 0 && (
              <>
                <DashboardSection title="Action Required" subtitle="Respond before offers expire" count={appOffers.length}>
                  {appOffers.map(app => <ApplicantCard key={app.id} application={app} onAction={noop} />)}
                </DashboardSection>
                <Divider />
              </>
            )}

            <DashboardSection title="In Progress" subtitle="Awaiting landlord decision" count={appPending.length}>
              {appPending.length === 0
                ? <EmptyState label="No active applications" />
                : appPending.map(app => <ApplicantCard key={app.id} application={app} onAction={noop} />)
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
                : appRejected.map(app => <ApplicantCard key={app.id} application={app} onAction={noop} />)
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
                : llIncoming.map(app => <LandlordCard key={app.id} app={app} onAction={noop} />)
              }
            </DashboardSection>

            <Divider />

            <DashboardSection title="Pending Offers" subtitle="Waiting for applicant response" count={llOffers.length}>
              {llOffers.length === 0
                ? <EmptyState label="No outstanding offers" />
                : llOffers.map(app => <LandlordCard key={app.id} app={app} onAction={noop} />)
              }
            </DashboardSection>

            <Divider />

            <DashboardSection title="Confirmed Tenants" subtitle="Offers accepted" count={llConfirmed.length}>
              {llConfirmed.length === 0
                ? <EmptyState label="No confirmed tenants yet" />
                : llConfirmed.map(app => <LandlordCard key={app.id} app={app} onAction={noop} />)
              }
            </DashboardSection>
          </>
        )}

      </div>
    </div>
  );
}