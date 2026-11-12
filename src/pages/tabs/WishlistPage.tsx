import React from 'react';
import { Heart } from 'lucide-react';
import { PackageCard } from '../../components/PackageCard';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { PACKAGES_DATA } from '../../data/packages';

export interface WishlistPageProps {
  wishlistIds: string[];
  onToggleWishlist: (pkgId: string) => void;
  onOpenPackage: (packageId: string) => void;
  onNavigateToExplore: () => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  wishlistIds,
  onToggleWishlist,
  onOpenPackage,
  onNavigateToExplore
}) => {
  const wishlistedPackages = PACKAGES_DATA.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="p-4 space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Wishlist Tersimpan</h2>
          <p className="text-xs text-slate-500">Bandingkan dan pesan paket wisata favorit Anda</p>
        </div>
        <Badge variant="ocean">{wishlistedPackages.length} Tersimpan</Badge>
      </div>

      {wishlistedPackages.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-6 h-6" />}
          title="Wishlist Anda Masih Kosong"
          description="Ketuk ikon hati pada kartu paket wisata mana pun untuk menyimpannya di sini."
          actionLabel="Jelajahi Paket"
          onAction={onNavigateToExplore}
        />
      ) : (
        <div className="space-y-3.5">
          {wishlistedPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onSelect={onOpenPackage}
              isWishlisted={true}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};
