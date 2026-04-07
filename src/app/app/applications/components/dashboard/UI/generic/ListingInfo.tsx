// small component to group together listing intfo in a nice container (used for the application dashboard cards)

import { getListingTitle } from "@/app/app/logic/listing";

type props={
    buildingName: string;
    flatNumber?: string;
    address: string;
    rent: number
}

export default function ListingInfo({ buildingName, flatNumber, address, rent }: props) {
  const listingName = getListingTitle(buildingName, flatNumber ?? null)
  console.log("listing name is", listingName)
    return (
      <div className="min-w-0">
        <p className="text-white font-semibold text-sm leading-snug truncate">{listingName}</p>
        <p className="text-white/40 text-xs mt-0.5 truncate">{address}</p>
        {rent && <p className="text-[#c9fb00] text-xs font-semibold mt-1">£{rent.toLocaleString()}/mo</p>}
      </div>
    );
  }