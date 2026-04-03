'use client';

import { useMemo, useState } from 'react';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import PropertyCard from './components/PropertyCard';
import OccupantModal from './components/OccupantModal';
import { Occupant, Property } from '../types';
import { Home, Plus, Trash2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { useRouter } from 'next/navigation';

// main page of whiich landlords can view all of their current 
// properties/ listings and to also add in a new property


const MOCK_PROPERTIES: Property[] = [
  {
    id: 1,
    name: 'Maple House',
    address: '14 Maple Street, Shoreditch, E1 6RF',
    thumbnail: '🏠',// using emojis as placeholder 
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
    thumbnail: '🏢',
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
    thumbnail: '🌊',
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
    thumbnail: '🌳',
    maxOccupants: 6,
    earliestFreeDate: 'Available now',
    occupants: [],
  },
  {
    id: 5,
    name: 'Clerkenwell Flat',
    address: '9 Clerkenwell Rd, EC1M 5PF',
    thumbnail: '🏙️',
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


export default function Page() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [modal, setModal] = useState<{ occupant: Occupant; property: Property } | null>(null);

  // delete mode state
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Filter + sort logic
  const filtered = useMemo(() => {
    let list = properties.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase())
    );

    if (sortBy === 'most') {
      list = [...list].sort((a, b) => b.occupants.length - a.occupants.length);
    } else if (sortBy === 'least') {
      list = [...list].sort((a, b) => a.occupants.length - b.occupants.length);
    } else if (sortBy === 'empty') {
      list = [...list].sort((a) => (a.occupants.length === 0 ? -1 : 1));
    } else if (sortBy === 'full') {
      list = [...list].sort(
        (a, b) =>
          Number(b.occupants.length >= b.maxOccupants) -
          Number(a.occupants.length >= a.maxOccupants)
      );
    }

    return list;
  }, [search, sortBy, properties]);

  /*** handlers ***/

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
    setProperties((prev) =>
      prev.filter((p) => !selectedIds.has(p.id))
    );
    exitDeleteMode();
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">My Properties</h1>
            <p className="text-white/45 text-sm">Manage your listings</p>
          </div>

          <button
            onClick={() => router.push('new')}
            className="
              flex items-center gap-2 px-4 py-2 rounded-[10px]
              bg-[#c9fb00] text-black text-[13px] font-semibold
              hover:opacity-90 transition
            "
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </header>

        {/* Toolbar */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <SearchBar value={search} onChange={setSearch} />

          <FilterDropdown value={sortBy} onChange={setSortBy}>
            <option value="default">Default</option>
            <option value="most">Most Occupants</option>
            <option value="least">Least Occupants</option>
            <option value="empty">Empty First</option>
            <option value="full">Full First</option>
          </FilterDropdown>
        </div>

        {/* Delete Mode Toolbar */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {!deleteMode && filtered.length > 0 && (
            // if there is no properties/ listings, no need to show trash icon
            <button
              onClick={enterDeleteMode}
              className="px-3.5 py-2.5 rounded-[10px] text-[13px]  bg-red-500 text-white border border-white/[0.13]"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {deleteMode && filtered.length > 0 && (
            // TODO: add in modal to confirm deletion.
            <>
              <button
                onClick={exitDeleteMode}
                className="px-3.5 py-2.5 rounded-[10px] text-[13px] bg-[#2a2a2a] border border-white/[0.13]"
              >
                Cancel
              </button>

              <button
                onClick={deleteSelected}
                disabled={selectedIds.size === 0}
                className="
                  px-3.5 py-2.5 rounded-[10px]
                  text-[13px] font-semibold
                  bg-red-500 text-white
                  disabled:opacity-40
                "
              >
                Delete Selected ({selectedIds.size})
              </button>
            </>
          )}
        </div>

        {/* List */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                isExpanded={expandedId === p.id}
                deleteMode={deleteMode}
                isSelected={selectedIds.has(p.id)}
                onToggleExpand={() => toggleExpand(p.id)}
                onToggleSelect={() => toggleSelect(p.id)}
                onOccupantClick={(occ) =>
                  setModal({ occupant: occ, property: p })
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No properties found"
            description="Try adjusting your search or filters, or add a new property to get started."
            fullHeight
          >
            <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-6">
              <Home className="w-10 h-10 text-white/30" />
            </div>
          </EmptyState>
        )}

        {/* Modal */}
        {modal && (
          <OccupantModal
            occupant={modal.occupant}
            property={modal.property}
            onClose={() => setModal(null)}
          />
        )}
      </div>
    </div>
  );
}