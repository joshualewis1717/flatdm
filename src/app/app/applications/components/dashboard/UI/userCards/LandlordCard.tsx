import { ArrowUpRight, FileText } from "lucide-react";
import CardFooter from "../../layout/CardFooter";
import DateColumn from "../generic/DateColumn";
import ListingInfo from "../generic/ListingInfo";
import ProfileButton from "../profile/ProfileButton";
import { Application } from "../../../../types";
import ViewListingButton from "../generic/ViewListingButton";
// card which is viewable to applicant, to quickly see their current applications and what actions they can perform on it
// produced by landlords
type props={
  app: Application;
  onAction: (id: number, action: 'accept' | 'reject') => void;// the different actions an applicant can do from an offer
}

export default function LandlordCard({ app, onAction,}: props) {
  return (
    <li className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-white/20 transition-colors">
     <div
      className={`h-px w-full ${
        app.status === "APPROVED"
          ? "bg-[#c9fb00]"
          : app.status === "CONFIRMED"
          ? "bg-sky-400"
          : app.status === "REJECTED" || app.status === "WITHDRAWN"
          ? "bg-red-500"
          : "bg-amber-400"
      }`}
    />

      <div className="p-5 flex flex-col gap-4">

        {/* Row 1: listing info + dates */}
        <div className="flex items-start justify-between gap-3">
          <ListingInfo name={app.listingName} address={app.listingAddress} rent={app.rent} />
          <DateColumn submittedDate={app.submittedDate} lastUpdated={app.lastUpdatedDate} />
        </div>

        {/* Row 2: applicant profile */}
        <ProfileButton role="Applicant" username={app.applicantName} profileUrl={app.applicantAvatar} />

        {/* Row 3: confirmed move-in */}
        {app.status === 'CONFIRMED' && app.moveInDate && (
          <div className="inline-flex items-center gap-2 text-xs text-sky-400/80">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
            Moving in · {app.moveInDate}
          </div>
        )}

        {/* Row 4: footer */}
        <CardFooter>
          <div className="flex items-center gap-4">
            <ViewListingButton applicationId={app.id}/>
            {app.status === 'PENDING' && (
              <button className="flex items-center gap-1.5 text-[11px] text-white/35 hover:text-[#c9fb00] transition-colors font-medium">
                <FileText className="w-3.5 h-3.5" />
                View application
              </button>
            )}
          </div>

          {app.status === 'PENDING' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAction(app.id, 'reject')}
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/35 bg-white/5 border border-white/10 hover:text-red-400 hover:border-red-400/20 hover:bg-red-400/5 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => onAction(app.id, 'accept')}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#111] bg-[#c9fb00] hover:bg-[#d4fc20] transition-colors"
              >
                Make offer
              </button>
            </div>
          )}
        </CardFooter>

      </div>
    </li>
  );
}
