import React from 'react';
import { ArrowUpDown, ChevronRight, Compass, Search, SlidersHorizontal, X } from 'lucide-react';
import { PackageCard } from '../../components/PackageCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { TRAVEL_CATEGORIES } from '../../data/constants';
import { DESTINATIONS_DATA } from '../../data/destinations';
import { SortBy, TravelPackage } from '../../types/travel';

export interface ExplorePageProps {
  searchQuery: string;
  onChangeSearchQuery: (value: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedDestinationFilter: string;
  onSelectDestinationFilter: (destId: string) => void;
  sortBy: SortBy;
  onChangeSortBy: (sort: SortBy) => void;
  activeFilterCount: number;
  onOpenFilterSheet: () => void;
  filteredPackages: TravelPackage[];
  wishlistIds: string[];
  onToggleWishlist: (pkgId: string) => void;
  onOpenDestination: (destinationId: string) => void;
  onOpenPackage: (packageId: string) => void;
  onResetAllFilters: () => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  searchQuery,
  onChangeSearchQuery,
  selectedCategory,
  onSelectCategory,
  selectedDestinationFilter,
  onSelectDestinationFilter,
  sortBy,
  onChangeSortBy,
  activeFilterCount,
  onOpenFilterSheet,
  filteredPackages,
  wishlistIds,
  onToggleWishlist,
  onOpenDestination,
  onOpenPackage,
  onResetAllFilters
}) => {
  const featuredDestinations = DESTINATIONS_DATA.filter((d) => d.featured);

  return (
    <div className="p-4 space-y-4 pb-8">
      {/* Search & Filter Controls */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2.5 shadow-2xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            placeholder="Cari destinasi atau paket wisata..."
            className="flex-1 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
          {searchQuery && (
            <button type="button" onClick={() => onChangeSearchQuery('')} className="text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenFilterSheet}
          className="relative px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#136F99]" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#0B2545] text-white text-[10px] flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {TRAVEL_CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                active
                  ? 'bg-[#0B2545] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Featured Destinations Strip */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Destinasi Unggulan
          </h3>
          {selectedDestinationFilter !== 'All' && (
            <button
              type="button"
              onClick={() => onSelectDestinationFilter('All')}
              className="text-[11px] font-bold text-[#136F99]"
            >
              Tampilkan Semua
            </button>
          )}
        </div>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {featuredDestinations.map((dest) => {
            const isFiltered = selectedDestinationFilter === dest.id;
            return (
              <div
                key={dest.id}
                onClick={() => onOpenDestination(dest.id)}
                className={`w-44 shrink-0 rounded-2xl overflow-hidden bg-white border transition cursor-pointer ${
                  isFiltered ? 'border-[#136F99] ring-2 ring-[#136F99]/20' : 'border-slate-200/80'
                }`}
              >
                <div className="relative h-24">
                  <img src={dest.heroImage} alt={dest.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                    <div className="text-xs font-bold leading-tight truncate">{dest.name}</div>
                    <div className="text-[10px] text-slate-200">{dest.country}</div>
                  </div>
                </div>
                <div className="px-2.5 py-2 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#136F99]">Panduan Destinasi</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#136F99]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Destination Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onSelectDestinationFilter('All')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap ${
            selectedDestinationFilter === 'All'
              ? 'bg-[#E7F3F8] text-[#136F99] border border-[#136F99]/30'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          Semua Destinasi
        </button>
        {DESTINATIONS_DATA.map((dest) => {
          const active = selectedDestinationFilter === dest.id;
          return (
            <button
              key={dest.id}
              type="button"
              onClick={() => onSelectDestinationFilter(dest.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap ${
                active
                  ? 'bg-[#E7F3F8] text-[#136F99] border border-[#136F99]/30'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {dest.name}
            </button>
          );
        })}
      </div>

      {/* Count & Sort */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-semibold text-slate-600">
          Menampilkan <strong className="text-slate-900">{filteredPackages.length}</strong> paket wisata
        </span>
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            aria-label="Urutkan paket"
            value={sortBy}
            onChange={(e) => onChangeSortBy(e.target.value as SortBy)}
            className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none"
          >
            <option value="recommended">Rekomendasi</option>
            <option value="price_asc">Harga: Terendah</option>
            <option value="price_desc">Harga: Tertinggi</option>
            <option value="rating_desc">Rating Tertinggi</option>
          </select>
        </div>
      </div>

      {/* Tour Package Cards */}
      {filteredPackages.length === 0 ? (
        <EmptyState
          icon={<Compass className="w-6 h-6" />}
          title="Paket Wisata Tidak Ditemukan"
          description="Coba ubah kata kunci pencarian, destinasi, rentang harga, atau filter durasi Anda."
          actionLabel="Atur Ulang Filter"
          onAction={onResetAllFilters}
        />
      ) : (
        <div className="space-y-3.5">
          {filteredPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onSelect={onOpenPackage}
              isWishlisted={wishlistIds.includes(pkg.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};
