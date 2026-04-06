// small component to group together listing intfo in a nice container (used for the application dashboard cards)

type props={
    name: string;// name of listing
    address: string;
    rent: number
}

export default function ListingInfo({ name, address, rent }: props) {
    return (
      <div className="min-w-0">
        <p className="text-white font-semibold text-sm leading-snug truncate">{name}</p>
        <p className="text-white/40 text-xs mt-0.5 truncate">{address}</p>
        {rent && <p className="text-[#c9fb00] text-xs font-semibold mt-1">£{rent.toLocaleString()}/mo</p>}
      </div>
    );
  }