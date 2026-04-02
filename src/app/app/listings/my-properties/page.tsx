'use client';

import { useState, useMemo } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type OccupantType = 'occupant' | 'applicant';

interface Occupant {
  id: number;
  name: string;
  type: OccupantType;
  movedIn?: string | null;
  expectedMoveOut?: string | null;
  expectedMoveIn?: string | null;
}

interface Property {
  id: number;
  name: string;
  address: string;
  icon: string;
  maxOccupants: number;
  earliestFreeDate: string;
  occupants: Occupant[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PROPERTIES: Property[] = [
  {
    id: 1,
    name: 'Maple House',
    address: '14 Maple Street, Shoreditch, E1 6RF',
    icon: '🏠',
    maxOccupants: 4,
    earliestFreeDate: '1 Aug 2025',
    occupants: [
      { id: 1, name: 'Alice Johnson', type: 'occupant', movedIn: 'Jan 2024', expectedMoveOut: 'Dec 2025' },
      { id: 2, name: 'Bob Smith', type: 'occupant', movedIn: 'Mar 2024', expectedMoveOut: null },
      { id: 3, name: 'Charlie Lee', type: 'occupant', movedIn: null, expectedMoveOut: 'Aug 2025' },
      { id: 4, name: 'Diana Chen', type: 'applicant', expectedMoveIn: '1 Aug 2025' },
    ],
  },
  {
    id: 2,
    name: 'The Pines',
    address: '7 Pine Avenue, Islington, N1 9GH',
    icon: '🏢',
    maxOccupants: 5,
    earliestFreeDate: 'Available now',
    occupants: [
      { id: 5, name: 'Ethan Davis', type: 'occupant', movedIn: 'Jun 2023', expectedMoveOut: 'Jun 2025' },
      { id: 6, name: 'Fiona Garcia', type: 'occupant', movedIn: 'Sep 2023', expectedMoveOut: null },
      { id: 7, name: 'George Patel', type: 'applicant', expectedMoveIn: '15 May 2025' },
    ],
  },
  {
    id: 3,
    name: 'Riverside Flat',
    address: '3B Riverside Rd, Battersea, SW8 2LT',
    icon: '🌊',
    maxOccupants: 3,
    earliestFreeDate: 'Sep 2025',
    occupants: [
      { id: 8, name: 'Hannah Nguyen', type: 'occupant', movedIn: 'Feb 2024', expectedMoveOut: 'Sep 2025' },
      { id: 9, name: 'Ian Martinez', type: 'occupant', movedIn: 'Feb 2024', expectedMoveOut: null },
      { id: 10, name: 'Julia Kim', type: 'occupant', movedIn: 'Apr 2024', expectedMoveOut: null },
    ],
  },
  {
    id: 4,
    name: 'Oak Studios',
    address: '22 Oak Lane, Hackney, E8 4PP',
    icon: '🌳',
    maxOccupants: 6,
    earliestFreeDate: 'Available now',
    occupants: [],
  },
  {
    id: 5,
    name: 'Clerkenwell Flat',
    address: '9 Clerkenwell Rd, EC1M 5PF',
    icon: '🏙️',
    maxOccupants: 4,
    earliestFreeDate: 'Mar 2026',
    occupants: [
      { id: 11, name: 'Kevin Brown', type: 'occupant', movedIn: 'Jul 2023', expectedMoveOut: 'Mar 2026' },
      { id: 12, name: 'Laura White', type: 'occupant', movedIn: 'Jul 2023', expectedMoveOut: null },
      { id: 13, name: 'Marcus Hall', type: 'occupant', movedIn: 'Oct 2023', expectedMoveOut: null },
      { id: 14, name: 'Nina Ross', type: 'occupant', movedIn: 'Jan 2024', expectedMoveOut: null },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ['#3a4a2a', '#2a3a4a', '#4a2a3a', '#3a2a4a', '#2a4a3a', '#4a3a2a'];
function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h += c.charCodeAt(0);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'w-9 h-9 text-xs' : 'w-[34px] h-[34px] text-[11px]';
  return (
    <div
      className={`${dim} rounded-full shrink-0 flex items-center justify-center font-semibold text-white/70 border border-white/10`}
      style={{ background: avatarColor(name) }}
    >
      {getInitials(name)}
    </div>
  );
}

function StatusPill({ isFull, isEmpty }: { isFull: boolean; isEmpty: boolean }) {
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

// ─── Icons (inline SVGs) ──────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const TrashIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

const CloseIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const UsersIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const CalendarIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const MoveInIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

const MoveOutIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4" />
    <polyline points="14 17 19 12 14 7" />
    <line x1="19" y1="12" x2="7" y2="12" />
  </svg>
);

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Occupant Modal ───────────────────────────────────────────────────────────

function OccupantModal({
  occupant,
  property,
  onClose,
}: {
  occupant: Occupant;
  property: Property;
  onClose: () => void;
}) {
  const isApplicant = occupant.type === 'applicant';

  return (
    <div
      className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#272727] border border-white/[0.13] rounded-[20px] p-7 max-w-[380px] w-full animate-[popIn_0.2s_cubic-bezier(0.34,1.56,0.64,1)]"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'popIn 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div
            className="w-[52px] h-[52px] rounded-[14px] border border-white/[0.13] flex items-center justify-center text-lg font-bold text-white/70 shrink-0"
            style={{ background: avatarColor(occupant.name) }}
          >
            {getInitials(occupant.name)}
          </div>
          <div className="flex-1">
            <div className="text-[18px] font-semibold text-white">{occupant.name}</div>
            <div className="text-[12px] text-white/45 mt-0.5">{property.name} · {property.address}</div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[8px] border border-white/[0.13] text-white/45 flex items-center justify-center hover:bg-white/[0.07] hover:text-white transition-all shrink-0"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Type badge */}
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
            <div className="flex items-center justify-between bg-[#323232] border border-white/[0.08] rounded-[10px] px-3.5 py-3 gap-2">
              <div className="flex items-center gap-1.5 text-[12px] text-white/45">
                <CalendarIcon size={13} />
                Expected Move-in
              </div>
              <div className="font-mono text-[13px] font-medium text-[#c9fb00]">
                {occupant.expectedMoveIn}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between bg-[#323232] border border-white/[0.08] rounded-[10px] px-3.5 py-3 gap-2">
                <div className="flex items-center gap-1.5 text-[12px] text-white/45">
                  <MoveInIcon />
                  Moved In
                </div>
                <div className={`font-mono text-[13px] font-medium ${occupant.movedIn ? 'text-white' : 'text-white/25 text-[12px]'}`}>
                  {occupant.movedIn ?? 'N/A'}
                </div>
              </div>
              <div className="flex items-center justify-between bg-[#323232] border border-white/[0.08] rounded-[10px] px-3.5 py-3 gap-2">
                <div className="flex items-center gap-1.5 text-[12px] text-white/45">
                  <MoveOutIcon />
                  Expected Move-out
                </div>
                <div className={`font-mono text-[13px] font-medium ${occupant.expectedMoveOut ? 'text-white' : 'text-white/25 text-[12px]'}`}>
                  {occupant.expectedMoveOut ?? 'N/A'}
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

// ─── Property Card ────────────────────────────────────────────────────────────

function PropertyCard({
  property,
  isExpanded,
  deleteMode,
  isSelected,
  onToggleExpand,
  onToggleSelect,
  onOccupantClick,
}: {
  property: Property;
  isExpanded: boolean;
  deleteMode: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
  onOccupantClick: (occupant: Occupant) => void;
}) {
  const count = property.occupants.length;
  const isFull = count >= property.maxOccupants;
  const isEmpty = count === 0;
  const freeSlots = property.maxOccupants - count;

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
        ${isSelected ? 'border-red-500/50 bg-red-500/[0.04]' : isExpanded ? 'border-[rgba(201,251,0,0.25)]' : 'border-white/[0.13] hover:border-white/[0.18]'}
        bg-[#2a2a2a]
      `}
    >
      {/* Row */}
      <div
        className="flex items-center gap-3 px-[18px] py-4 cursor-pointer select-none"
        onClick={handleRowClick}
      >
        {/* Checkbox (delete mode only) */}
        {deleteMode && (
          <div
            className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center shrink-0 transition-all ${
              isSelected ? 'bg-red-500 border-red-500' : 'border-red-500/50 bg-transparent'
            }`}
            onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
          >
            {isSelected && <CheckIcon />}
          </div>
        )}

        {/* Icon */}
        <div className="w-10 h-10 bg-[rgba(201,251,0,0.12)] border border-[rgba(201,251,0,0.2)] rounded-[10px] flex items-center justify-center shrink-0 text-[17px]">
          {property.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-white truncate">{property.name}</div>
          <div className="text-[12px] text-white/45 mt-0.5 truncate">{property.address}</div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2.5 shrink-0">
          <StatusPill isFull={isFull} isEmpty={isEmpty} />
          <div className={`flex items-center gap-1.5 font-mono text-[13px] font-medium text-white`}>
            <UsersIcon />
            <span className={isFull ? 'text-orange-400' : 'text-[#c9fb00]'}>{count}</span>
            <span className="text-white/45">/</span>
            {property.maxOccupants}
          </div>
          {!deleteMode && (
            <span className={`text-white/20 transition-transform duration-250 ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronIcon />
            </span>
          )}
        </div>
      </div>

      {/* Expanded occupant panel */}
      {isExpanded && !deleteMode && (
        <div className="border-t border-white/[0.08] px-[18px] pb-[18px] animate-[slideDown_0.2s_ease]">
          {/* Panel meta */}
          <div className="flex items-center justify-between py-3 gap-2 flex-wrap">
            <span className="text-[11px] text-white/45 uppercase tracking-widest font-medium">
              {count} Occupant{count !== 1 ? 's' : ''} · {freeSlots} free slot{freeSlots !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-1.5 bg-[rgba(201,251,0,0.12)] border border-[rgba(201,251,0,0.18)] rounded-lg px-2.5 py-1.5 text-[12px] text-[#c9fb00] font-medium">
              <CalendarIcon size={12} />
              Earliest free: {property.earliestFreeDate}
            </div>
          </div>

          {/* Occupant grid */}
          {count > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {property.occupants.map((occ) => (
                <button
                  key={occ.id}
                  onClick={() => onOccupantClick(occ)}
                  className={`
                    flex items-center gap-2.5 bg-[#323232] rounded-[10px] px-3 py-2.5 text-left
                    border transition-all duration-150 hover:-translate-y-px
                    ${occ.type === 'applicant'
                      ? 'border-[rgba(201,251,0,0.15)] hover:border-[rgba(201,251,0,0.35)] hover:bg-[#383838]'
                      : 'border-white/[0.08] hover:border-white/20 hover:bg-[#383838]'
                    }
                  `}
                >
                  <Avatar name={occ.name} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-white truncate">{occ.name}</div>
                    {occ.type === 'applicant' ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(201,251,0,0.12)] text-[#c9fb00] font-semibold tracking-wide mt-0.5 inline-block">
                        Applicant
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.07] text-white/45 font-semibold tracking-wide mt-0.5 inline-block">
                        Occupant
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-white/45 py-3">No occupants yet.</p>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LandlordPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [modal, setModal] = useState<{ occupant: Occupant; property: Property } | null>(null);

  // Filter + sort
  const filteredProperties = useMemo(() => {
    let list = properties.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase())
    );
    if (sortBy === 'most') list = [...list].sort((a, b) => b.occupants.length - a.occupants.length);
    else if (sortBy === 'least') list = [...list].sort((a, b) => a.occupants.length - b.occupants.length);
    else if (sortBy === 'empty') list = [...list].sort((a) => (a.occupants.length === 0 ? -1 : 1));
    else if (sortBy === 'full') list = [...list].sort((a, b) => (b.occupants.length >= b.maxOccupants ? 1 : -1));
    return list;
  }, [properties, search, sortBy]);

  function toggleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function enterDeleteMode() {
    setDeleteMode(true);
    setExpandedId(null);
    setSelectedIds(new Set());
  }

  function exitDeleteMode() {
    setDeleteMode(false);
    setSelectedIds(new Set());
  }

  function deleteSelected() {
    setProperties((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    exitDeleteMode();
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white font-sans px-5 py-7">
      <div className="max-w-4xl mx-auto">

        {/* Page header */}
        <div className="mb-7">
          <h1 className="text-[26px] font-semibold tracking-tight">My Properties</h1>
          <p className="text-[12px] text-white/45 mt-1">Manage your listings and occupants</p>
        </div>

        {/* Toolbar */}
        <div className="flex gap-2.5 mb-[18px] flex-wrap items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-white/[0.13] text-white placeholder-white/45 pl-9 pr-3 py-2.5 rounded-[10px] text-[13px] outline-none focus:border-[#c9fb00] transition-colors"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#2a2a2a] border border-white/[0.13] text-white px-3 py-2.5 rounded-[10px] text-[13px] outline-none focus:border-[#c9fb00] transition-colors cursor-pointer min-w-[150px] appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23888' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              paddingRight: '32px',
            }}
          >
            <option value="default">Sort: Default</option>
            <option value="most">Most Occupants</option>
            <option value="least">Least Occupants</option>
            <option value="empty">Empty First</option>
            <option value="full">Full First</option>
          </select>

          {/* Delete toggle */}
          {deleteMode ? (
            <button
              onClick={exitDeleteMode}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium bg-red-500/[0.12] border border-red-500/30 text-red-400 transition-all hover:bg-red-500/20"
            >
              <CloseIcon />
              Cancel
            </button>
          ) : (
            <button
              onClick={enterDeleteMode}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium bg-[#2a2a2a] border border-white/[0.13] text-white/45 hover:text-white hover:bg-[#323232] transition-all"
            >
              <TrashIcon />
              Delete
            </button>
          )}
        </div>

        {/* Delete mode banner */}
        {deleteMode && (
          <div className="flex items-center justify-between bg-red-500/[0.12] border border-red-500/25 rounded-[10px] px-4 py-2.5 mb-3.5 gap-2.5 flex-wrap">
            <span className="text-[13px] font-medium text-red-400">
              {selectedIds.size} propert{selectedIds.size === 1 ? 'y' : 'ies'} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={exitDeleteMode}
                className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-[13px] font-medium bg-[#2a2a2a] border border-white/[0.13] text-white/45 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={deleteSelected}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-[13px] font-medium bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <TrashIcon size={13} />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Property list */}
        {filteredProperties.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isExpanded={expandedId === property.id}
                deleteMode={deleteMode}
                isSelected={selectedIds.has(property.id)}
                onToggleExpand={() => toggleExpand(property.id)}
                onToggleSelect={() => toggleSelect(property.id)}
                onOccupantClick={(occ) => setModal({ occupant: occ, property })}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-white/45">
            <div className="text-[40px] mb-3">🏠</div>
            <p className="text-[14px]">No properties match your search.</p>
          </div>
        )}
      </div>

      {/* Occupant modal */}
      {modal && (
        <OccupantModal
          occupant={modal.occupant}
          property={modal.property}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}