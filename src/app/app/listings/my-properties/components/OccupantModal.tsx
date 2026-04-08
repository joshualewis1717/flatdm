'use client';

import { OccupantUI, PropertyListingUI } from '../../types';
import { X, Calendar, SquareArrowRightEnter, SquareArrowRightExit } from 'lucide-react';

// modal to show when a speciific user is expected to move in/ when they moved into a speciic property + when they are planning
// to move out


type props={
    occupant: OccupantUI;// our conusltant
    property: PropertyListingUI;// the property in question
    onClose: () => void;// what to do when user clicks on modal
}

export default function OccupantModal({occupant,property,onClose,}: props) {
  const isApplicant = occupant.moveInDate.getTime() > Date.now();
  // some sort of back end service to convert user id to actual user 
  const consultant =  occupant.userId

  return (
    <div
      className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#272727] border border-white/[0.13] rounded-[20px] p-7 max-w-[380px] w-full"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'popIn 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex-1">
            <div className="text-[18px] font-semibold text-white">
              {occupant.name}
            </div>
            <div className="text-[12px] text-white/45 mt-0.5">
              {property.buildingName} · {property.streetName}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[8px] border border-white/[0.13] text-white/45 flex items-center justify-center hover:bg-white/[0.07] hover:text-white transition-all"
          >
            <X />
          </button>
        </div>

        {/* Type badge e.g. current occupant or an expected future occupant*/}
        {isApplicant ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[rgba(201,251,0,0.12)] border border-[rgba(201,251,0,0.2)] text-[#c9fb00] text-[12px] font-semibold tracking-wide mb-[18px]">
            ✦ Applicant – Confirmed Move-in
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.07] text-white/60 text-[12px] font-semibold tracking-wide mb-[18px]">
            ● Current Occupant
          </span>
        )}

        {/* Date rows */}
        <div className="flex flex-col gap-2.5">
          {isApplicant ? (
            <>
              <div className="flex items-center justify-between bg-[#323232] border border-white/[0.08] rounded-[10px] px-3.5 py-3">
                <div className="flex items-center gap-1.5 text-[12px] text-white/45">
                  <Calendar />
                  Expected Move-in
                </div>
                <div className="font-mono text-[13px] font-medium text-[#c9fb00]">
                  {occupant.moveInDate.toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#323232] border border-white/[0.08] rounded-[10px] px-3.5 py-3">
                <div className="flex items-center gap-1.5 text-[12px] text-white/45">
                  <Calendar />
                  Expected Move-out
                </div>
                <div className="font-mono text-[13px] font-medium text-[#c9fb00]">
                  {occupant.moveOutDate?.toLocaleDateString() ?? 'N/A'}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between bg-[#323232] border border-white/[0.08] rounded-[10px] px-3.5 py-3">
                <div className="flex items-center gap-1.5 text-[12px] text-white/45">
                  <SquareArrowRightEnter />
                  Moved In
                </div>
                <div className="font-mono text-[13px] text-white">
                  {occupant.moveInDate.toLocaleDateString() ?? 'N/A'}
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#323232] border border-white/[0.08] rounded-[10px] px-3.5 py-3">
                <div className="flex items-center gap-1.5 text-[12px] text-white/45">
                  <SquareArrowRightExit />
                  Expected Move-out
                </div>
                <div className="font-mono text-[13px] text-white">
                  {occupant.moveOutDate?.toLocaleDateString() ?? 'N/A'}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
