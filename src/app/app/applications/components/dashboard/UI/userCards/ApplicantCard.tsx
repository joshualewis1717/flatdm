import {RotateCcw } from "lucide-react";
import CardFooter from "../../layout/CardFooter";
import DateColumn from "../generic/DateColumn";
import ExpiryCountdown from "../generic/ExpiryCountdown";
import ListingInfo from "../generic/ListingInfo";
import ProfileButton from "../profile/ProfileButton";
import { Application } from "../../../../types";
import ViewListingButton from "../generic/ViewListingButton";
import ViewApplicationButton from "../generic/ViewApplicationButton";
import { useRouter } from "next/navigation";

// cards that was produced by applicants, landlords will be seeing these cards and interacting with them
type props={
    application: Application;
    onAction: (id: number, action: 'accept' | 'reject' | 'withdraw') => void;// the different options a landlord can do to an applicationlication
}

export default function ApplicantCard({ application,onAction, }: props) {
  const router = useRouter();
    return (
      <li className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-white/20 transition-colors">
      <div
        className={`h-px w-full ${
          application.status === "APPROVED"
            ? "bg-[#c9fb00]"
            : application.status === "REJECTED" || application.status === "WITHDRAWN"
            ? "bg-red-500"
            : application.status === "PENDING"
            ? "bg-amber-400"
            : ""
        }`}
      />
  
        <div className="p-5 flex flex-col gap-4">
  
          {/* Row 1: listing info + dates */}
          <div className="flex items-start justify-between gap-3">
            <ListingInfo buildingName={application.buildingName} flatNumber={application.flatNumber} address={application.listingAddress} rent={application.rent} />
            <DateColumn submittedDate={application.submittedDate} lastUpdated={application.lastUpdatedDate} />
          </div>
  
          {/* Row 2: landlord profile */}
          {application.landlordName && (
            <ProfileButton role="Landlord" username={application.landlordName} profileUrl={application.landlordAvatar} 
            onClick={()=>router.push(`/app/profile/${application.landlordId}`)}// user can check out the corresponding landlord profile
            />
          )}
  
          {/* Row 3: expiry (ACCEPTED only) */}
          {application.status === 'APPROVED' && application.expiryDate && (
            <ExpiryCountdown expiryDate={application.expiryDate} />
          )}
  
          {/* Row 4: footer */}
          <CardFooter>
           <ViewListingButton applicationId={application.id}/>
           <ViewApplicationButton applicationId={application.id}/>
  
            <div className="flex items-center gap-2">
              {application.status === 'PENDING' && (
                <button
                  onClick={() => onAction(application.id, 'withdraw')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-red-400/70 bg-red-400/5 border border-red-400/15 hover:bg-red-400/10 hover:text-red-400 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Withdraw
                </button>
              )}
              {application.status =='APPROVED' && (
                <>
                  <button
                    onClick={() => onAction(application.id, 'reject')}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/35 bg-white/5 border border-white/10 hover:text-red-400 hover:border-red-400/20 hover:bg-red-400/5 transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => onAction(application.id, 'accept')}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#111] bg-[#c9fb00] hover:bg-[#d4fc20] transition-colors"
                  >
                    Accept offer
                  </button>
                </>
              )}
            </div>
          </CardFooter>
  
        </div>
      </li>
    );
  }