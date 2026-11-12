import React from 'react';
import { Search, Sparkles, Star, X } from 'lucide-react';
import { PackageCard } from '../../components/PackageCard';
import { HOME_TESTIMONIALS, TRAVEL_CATEGORIES } from '../../data/constants';
import { DESTINATIONS_DATA } from '../../data/destinations';
import { PACKAGES_DATA } from '../../data/packages';
import { InfoPageKey } from '../../types/travel';

export interface HomePageProps {
  searchQuery: string;
  onChangeSearchQuery: (value: string) => void;
  wishlistIds: string[];
  onToggleWishlist: (pkgId: string) => void;
  onSelectCategory: (category: string) => void;
  onNavigateToExplore: () => void;
  onOpenDestination: (destinationId: string) => void;
  onOpenPackage: (packageId: string) => void;
  onOpenInfoPage: (page: InfoPageKey) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  searchQuery,
  onChangeSearchQuery,
  wishlistIds,
  onToggleWishlist,
  onSelectCategory,
  onNavigateToExplore,
  onOpenDestination,
  onOpenPackage,
  onOpenInfoPage
}) => {
  const featuredPackages = PACKAGES_DATA.filter((p) => p.featured);
  const recommendedPackages = PACKAGES_DATA.filter((p) => p.recommended);
  const specialOffers = PACKAGES_DATA.filter((p) => p.specialOffer);

  return (
    <div className="p-4 space-y-6 pb-8">
      {/* Tagline & Search Destination */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-[#136F99]">Discover More. Travel Beyond.</p>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Mau liburan ke mana berikutnya?
          </h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onNavigateToExplore();
          }}
          className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200 px-3.5 py-2.5 shadow-2xs"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            placeholder="Cari destinasi, Bali, Komodo, Jepang..."
            className="flex-1 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onChangeSearchQuery('')}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-[#0B2545] text-white text-[11px] font-bold shrink-0"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Hero Promotional Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-[#0B2545] text-white p-4 shadow-md">
        <img
          src="https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=900&q=70"
          alt="Perjalanan unggulan"
          className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
        />
        <div className="relative z-10 max-w-[85%]">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            Koleksi Pilihan ASRIVA
          </span>
          <h3 className="text-base font-extrabold leading-snug mb-1">
            Perjalanan Terkurasi di Indonesia & Mancanegara
          </h3>
          <p className="text-[11px] text-slate-200 leading-relaxed mb-3">
            Pesan langsung tanpa akun dengan rincian harga IDR transparan dan pemandu terpercaya.
          </p>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('Semua');
              onNavigateToExplore();
            }}
            className="px-4 py-2 rounded-xl bg-[#D97706] text-white text-xs font-extrabold shadow-xs active:scale-95 transition"
          >
            Jelajahi Paket
          </button>
        </div>
      </div>

      {/* Travel Categories */}
      <div>
        <h3 className="text-sm font-extrabold text-slate-900 mb-2.5">Kategori Perjalanan</h3>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {TRAVEL_CATEGORIES.filter((c) => c !== 'Semua').map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                onSelectCategory(cat);
                onNavigateToExplore();
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 whitespace-nowrap shadow-2xs hover:border-[#136F99] hover:text-[#136F99] active:scale-95 transition"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Popular Destinations */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-extrabold text-slate-900">Destinasi Populer</h3>
          <button
            type="button"
            onClick={onNavigateToExplore}
            className="text-xs font-bold text-[#136F99]"
          >
            Lihat semua
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {DESTINATIONS_DATA.map((dest) => (
            <div
              key={dest.id}
              onClick={() => onOpenDestination(dest.id)}
              className="relative w-36 h-44 rounded-2xl overflow-hidden shrink-0 bg-slate-800 shadow-xs cursor-pointer active:scale-[0.98] transition"
            >
              <img src={dest.heroImage} alt={dest.name} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                <div className="text-[10px] text-amber-300 font-semibold">{dest.country}</div>
                <div className="text-xs font-bold leading-tight">{dest.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Tour Packages */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Paket Wisata Unggulan</h3>
            <p className="text-[11px] text-slate-500">Rencana perjalanan pilihan terbaik</p>
          </div>
          <button
            type="button"
            onClick={onNavigateToExplore}
            className="text-xs font-bold text-[#136F99]"
          >
            Lihat semua
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {featuredPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onSelect={onOpenPackage}
              isWishlisted={wishlistIds.includes(pkg.id)}
              onToggleWishlist={onToggleWishlist}
              compact
            />
          ))}
        </div>
      </div>

      {/* Special Offers */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Penawaran Spesial</h3>
            <p className="text-[11px] text-slate-500">Harga promo & hemat musiman</p>
          </div>
        </div>
        <div className="space-y-3">
          {specialOffers.slice(0, 2).map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onSelect={onOpenPackage}
              isWishlisted={wishlistIds.includes(pkg.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </div>

      {/* Recommended Experiences */}
      <div>
        <h3 className="text-sm font-extrabold text-slate-900 mb-2.5">Rekomendasi Pengalaman</h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {recommendedPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onSelect={onOpenPackage}
              isWishlisted={wishlistIds.includes(pkg.id)}
              onToggleWishlist={onToggleWishlist}
              compact
            />
          ))}
        </div>
      </div>

      {/* Customer Testimonials */}
      <div>
        <h3 className="text-sm font-extrabold text-slate-900 mb-2.5">Testimoni Pelanggan</h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {HOME_TESTIMONIALS.map((item, i) => (
            <div
              key={i}
              className="w-64 shrink-0 bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-0.5 text-amber-400 mb-2">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">"{item.quote}"</p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-900">{item.name}</div>
                <div className="text-[10px] text-slate-400">{item.trip}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation Card */}
      <footer className="bg-[#0B2545] text-white rounded-2xl p-4 space-y-3 text-xs">
        <div>
          <div className="font-extrabold text-sm tracking-tight">ASRIVA TRAVEL & TOURS</div>
          <div className="text-[11px] text-sky-200 mt-0.5">Discover More. Travel Beyond.</div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-200">
          <button
            type="button"
            onClick={() => onOpenInfoPage('about')}
            className="text-left hover:text-white"
          >
            Tentang ASRIVA
          </button>
          <button
            type="button"
            onClick={() => onOpenInfoPage('contact')}
            className="text-left hover:text-white"
          >
            Hubungi Concierge
          </button>
          <button
            type="button"
            onClick={() => onOpenInfoPage('help')}
            className="text-left hover:text-white"
          >
            Pusat Bantuan & FAQ
          </button>
          <button
            type="button"
            onClick={() => onOpenInfoPage('terms')}
            className="text-left hover:text-white"
          >
            Syarat & Privasi
          </button>
        </div>
      </footer>
    </div>
  );
};
