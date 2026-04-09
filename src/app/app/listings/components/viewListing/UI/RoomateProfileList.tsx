"use client";
// a generic component to show a list of roomate profiles stacked together
import { Roommate } from "../../../types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ListingInfoData } from "../../../types";

type RoommateAvatarsProps = {
  roomates: ListingInfoData['currentOccupants'];
  maxVisible?: number;
};

export default function RoommateProfileList({ roomates, maxVisible = 10 }: RoommateAvatarsProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false); 

  if (!roomates || roomates.length === 0) return null;

  const visibleRoommates = expanded
    ? roomates
    : roomates.slice(0, maxVisible);

  return (
    <div>
      <h3 className="text-sm font-medium text-white/85 mb-3">
        Current Roommates
      </h3>

      <div className="flex -space-x-3">
        {visibleRoommates.map((rm) => (
          <div
            key={rm.id}
            title={rm.name}
            // clicking on a profile will redirect user to the actual profile page where they can see the info
            onClick={() => router.push(`/app/profile/${rm.userId}`)}
            className="w-10 h-10 rounded-full border-2 border-white/20 hover:border-primary cursor-pointer bg-white/10 flex items-center justify-center text-xs text-white/70 font-medium transition-colors"
          >
            {rm.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
        ))}

        {/* Expand button */}
        {!expanded && roomates.length > maxVisible && (
          <button
            onClick={() => setExpanded(true)}
            className="w-10 h-10 flex items-center justify-center text-xs text-white/70 bg-white/[0.05] rounded-full border-2 border-white/20 hover:border-primary cursor-pointer"
          >
            +{roomates.length - maxVisible}{/* shows how much extra roomates are left to be displayed */}
          </button>
        )}

        {/* Collapse button */}
        {expanded && roomates.length > maxVisible && (
          <button
            onClick={() => setExpanded(false)}
            className="w-10 h-10 flex items-center justify-center text-xs text-white/70 bg-white/[0.05] rounded-full border-2 border-white/20 hover:border-primary cursor-pointer"
          >
            −
          </button>
        )}
      </div>
    </div>
  );
}