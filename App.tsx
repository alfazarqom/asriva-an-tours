import React, { useEffect, useRef } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AppHeader } from './src/components/layout/AppHeader';
import { BottomNav } from './src/components/layout/BottomNav';
import { ExploreFilterSheet } from './src/components/overlays/ExploreFilterSheet';
import { LegalModal } from './src/components/overlays/LegalModal';
import { NotificationsModal } from './src/components/overlays/NotificationsModal';
import { ReviewModal } from './src/components/overlays/ReviewModal';
import { ToastStack } from './src/components/ui/ToastStack';
import { useTravelApp } from './src/hooks/useTravelApp';
import { BookingPage } from './src/pages/standalone/BookingPage';
import { BookingResultPage } from './src/pages/standalone/BookingResultPage';
import { CheckoutPage } from './src/pages/standalone/CheckoutPage';
import { DestinationDetailPage } from './src/pages/standalone/DestinationDetailPage';
import { InfoPage } from './src/pages/standalone/InfoPage';
import { PackageDetailPage } from './src/pages/standalone/PackageDetailPage';
import { ExplorePage } from './src/pages/tabs/ExplorePage';
import { HomePage } from './src/pages/tabs/HomePage';
import { MyTripsPage } from './src/pages/tabs/MyTripsPage';
import { ProfilePage } from './src/pages/tabs/ProfilePage';
import { WishlistPage } from './src/pages/tabs/WishlistPage';
import { Booking, BookingDraft, InfoPageKey, MainTab, PricingBreakdown, ToastMessage, TravelPackage } from './src/types/travel';
import { initNativeViewportLock } from './src/utils/nativeExperience';

const VALID_INFO_PAGES: InfoPageKey[] = ['about', 'contact', 'help', 'terms', 'privacy'];

interface MainShellLayoutProps {
  activeTab: MainTab;
  unreadNotificationsCount: number;
  mainContentRef: React.RefObject<HTMLElement | null>;
  onSelectTab: (tab: MainTab) => void;
  onNotificationsClick: () => void;
}

const MainShellLayout: React.FC<MainShellLayoutProps> = ({
  activeTab,
  unreadNotificationsCount,
  mainContentRef,
  onSelectTab,
  onNotificationsClick
}) => (
  <div className="app-shell">
    <AppHeader
      unreadNotificationsCount={unreadNotificationsCount}
      onLogoClick={() => onSelectTab('home')}
      onNotificationsClick={onNotificationsClick}
      onProfileClick={() => onSelectTab('profile')}
    />

    <main ref={mainContentRef} className="app-content">
      <div key={activeTab} className="animate-tab-enter">
        <Outlet />
      </div>
    </main>

    <BottomNav activeTab={activeTab} onChangeTab={onSelectTab} />
  </div>
);

interface DestinationRouteProps {
  wishlistIds: string[];
  onToggleWishlist: (pkgId: string) => void;
  onBack: () => void;
  onFallbackToExplore: () => void;
  onOpenDestination: (destinationId: string) => void;
  onOpenPackage: (packageId: string) => void;
}

const DestinationRoute: React.FC<DestinationRouteProps> = ({
  wishlistIds,
  onToggleWishlist,
  onBack,
  onFallbackToExplore,
  onOpenDestination,
  onOpenPackage
}) => {
  const { destinationId = '' } = useParams();
  return (
    <div key={destinationId} className="flex-1 min-h-0 h-full animate-page-push">
      <DestinationDetailPage
        destinationId={destinationId}
        wishlistIds={wishlistIds}
        onToggleWishlist={onToggleWishlist}
        onBack={onBack}
        onFallbackToExplore={onFallbackToExplore}
        onOpenDestination={onOpenDestination}
        onOpenPackage={onOpenPackage}
      />
    </div>
  );
};

interface PackageRouteProps {
  bookings: Booking[];
  wishlistIds: string[];
  onToggleWishlist: (pkgId: string) => void;
  onSharePackage: () => void;
  onBack: () => void;
  onFallbackToExplore: () => void;
  onOpenDestination: (destinationId: string) => void;
  onStartBooking: (packageId: string) => void;
}

const PackageRoute: React.FC<PackageRouteProps> = ({
  bookings,
  wishlistIds,
  onToggleWishlist,
  onSharePackage,
  onBack,
  onFallbackToExplore,
  onOpenDestination,
  onStartBooking
}) => {
  const { packageId = '' } = useParams();
  const extraReviews = bookings
    .filter((b) => b.packageId === packageId && b.review)
    .map((b) => ({
      id: `user-rev-${b.bookingReference}`,
      author: b.review!.author,
      date: b.review!.submittedAt,
      rating: b.review!.rating,
      comment: b.review!.comment
    }));

  return (
    <div key={packageId} className="flex-1 min-h-0 h-full animate-page-push">
      <PackageDetailPage
        packageId={packageId}
        extraReviews={extraReviews}
        wishlistIds={wishlistIds}
        onToggleWishlist={onToggleWishlist}
        onSharePackage={onSharePackage}
        onBack={onBack}
        onFallbackToExplore={onFallbackToExplore}
        onOpenDestination={onOpenDestination}
        onStartBooking={onStartBooking}
      />
    </div>
  );
};

interface BookingRouteProps {
  activeBookingPackage: TravelPackage;
  bookingDraft: BookingDraft;
  activePricing: PricingBreakdown;
  syncBookingPackage: (packageId: string) => boolean;
  onChangeBookingDraft: React.Dispatch<React.SetStateAction<BookingDraft>>;
  onUpdateTravelerCounts: (adults: number, children: number, infants: number) => void;
  onBack: (packageId: string) => void;
  onProceedToCheckout: () => void;
}

const BookingRoute: React.FC<BookingRouteProps> = ({
  activeBookingPackage,
  bookingDraft,
  activePricing,
  syncBookingPackage,
  onChangeBookingDraft,
  onUpdateTravelerCounts,
  onBack,
  onProceedToCheckout
}) => {
  const { packageId = '' } = useParams();

  useEffect(() => {
    if (packageId) {
      syncBookingPackage(packageId);
    }
  }, [packageId, syncBookingPackage]);

  return (
    <div key={packageId} className="flex-1 min-h-0 h-full animate-page-push">
      <BookingPage
        packageId={packageId}
        activeBookingPackage={activeBookingPackage}
        bookingDraft={bookingDraft}
        activePricing={activePricing}
        onChangeBookingDraft={onChangeBookingDraft}
        onUpdateTravelerCounts={onUpdateTravelerCounts}
        onBack={onBack}
        onProceedToCheckout={onProceedToCheckout}
      />
    </div>
  );
};

interface BookingResultRouteProps {
  isConfirmationScreen: boolean;
  bookings: Booking[];
  isCheckingPaywuzStatus: boolean;
  isCancellingPaywuz: boolean;
  onRefreshPaywuzStatus: (bookingReference: string) => void;
  onBack: () => void;
  onFallbackToBookings: () => void;
  onOpenBookingDetail: (bookingReference: string) => void;
  onOpenReviewModal: (bookingReference: string) => void;
  onCancelBooking: (bookingReference: string) => void;
  onReturnHome: () => void;
  onShowToast: (message: string, type?: ToastMessage['type']) => void;
}

const BookingResultRoute: React.FC<BookingResultRouteProps> = ({
  isConfirmationScreen,
  bookings,
  isCheckingPaywuzStatus,
  isCancellingPaywuz,
  onRefreshPaywuzStatus,
  onBack,
  onFallbackToBookings,
  onOpenBookingDetail,
  onOpenReviewModal,
  onCancelBooking,
  onReturnHome,
  onShowToast
}) => {
  const { bookingReference = '' } = useParams();
  return (
    <div key={bookingReference} className="flex-1 min-h-0 h-full animate-page-push">
      <BookingResultPage
        bookingReference={bookingReference}
        isConfirmationScreen={isConfirmationScreen}
        bookings={bookings}
        isCheckingPaywuzStatus={isCheckingPaywuzStatus}
        isCancellingPaywuz={isCancellingPaywuz}
        onRefreshPaywuzStatus={onRefreshPaywuzStatus}
        onBack={onBack}
        onFallbackToBookings={onFallbackToBookings}
        onOpenBookingDetail={onOpenBookingDetail}
        onOpenReviewModal={onOpenReviewModal}
        onCancelBooking={onCancelBooking}
        onReturnHome={onReturnHome}
        onShowToast={onShowToast}
      />
    </div>
  );
};

interface InfoRouteProps {
  onBack: () => void;
}

const InfoRoute: React.FC<InfoRouteProps> = ({ onBack }) => {
  const { page = '' } = useParams();
  if (!VALID_INFO_PAGES.includes(page as InfoPageKey)) {
    return <Navigate to="/" replace />;
  }
  return (
    <div key={page} className="flex-1 min-h-0 h-full animate-page-push">
      <InfoPage page={page as InfoPageKey} onBack={onBack} />
    </div>
  );
};

export function App() {
  const app = useTravelApp();
  const navigate = useNavigate();
  const location = useLocation();
  const mainContentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    return initNativeViewportLock();
  }, []);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route
          element={
            <MainShellLayout
              activeTab={app.activeTab}
              unreadNotificationsCount={app.unreadNotificationsCount}
              mainContentRef={mainContentRef}
              onSelectTab={app.setActiveTab}
              onNotificationsClick={app.openNotificationsModal}
            />
          }
        >
          <Route
            path="/"
            element={
              <HomePage
                searchQuery={app.searchQuery}
                onChangeSearchQuery={app.setSearchQuery}
                wishlistIds={app.wishlistIds}
                onToggleWishlist={app.toggleWishlist}
                onSelectCategory={app.setSelectedCategory}
                onNavigateToExplore={() => navigate('/explore')}
                onOpenDestination={app.openDestinationDetail}
                onOpenPackage={app.openPackageDetail}
                onOpenInfoPage={app.openInfoPage}
              />
            }
          />
          <Route
            path="/explore"
            element={
              <ExplorePage
                searchQuery={app.searchQuery}
                onChangeSearchQuery={app.setSearchQuery}
                selectedCategory={app.selectedCategory}
                onSelectCategory={app.setSelectedCategory}
                selectedDestinationFilter={app.selectedDestinationFilter}
                onSelectDestinationFilter={app.setSelectedDestinationFilter}
                sortBy={app.sortBy}
                onChangeSortBy={app.setSortBy}
                activeFilterCount={app.activeFilterCount}
                onOpenFilterSheet={() => app.setFilterSheetOpen(true)}
                filteredPackages={app.filteredPackages}
                wishlistIds={app.wishlistIds}
                onToggleWishlist={app.toggleWishlist}
                onOpenDestination={app.openDestinationDetail}
                onOpenPackage={app.openPackageDetail}
                onResetAllFilters={app.resetAllFilters}
              />
            }
          />
          <Route
            path="/wishlist"
            element={
              <WishlistPage
                wishlistIds={app.wishlistIds}
                onToggleWishlist={app.toggleWishlist}
                onOpenPackage={app.openPackageDetail}
                onNavigateToExplore={() => navigate('/explore')}
              />
            }
          />
          <Route
            path="/trips"
            element={
              <MyTripsPage
                bookings={app.bookings}
                verifiedBookingRefs={app.verifiedBookingRefs}
                tripSubTab={app.tripSubTab}
                onChangeTripSubTab={app.setTripSubTab}
                lookupRef={app.lookupRef}
                onChangeLookupRef={app.setLookupRef}
                lookupContact={app.lookupContact}
                onChangeLookupContact={app.setLookupContact}
                lookupError={app.lookupError}
                onLookupBooking={app.handleLookupBooking}
                onOpenBookingDetail={app.openBookingDetail}
                onOpenReviewModal={(ref) => app.setReviewBookingRef(ref)}
                onNavigateToExplore={() => navigate('/explore')}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <ProfilePage
                guestInfo={app.guestInfo}
                onChangeGuestInfo={app.setGuestInfo}
                wishlistCount={app.wishlistIds.length}
                verifiedBookingCount={app.verifiedBookingRefs.length}
                onNavigateToWishlist={() => navigate('/wishlist')}
                onNavigateToBookings={() => navigate('/trips')}
                onOpenInfoPage={app.openInfoPage}
                onClearGuestSession={app.clearGuestSession}
              />
            }
          />
        </Route>

        <Route
          path="/destinations/:destinationId"
          element={
            <DestinationRoute
              wishlistIds={app.wishlistIds}
              onToggleWishlist={app.toggleWishlist}
              onBack={() => app.goBack('/')}
              onFallbackToExplore={() => navigate('/explore', { replace: true })}
              onOpenDestination={app.openDestinationDetail}
              onOpenPackage={app.openPackageDetail}
            />
          }
        />
        <Route
          path="/packages/:packageId"
          element={
            <PackageRoute
              bookings={app.bookings}
              wishlistIds={app.wishlistIds}
              onToggleWishlist={app.toggleWishlist}
              onSharePackage={() => app.showToast('Tautan paket berhasil disalin.', 'success')}
              onBack={() => app.goBack('/explore')}
              onFallbackToExplore={() => navigate('/explore', { replace: true })}
              onOpenDestination={app.openDestinationDetail}
              onStartBooking={app.startBookingForPackage}
            />
          }
        />
        <Route
          path="/packages/:packageId/book"
          element={
            <BookingRoute
              activeBookingPackage={app.activeBookingPackage}
              bookingDraft={app.bookingDraft}
              activePricing={app.activePricing}
              syncBookingPackage={app.syncBookingPackage}
              onChangeBookingDraft={app.setBookingDraft}
              onUpdateTravelerCounts={app.updateTravelerCounts}
              onBack={(pkgId) => navigate(`/packages/${pkgId}`)}
              onProceedToCheckout={app.handleProceedToCheckout}
            />
          }
        />
        <Route
          path="/checkout"
          element={
            <div className="flex-1 min-h-0 h-full animate-page-push">
              <CheckoutPage
                activeBookingPackage={app.activeBookingPackage}
                bookingDraft={app.bookingDraft}
                activePricing={app.activePricing}
                guestInfo={app.guestInfo}
                sameWhatsappAsPhone={app.sameWhatsappAsPhone}
                contactIsMainTraveler={app.contactIsMainTraveler}
                selectedPaymentId={app.selectedPaymentId}
                selectedPaywuzBank={app.selectedPaywuzBank}
                selectedPaywuzRetailer={app.selectedPaywuzRetailer}
                paywuzMethods={app.paywuzMethods}
                paywuzMethodsLoading={app.paywuzMethodsLoading}
                paywuzMethodsError={app.paywuzMethodsError}
                onRetryPaywuzMethods={() => void app.loadPaywuzMethods(app.activePricing.totalAmount)}
                onSelectPaywuzBank={app.setSelectedPaywuzBank}
                onSelectPaywuzRetailer={app.setSelectedPaywuzRetailer}
                agreedTerms={app.agreedTerms}
                formErrors={app.formErrors}
                isSubmittingBooking={app.isSubmittingBooking}
                onChangeBookingDraft={app.setBookingDraft}
                onChangeGuestInfo={app.setGuestInfo}
                onChangeSameWhatsappAsPhone={app.setSameWhatsappAsPhone}
                onChangeContactIsMainTraveler={app.setContactIsMainTraveler}
                onSelectPaymentId={app.setSelectedPaymentId}
                onChangeAgreedTerms={app.setAgreedTerms}
                onClearFieldError={app.clearFieldError}
                onOpenLegalModal={app.setLegalModal}
                onShowToast={app.showToast}
                onBackToBooking={(pkgId) => navigate(`/packages/${pkgId}/book`)}
                onConfirmBooking={app.handleConfirmBooking}
              />
            </div>
          }
        />
        <Route
          path="/booking/confirmed/:bookingReference"
          element={
            <BookingResultRoute
              isConfirmationScreen
              bookings={app.bookings}
              isCheckingPaywuzStatus={app.isCheckingPaywuzStatus}
              isCancellingPaywuz={app.isCancellingPaywuz}
              onRefreshPaywuzStatus={app.handleRefreshPaywuzStatus}
              onBack={() => app.goBack('/trips')}
              onFallbackToBookings={() => navigate('/trips', { replace: true })}
              onOpenBookingDetail={app.openBookingDetail}
              onOpenReviewModal={(ref) => app.setReviewBookingRef(ref)}
              onCancelBooking={app.handleCancelBooking}
              onReturnHome={() => navigate('/', { replace: true })}
              onShowToast={app.showToast}
            />
          }
        />
        <Route
          path="/booking/:bookingReference"
          element={
            <BookingResultRoute
              isConfirmationScreen={false}
              bookings={app.bookings}
              isCheckingPaywuzStatus={app.isCheckingPaywuzStatus}
              isCancellingPaywuz={app.isCancellingPaywuz}
              onRefreshPaywuzStatus={app.handleRefreshPaywuzStatus}
              onBack={() => app.goBack('/trips')}
              onFallbackToBookings={() => navigate('/trips', { replace: true })}
              onOpenBookingDetail={app.openBookingDetail}
              onOpenReviewModal={(ref) => app.setReviewBookingRef(ref)}
              onCancelBooking={app.handleCancelBooking}
              onReturnHome={() => navigate('/', { replace: true })}
              onShowToast={app.showToast}
            />
          }
        />
        <Route
          path="/info/:page"
          element={<InfoRoute onBack={() => app.goBack('/profile')} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ExploreFilterSheet
        open={app.filterSheetOpen}
        onClose={() => app.setFilterSheetOpen(false)}
        priceFilter={app.priceFilter}
        onChangePriceFilter={app.setPriceFilter}
        durationFilter={app.durationFilter}
        onChangeDurationFilter={app.setDurationFilter}
        onResetFilters={app.resetSheetFilters}
        resultCount={app.filteredPackages.length}
      />

      <NotificationsModal
        open={app.notificationModalOpen}
        onClose={() => app.setNotificationModalOpen(false)}
        notifications={app.notifications}
      />

      <LegalModal
        type={app.legalModal}
        onClose={() => app.setLegalModal(null)}
        onAcceptAndClose={() => {
          app.setAgreedTerms(true);
          app.setLegalModal(null);
        }}
      />

      <ReviewModal
        booking={app.activeReviewBooking}
        onClose={() => app.setReviewBookingRef(null)}
        onSubmitReview={app.handleSubmitReview}
      />

      <ToastStack toasts={app.toasts} />
    </>
  );
}

export default App;
