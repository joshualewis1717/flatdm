// small light pill telling users if the property is full or empty
type props ={
    isFull: boolean; // if property is full or not
    isEmpty: boolean;// if property is empty or not
}

export default function PropertyStatusPill({ isFull, isEmpty }: props) {
    if (isFull) {
      return (
        <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-orange-400/15 border border-orange-400/35 text-orange-400">
          Full
        </span>
      );
    }
    if (isEmpty) {
      return (
        <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.12] text-white/45">
          Empty
        </span>
      );
    }
    return null;
  }