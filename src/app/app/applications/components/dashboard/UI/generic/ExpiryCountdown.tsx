import { AlertTriangle } from "lucide-react";
import {daysUntilDate } from "../../../../logic/dateUtils";

// small widget to dislay when a specific appliciation is going to expire
type props={
    expiryDate: string;// when is it going to expire
}

export default function ExpiryCountdown({ expiryDate }:props) {
    const days = daysUntilDate(expiryDate);
    const urgent = days <= 3;// if it's urget we want seperate styling
    return (
      <div className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border
        ${urgent ? 'text-red-400 bg-red-400/10 border-red-400/20' : 'text-white/40 bg-white/5 border-white/10'}`}
      >
        {urgent && <AlertTriangle className="w-3 h-3" />}
        {days === 0 ? 'Expires today' : `${days}d left to respond`}
      </div>
    );
  }
  