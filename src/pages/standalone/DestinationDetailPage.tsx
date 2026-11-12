import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { DestinationAttractionsMap } from '../../components/DestinationAttractionsMap';
import { PackageCard } from '../../components/PackageCard';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { StandaloneHeader } from '../../components/ui/StandaloneHeader';
import { DESTINATIONS_DATA } from '../../data/destinations';
import { PACKAGES_DATA } from '../../data/packages';

export interface DestinationDetailPageProps {
  destinationId: string;
  wishlistIds: string[];
  onToggleWishlist: (pkgId: string) => void;
  onBack: () => void;
  onFallbackToExplore: () => void;
  onOpenDestination: (destinationId: string) => void;
  onOpenPackage: (packageId: string) => void;
}

export const DestinationDetailPage: React.FC<DestinationDetailPageProps> = ({
  destinationId,
  wishlistIds,
  onToggleWishlist,
  onBack,
  onFallbackToExplore,
  onOpenDestination,
  onOpenPackage
}) => {
  const [selectedAttractionIndex, setSelectedAttractionIndex] = useState<number | null>(null);
  const dest = DESTINATIONS_DATA.find((d) => d.id === destinationId);

  if (!dest) {
    return (
      <div className="app-shell">
        <StandaloneHeader title="Destinasi" onBack={onBack} />
        <div className="app-content p-4">
          <EmptyState
            icon={<MapPin className="w-6 h-6" />}
            title="Destinasi Tidak Ditemukan"
            description="Destinasi yang Anda minta tidak dapat dimuat."
            actionLabel="Kembali ke Eksplorasi"
            onAction={onFallbackToExplore}
          />
        </div>
      </div>
    );
  }

  const relatedPackages = PACKAGES_DATA.filter((p) => p.destinationId === dest.id);
  const otherDestinations = DESTINATIONS_DATA.filter((d) => d.id !== dest.id);

  return (
    <div className="app-shell">
      <StandaloneHeader title={dest.name} onBack={onBack} />
      <div className="app-content pb-8">
        <div className="relative h-56 w-full bg-slate-800">
          <img src={dest.heroImage} alt={dest.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/25 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <Badge variant="accent" className="mb-1.5">
              {dest.country} • {dest.region}
            </Badge>
            <h2 className="text-xl font-extrabold leading-tight">{dest.name}</h2>
            <p className="text-xs text-slate-200 mt-0.5">{dest.tagline}</p>
          </div>
        </div>

        <div className="p-4 space-y-5">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Tentang {dest.name}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{dest.description}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Informasi Penting Perjalanan</h3>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Waktu Terbaik</div>
                <div className="font-bold text-slate-800 mt-0.5">{dest.bestTimeToVisit}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Mata Uang</div>
                <div className="font-bold text-slate-800 mt-0.5">{dest.currency}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Bahasa</div>
                <div className="font-bold text-slate-800 mt-0.5">{dest.language}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Zona Waktu</div>
                <div className="font-bold text-slate-800 mt-0.5">{dest.timezone}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2.5">Galeri Destinasi</h3>
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
              {dest.gallery.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  alt={`Foto ${dest.name} ${idx + 1}`}
                  className="w-40 h-28 rounded-xl object-cover shrink-0 border border-slate-200"
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#136F99]" />
                <h3 className="text-sm font-bold text-slate-900">Peta & Daya Tarik Populer</h3>
              </div>
              <Badge variant="neutral">Koordinat Placeholder</Badge>
            </div>

            <DestinationAttractionsMap
              destinationId={dest.id}
              destinationName={dest.name}
              center={dest.mapCenter}
              defaultZoom={dest.mapZoom}
              attractions={dest.popularAttractions}
              selectedIndex={selectedAttractionIndex}
              onSelectAttraction={setSelectedAttractionIndex}
            />

            <p className="text-[11px] text-slate-500">
              Ketuk pin pada peta atau pilih kartu atraksi di bawah untuk menyorot lokasi (koordinat placeholder).
            </p>

            <div className="space-y-2">
              {dest.popularAttractions.map((attr, idx) => {
                const isSelected = selectedAttractionIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAttractionIndex(isSelected ? null : idx)}
                    className={`w-full text-left p-3 rounded-xl border transition ${
                      isSelected
                        ? 'bg-[#E7F3F8]/60 border-[#136F99] ring-1 ring-[#136F99]/30'
                        : 'bg-slate-50 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-full text-[11px] font-extrabold inline-flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#D97706] text-white' : 'bg-[#0B2545] text-white'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate">{attr.name}</span>
                      </div>
                      <Badge variant="ocean">{attr.category}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-7">{attr.description}</p>
                    <div className="mt-1.5 pl-7 flex items-center gap-1 text-[10px] font-mono text-slate-500">
                      <MapPin className="w-3 h-3 text-[#136F99]" />
                      <span>
                        {attr.coordinates.lat.toFixed(4)}, {attr.coordinates.lng.toFixed(4)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2.5">
              Paket Wisata Tersedia ({relatedPackages.length})
            </h3>
            <div className="space-y-3">
              {relatedPackages.map((pkg) => (
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

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2.5">Jelajahi Destinasi Lainnya</h3>
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
              {otherDestinations.map((other) => (
                <button
                  key={other.id}
                  type="button"
                  onClick={() => {
                    setSelectedAttractionIndex(null);
                    onOpenDestination(other.id);
                  }}
                  className="w-36 shrink-0 rounded-xl overflow-hidden bg-white border border-slate-200 text-left shadow-xs"
                >
                  <img src={other.heroImage} alt={other.name} className="w-full h-20 object-cover" />
                  <div className="p-2">
                    <div className="text-xs font-bold text-slate-900 truncate">{other.name}</div>
                    <div className="text-[10px] text-slate-500">{other.country}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
