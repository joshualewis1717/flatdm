// component for applicants to see their confirmed application (i.e they acceted the offer and is scheduled to move into there)

import { ArrowUpRight } from "lucide-react";
import CardFooter from "../../layout/CardFooter";
import DateColumn from "../generic/DateColumn";
import ListingInfo from "../generic/ListingInfo";
import ProfileButton from "../profile/ProfileButton";
import { Application } from "../../../../types";

type props={
    app: Application;
}
export default function ConfirmedCard({ app }: props) {
    return (
      <section className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">Your Place</h2>
            <span className="text-xs text-white/30 ml-auto">Confirmed & moving in</span>
          </div>
          <div className="h-px w-full bg-white/10" />
        </div>
  
        <ul className="grid sm:grid-cols-2">
          <li className="bg-[var(--card)] border border-sky-400/20 rounded-2xl overflow-hidden">
            <div className="h-px w-full bg-sky-400" />
            <div className="p-5 flex flex-col gap-4">
  
              {/* Row 1: listing info + dates */}
              <div className="flex items-start justify-between gap-3">
                <ListingInfo name={app.listingName} address={app.listingAddress} rent={app.rent} />
                <DateColumn submittedDate={app.submittedDate} lastUpdated={app.lastUpdatedDate} />
              </div>
  
              {/* Row 2: landlord + move-in side by side */}
              <div className="flex items-center gap-3">
                {app.landlordName && (
                  <div className="flex-1 min-w-0">
                    <ProfileButton role="Landlord" username={app.landlordName} profileUrl={app.landlordAvatar} />
                  </div>
                )}
              </div>
  
              {/*Row 3: expeted move in date*/}
              {app.moveInDate && (
                <div className="inline-flex items-center gap-2 text-xs text-sky-400/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                  Moving in · {app.moveInDate}
                </div>
              )}
  
              {/* Row 4: footer */}
              <CardFooter>
                <button className="flex items-center gap-1.5 text-[11px] text-white/35 hover:text-white transition-colors font-medium">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  View listing
                </button>
              </CardFooter>
  
            </div>
          </li>
        </ul>
      </section>
    );
  }