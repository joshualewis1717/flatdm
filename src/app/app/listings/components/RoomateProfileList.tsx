
// a generic component to show a list of roomate profiles stacked together

import { Roommate } from "../types";

  
type RoommateAvatarsProps = {
    roommates: Roommate[];
    maxVisible?: number;
    onShowMore?: () => void;
};
  
export default function RoommateProfileList({roommates,maxVisible = 10,onShowMore,}: RoommateAvatarsProps) {
    if (roommates.length === 0) return null;
  
    return (
      <div>
        <h3 className="text-sm font-medium text-white/85 mb-3">Current Roommates</h3>
        <div className="flex -space-x-3">
          {roommates.slice(0, maxVisible).map((rm) => (
            <div
              key={rm.id}
              title={rm.name}
              className="w-10 h-10 rounded-full border-2 border-white/20 hover:border-primary cursor-pointer bg-white/10 flex items-center justify-center text-xs text-white/70 font-medium transition-colors"
            >
              {rm.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          ))}
          {roommates.length > maxVisible && (
            <button
              onClick={onShowMore ?? (() => {})}
              className="w-10 h-10 flex items-center justify-center text-xs text-white/70 bg-white/[0.05] rounded-full border-2 border-white/20 hover:border-primary cursor-pointer"
            >
              +{roommates.length - maxVisible}
            </button>
          )}
        </div>
      </div>
    );
}