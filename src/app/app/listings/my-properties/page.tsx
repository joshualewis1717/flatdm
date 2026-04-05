'use client';

import { useMemo, useState, useEffect } from 'react';
import SearchBar from '../components/UI/SearchBar';
import FilterDropdown from '../components/ownProperties/UI/FilterDropdown';
import PropertyCard from './components/PropertyCard';
import OccupantModal from './components/OccupantModal';
import { Home, Plus, Trash2 } from 'lucide-react';
import EmptyState from '../components/UI/EmptyState';
import { useRouter } from 'next/navigation';
import { MyPropertyListingData, OccupantUI } from '../types';
import { getListingsForLandlord, deleteListing } from '../prisma/clientServices';

type Props = {
  landlordId: number;
};

export default function Page({ landlordId = 3 }: Props) {
  const router = useRouter();

  const [listings, setListings] = useState<MyPropertyListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [modal, setModal] = useState<{
    occupant: OccupantUI;
    property: MyPropertyListingData['propertyListing'];
  } | null>(null);

  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function fetchListings() {
      try {
        const data = await getListingsForLandlord(landlordId);
        setListings(data);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [landlordId]);

  //  filter by address and also sort by most occupants, least occupants, empty first, full first
  const filtered = useMemo(() => {
    let list = listings.filter((listing) => {
      const p = listing.propertyListing;
      const address =
        p.streetName.toLowerCase() +
        ' ' +
        p.city.toLowerCase() +
        ' ' +
        p.postcode.toLowerCase();

      return address.includes(search.toLowerCase());
    });

    if (sortBy === 'most')
      list = [...list].sort((a, b) => b.occupants.length - a.occupants.length);

    else if (sortBy === 'least')
      list = [...list].sort((a, b) => a.occupants.length - b.occupants.length);

    else if (sortBy === 'empty')
      list = [...list].sort((a) => (a.occupants.length === 0 ? -1 : 1));

    else if (sortBy === 'full')
      list = [...list].sort(
        (a, b) =>
          Number(b.occupants.length >= b.propertyListing.maxOccupants) -
          Number(a.occupants.length >= a.propertyListing.maxOccupants)
      );

    return list;
  }, [search, sortBy, listings]);

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

  async function deleteSelected() {
    setDeleteLoading(true);

    await Promise.all([...selectedIds].map((id) => deleteListing(id)));

    setListings((prev) =>
      prev.filter((l) => !selectedIds.has(l.propertyListing.id))
    );

    exitDeleteMode();
    setDeleteLoading(false);
  }

  if (loading)
    return (
      <p className="text-sm text-white/40 p-8">
        Loading properties…
      </p>
    );

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white p-6">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">My Properties</h1>
            <p className="text-white/45 text-sm">
              Manage your listings
            </p>
          </div>

          <button
            onClick={() => router.push('new')}
            className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#c9fb00] text-black text-[13px] font-semibold hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </header>

        {/* SEARCH + FILTER */}
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

        {/* DELETE ACTIONS */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {!deleteMode && filtered.length > 0 && (
            <button
              onClick={enterDeleteMode}
              className="px-3.5 py-2.5 rounded-[10px] text-[13px] bg-red-500 text-white"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {deleteMode && filtered.length > 0 && (
            <>
              <button
                onClick={exitDeleteMode}
                className="px-3.5 py-2.5 rounded-[10px] text-[13px] bg-[#2a2a2a]"
              >
                Cancel
              </button>

              <button
                onClick={deleteSelected}
                disabled={selectedIds.size === 0 || deleteLoading}
                className="px-3.5 py-2.5 rounded-[10px] text-[13px] font-semibold bg-red-500 text-white disabled:opacity-40"
              >
                {deleteLoading
                  ? 'Deleting…'
                  : `Delete Selected (${selectedIds.size})`}
              </button>
            </>
          )}
        </div>

        {/* LIST */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((listing) => (
              <PropertyCard
                key={listing.propertyListing.id}
                property={listing}
                isExpanded={expandedId === listing.propertyListing.id}
                deleteMode={deleteMode}
                isSelected={selectedIds.has(listing.propertyListing.id)}
                onToggleExpand={() =>
                  toggleExpand(listing.propertyListing.id)
                }
                onToggleSelect={() =>
                  toggleSelect(listing.propertyListing.id)
                }
                onOccupantClick={(occ) =>
                  setModal({
                    occupant: occ,
                    property: listing.propertyListing,
                  })
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

        {/* MODAL */}
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