'use client';

import { Users, ChevronDown, Calendar, Eye, Check, Image } from 'lucide-react';
import PropertyStatusPill from '../../components/ownProperties/UI/PropertyStatusPill';
import OccupantCard from './OccupantCard';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Occupant, PropertyListing } from '../../types';
// property card to show property + whether it is full or empty, and also of total occupants allowed + current number of occupants
type Props = {
    property:  PropertyListing;// our property in question
    isExpanded: boolean;// if it has been expanded to show more info
    deleteMode: boolean;// if the parent is in delete mode or not
    isSelected: boolean;// if this specific card is selected by parent in delete mode or not
    onToggleSelect: () => void;// what to do when user clicks on it in delete mode
    onToggleExpand: () => void;// call to let parent control on how this component should be expanded
    onOccupantClick: (occ: Occupant) => void;// callback on when an occupant card is clicked
};


export default function PropertyCard({property,isExpanded,deleteMode,isSelected,onToggleSelect,onToggleExpand,onOccupantClick,}: Props) {
    const router = useRouter();
    const count = property.occupants.length;
    const isFull = count >= property.maxOccupants;
    const isEmpty = count === 0;
    const freeSlots = property.maxOccupants - count;
    const thumbnail = property.images.find(img => img.isThumbnail);
    const building = property.property;
    function handleRowClick() {
      if (deleteMode) {
        onToggleSelect();
      } else {
        onToggleExpand();
      }
    }
  
    return (
      <div
        className={`
          rounded-[14px] border overflow-hidden transition-colors duration-200
          ${
            isSelected
              ? 'border-red-500/40 bg-red-500/[0.04]'
              : isExpanded
              ? 'border-[rgba(201,251,0,0.25)]'
              : 'border-white/[0.13] hover:border-white/[0.18]'
          }
          bg-[#2a2a2a]
        `}
      >
        {/* Header */}
        <div
          onClick={handleRowClick}
          className="flex items-center gap-3 px-[18px] py-4 cursor-pointer select-none"
        >
          {/* Delete checkbox */}
          {deleteMode && (
           <Checkbox
           checked={isSelected}
           onCheckedChange={() => onToggleSelect()}
           onClick={(e) => e.stopPropagation()}
           className="
             data-[state=checked]:bg-red-500
             data-[state=checked]:border-red-500
             border-red-500/50
           "
         />
          )}
  
          {/* Thumbnail */}
          <div className="w-10 h-10 bg-[rgba(201,251,0,0.12)] border border-[rgba(201,251,0,0.2)] rounded-[10px] flex items-center justify-center shrink-0 text-[17px]">
            {thumbnail?.url? thumbnail.url : <Image/>}
          </div>
  
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-semibold text-white truncate">
              {building.title}
            </div>
            <div className="text-[12px] text-white/45 mt-0.5 truncate">
              {building.streetName + property.flatNumber}
            </div>
          </div>
  
          {/* Meta */}
          <div className="flex items-center gap-2.5 shrink-0">
            <PropertyStatusPill isFull={isFull} isEmpty={isEmpty} />
  
            <div className="flex items-center gap-1.5 font-mono text-[13px] text-white">
              <Users className="w-4 h-4" />
              <span className={isFull ? 'text-orange-400' : 'text-[#c9fb00]'}>
                {count}
              </span>
              <span className="text-white/45">/</span>
              {property.maxOccupants}
            </div>
  
            {/* View Button */}
            {!deleteMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`${property.id}`);
                }}
                className="
                  flex items-center gap-1.5 px-2.5 py-1.5
                  rounded-lg bg-[#c9fb00] text-black
                  text-[12px] font-semibold
                "
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </button>
            )}
  
            <ChevronDown
              className={`text-white/20 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
  
        {/* Expanded */}
        {isExpanded && !deleteMode && (
          <div className="border-t border-white/[0.08] px-[18px] pb-[18px]">
            <div className="flex justify-between py-3">
              <span className="text-[11px] text-white/45 uppercase">
                {count} Occupants · {freeSlots} free
              </span>
  
              <div className="flex items-center gap-1.5 text-[12px] text-[#c9fb00]">
                <Calendar className="w-4 h-4" />
                {property.availableFrom.toLocaleString()}
              </div>
            </div>
  
            {count > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {property.occupants.map((occ) => (
                  <OccupantCard
                    key={occ.id}
                    occupant={occ}
                    onClick={() => onOccupantClick(occ)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-white/45 py-3">
                No occupants yet.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
