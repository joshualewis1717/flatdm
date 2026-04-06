'use client';
import {OccupantUI } from '../../types';
import Avatar from '@/app/app/applications/components/dashboard/UI/profile/Avatar';

// user card, lets landlords know of which consultant is in which listing/ property
type props={
    occupant: OccupantUI;// replace with applicant/ consultant later
    onClick: () => void;// what to do when this card is clicked
  
}
export default function OccupantCard({occupant,onClick,}:props ) {
  const isApplicant = occupant.moveInDate.getTime() > Date.now();
  const consultant = occupant.userId

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2.5 bg-[#323232] rounded-[10px] px-3 py-2.5 text-left
        border transition-all duration-150 hover:-translate-y-px
        ${
          isApplicant
            ? 'border-[rgba(201,251,0,0.15)] hover:border-[rgba(201,251,0,0.35)] hover:bg-[#383838]'
            : 'border-white/[0.08] hover:border-white/20 hover:bg-[#383838]'
        }
      `}
    >
      <Avatar username={'exampple usermame'} />

      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-white truncate">
          {'example real name'}
        </div>

        <span
          className={`
            text-[10px] px-1.5 py-0.5 rounded font-semibold tracking-wide mt-0.5 inline-block
            ${
              isApplicant
                ? 'bg-[rgba(201,251,0,0.12)] text-[#c9fb00]'
                : 'bg-white/[0.07] text-white/45'
            }
          `}
        >
          {isApplicant ? 'Applicant' : 'Occupant'}
        </span>
      </div>
    </button>
  );
}