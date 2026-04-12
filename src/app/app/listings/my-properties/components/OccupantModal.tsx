'use client';

import { removeOccupant } from '@/app/app/applications/prisma/clientServices';
import { OccupantUI, PropertyListingUI } from '../../types';
import { X, Calendar, SquareArrowRightEnter, SquareArrowRightExit } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ErrorMessage from '@/components/shared/ErrorMessage';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ConfirmModal from '@/components/shared/ConfirmModal';
import Link from 'next/link';

// modal to show when a speciific user is expected to move in/ when they moved into a speciic property + when they are planning
// to move out


type props={
    occupant: OccupantUI;// our conusltant
    property: PropertyListingUI;// the property in question
    onClose: () => void;// what to do when user clicks on modal
    onRemove: (occupantId: number) => void;
}

export default function OccupantModal({occupant,property,onClose, onRemove}: props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isApplicant = occupant.moveInDate.getTime() > Date.now();
  const router = useRouter();
  // some sort of back end service to convert user id to actual user 
  
  // function to remove an occupant
  async function handleRemoveOccupant(){
    setError(null)
    setLoading(true)
    const {result, error } = await removeOccupant(occupant.id);
    if (error){
      setError(error)
    }
    if (result){
      onRemove(occupant.id);
      onClose();
    }
    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-5 backdrop-blur-sm"
      onClick={onClose}
    >

      {showDeleteModal && (
        <ConfirmModal title='Remove occupant' description={`are you sure that you want to remove ${occupant.name}`}
        onCancel={()=>setShowDeleteModal(false)} onConfirm={()=>{handleRemoveOccupant(), setShowDeleteModal(false)}}
        loading={loading}
        />
      )}
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

          <Link
            href={`/app/profile/${occupant.userId}`}
            className="mt-5 w-full px-3 py-2 rounded-[10px] bg-[#c9fb00] text-black text-[13px] font-semibold hover:opacity-90 transition"
          >
            View Profile
          </Link>

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

        {!isApplicant && (// we only want landlord to delete current occuapnts, not future ones
          <>
            {/* Loading state for the remove action */}
            {loading && <LoadingSpinner text="Removing occupant…" />}

            {/* Removal error state */}
            {error && (
              <div className="mt-4">
                <ErrorMessage text={error} />
              </div>
            )}

            <button
              onClick={()=>setShowDeleteModal(true)}
              disabled={loading}
              className="mt-5 w-full px-3 py-2 rounded-[10px] bg-red-500 text-white text-[13px] font-semibold hover:opacity-90 disabled:opacity-40"
            >
              {'Remove Occupant'}
            </button>
          </>
        )}
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