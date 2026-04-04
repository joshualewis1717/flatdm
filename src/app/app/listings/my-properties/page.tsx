'use client';

import { useMemo, useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import PropertyCard from './components/PropertyCard';
import OccupantModal from './components/OccupantModal';
import { Home, Plus, Trash2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { useRouter } from 'next/navigation';
import { Occupant, PropertyListing } from '../types';
import { getListingsForLandlord, deleteListing } from '../logic/clientServices/prisma';

type Props = {
  landlordId: number;
};

export default function Page({ landlordId = 3 }: Props) {
  const router = useRouter();

  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [modal, setModal] = useState<{
    occupant: Occupant;
    property: PropertyListing;
  } | null>(null);

  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteLoading, setDeleteLoading] = useState(false);
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getListingsForLandlord(landlordId);
        // @ts-ignore  // TODO: make a smaller property listing type to ignore this issue (logically this code works)
        setProperties(data);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchListings();
  }, [landlordId]);

  const filtered = useMemo(() => {
    let list = properties.filter((p) => {
      const address = p.property.streetName.toLowerCase();
      const desc = p.description.toLowerCase();
      return (
        address.includes(search.toLowerCase()) ||
        desc.includes(search.toLowerCase())
      );
    });

    if (sortBy === 'most')  list = [...list].sort((a, b) => b.occupants.length - a.occupants.length);
    else if (sortBy === 'least') list = [...list].sort((a, b) => a.occupants.length - b.occupants.length);
    else if (sortBy === 'empty') list = [...list].sort((a) => (a.occupants.length === 0 ? -1 : 1));
    else if (sortBy === 'full')  list = [...list].sort((a, b) =>
      Number(b.occupants.length >= b.maxOccupants) - Number(a.occupants.length >= a.maxOccupants)
    );

    return list;
  }, [search, sortBy, properties]);

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
    setProperties((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    exitDeleteMode();
    setDeleteLoading(false);
  }

  if (loading) return <p className="text-sm text-white/40 p-8">Loading properties…</p>;

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white p-6">
      <div className="max-w-4xl mx-auto">

        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">My Properties</h1>
            <p className="text-white/45 text-sm">Manage your listings</p>
          </div>
          <button
            onClick={() => router.push('new')}
            className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#c9fb00] text-black text-[13px] font-semibold hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </header>

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

        <div className="flex gap-2 mb-4 flex-wrap">
          {!deleteMode && filtered.length > 0 && (
            <button
              onClick={enterDeleteMode}
              className="px-3.5 py-2.5 rounded-[10px] text-[13px] bg-red-500 text-white border border-white/[0.13]"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {deleteMode && filtered.length > 0 && (
            <>
              <button
                onClick={exitDeleteMode}
                className="px-3.5 py-2.5 rounded-[10px] text-[13px] bg-[#2a2a2a] border border-white/[0.13]"
              >
                Cancel
              </button>
              <button
                onClick={deleteSelected}
                disabled={selectedIds.size === 0 || deleteLoading}
                className="px-3.5 py-2.5 rounded-[10px] text-[13px] font-semibold bg-red-500 text-white disabled:opacity-40"
              >
                {deleteLoading ? 'Deleting…' : `Delete Selected (${selectedIds.size})`}
              </button>
            </>
          )}
        </div>

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
                onOccupantClick={(occ) => setModal({ occupant: occ, property: p })}
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