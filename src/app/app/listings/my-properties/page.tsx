'use client';

import { useMemo, useState } from 'react';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import PropertyCard from './components/PropertyCard';
import OccupantModal from './components/OccupantModal';
import { Home, Plus, Trash2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { useRouter } from 'next/navigation';
import { Occupant, Property, PropertyListing } from '../types';

// main page of whiich landlords can view all of their current 
// properties/ listings and to also add in a new property

export const MOCK_PROPERTY: Property = {
  id: 1,
  title: "Maple House",
  streetName: "14 Maple Street",
  city: "London",
  postcode: "E1 6RF",

  landlordId: 1,

  amenities: [], // keep empty for now
  listings: [],

  createdAt: new Date(),
  updatedAt: new Date(),
};

export const MOCK_PROPERTY_LISTING: PropertyListing = {
  id: 1,

  description: "Modern flat in Shoreditch",
  rent: 1200,
  availableFrom: new Date(),

  maxOccupants: 4,
  minStay: 6,

  rooms: 4,
  bedrooms: 2,
  bathrooms: 1,
  area: 85,

  flatNumber: "2B",

  propertyId: 1,
  landlordId: 1,

  property: {
    ...MOCK_PROPERTY,
  },

  occupants: [
    {
      id: 1,
      userId: 1,
      listingId: 1,
      moveIn: new Date("2024-01-01"),
      moveOut: new Date("2025-12-01"),
      createdAt: new Date(),
    },
    {
      id: 2,
      userId: 2,
      listingId: 1,
      moveIn: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // future → applicant
      moveOut: null,
      createdAt: new Date(),
    },
  ],

  applications: [],
  images: [
    {
      id: 1,
      url: "",
      isThumbnail: true,
      listingId: 1,
      createdAt: new Date(),
    },
    {
      id: 2,
      url: "",
      isThumbnail: false,
      listingId: 1,
      createdAt: new Date(),
    },
  ],

  createdAt: new Date(),
  updatedAt: new Date(),
};

export default function Page() {
  const router = useRouter();

  const [properties, setProperties] = useState<PropertyListing[]>([
    MOCK_PROPERTY_LISTING,
  ]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [modal, setModal] = useState<{
    occupant: Occupant;
    property: PropertyListing;
  } | null>(null);

  // delete mode state
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Filter + sort logic
  const filtered = useMemo(() => {
    let list = properties.filter((p) => {
      const address = p.property.streetName.toLowerCase();
      const desc = p.description.toLowerCase();

      return (
        address.includes(search.toLowerCase()) ||
        desc.includes(search.toLowerCase())
      );
    });

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