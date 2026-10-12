import React, { useState } from 'react';
import { useNutriStore } from '../../hooks/useNutriStore';
import { SurplusOffer, SurplusClaim } from '../../types';
import {
  Tag,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ShieldAlert,
  ArrowRight,
  Flame,
} from 'lucide-react';

interface FlashSaleProps {
  onNavigateToClaims: () => void;
}

export const FlashSale: React.FC<FlashSaleProps> = ({ onNavigateToClaims }) => {
  const store = useNutriStore();
  const currentUser = store.getCurrentUser();
  const offers = store.getSurplusOffers();
  const myClaims = store.getClaimsForUser();

  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [successClaim, setSuccessClaim] = useState<SurplusClaim | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClaim = (offer: SurplusOffer) => {
    setErrorMessage(null);
    setClaimingId(offer.id);

    // Simulate realistic 300ms network transaction with atomic lock
    setTimeout(() => {
      const result = store.claimSurplusMeal(offer.id);
      setClaimingId(null);

      if (result.success && result.claim) {
        setSuccessClaim(result.claim);
      } else {
        setErrorMessage(result.error || 'Failed to claim offer. Please try again.');
      }
    }, 250);
  };

  const hasAlreadyClaimed = (offerId: string) => {
    return myClaims.some((c) => c.offerId === offerId && c.status === 'claimed');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 to-amber-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Zero Kitchen Waste Initiative</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Surplus Food Flash Sale
          </h1>
          <p className="text-amber-100/90 text-sm leading-relaxed mb-4">
            Fresh, wholesome canteen meals prepared today and offered at steep discounts (up to 65% off) before meal periods conclude. Claim your portion to stop food waste in its tracks!
          </p>

          <div className="flex items-center gap-4 text-xs text-amber-200">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-300" /> Strict pickup windows
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-300" /> 1 portion per student limit
            </span>
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 hidden md:flex items-center justify-center p-8 opacity-15 pointer-events-none">
          <Tag className="w-72 h-72 text-amber-300" />
        </div>
      </div>

      {/* Global Error Notice if any */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-xs text-rose-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-900 font-bold ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Active Surplus Offers Grid */}
      {offers.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No surplus offers active right now</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Great news! Kitchen preparations are currently aligned with student RSVPs. New flash sales appear between 2:00 PM and 3:30 PM.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => {
            const isSoldOut = offer.status === 'sold_out' || offer.availableQuantity <= 0;
            const isDeactivated = offer.status === 'deactivated' || offer.status === 'expired';
            const claimedByMe = hasAlreadyClaimed(offer.id);
            const discountPct = Math.round(
              ((offer.originalPrice - offer.discountedPrice) / offer.originalPrice) * 100
            );

            // Stock status color: green for high, orange for low stock (< 5), red for sold out
            const stockColorClass = isSoldOut
              ? 'text-rose-700 bg-rose-50 border-rose-200'
              : offer.availableQuantity <= 4
              ? 'text-amber-800 bg-amber-50 border-amber-200'
              : 'text-emerald-800 bg-emerald-50 border-emerald-200';

            return (
              <div
                key={offer.id}
                className={`bg-white rounded-2xl border overflow-hidden flex flex-col justify-between transition-all ${
                  isSoldOut || isDeactivated
                    ? 'border-slate-200 opacity-75'
                    : 'border-slate-200 hover:border-amber-400 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img
                      src={offer.imageUrl}
                      alt={offer.mealName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />

                    {/* Discount Badge */}
                    <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>{discountPct}% OFF</span>
                    </div>

                    {/* Stock Indicator */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-md border shadow-xs ${stockColorClass}`}
                      >
                        {isSoldOut
                          ? 'Sold Out'
                          : `${offer.availableQuantity} of ${offer.initialQuantity} left`}
                      </span>
                    </div>

                    {/* Sold out overlay banner */}
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                        <span className="bg-rose-600 text-white text-sm font-bold px-4 py-1.5 rounded-lg uppercase tracking-wider shadow-md">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    {/* Zero-Pill unboxed metadata */}
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <span>Broadcast by {offer.createdBy}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-800 font-medium">Flash Sale</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {offer.mealName}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {offer.description}
                    </p>

                    {/* Pickup Details Box */}
                    <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-200/60 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-amber-950 font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>
                          Pickup Deadline: <strong className="text-amber-900">{offer.pickupDeadline}</strong>
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5 text-slate-600 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{offer.pickupLocation}</span>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-2xl font-bold text-slate-900 tabular-nums">
                        ₹{offer.discountedPrice}
                      </span>
                      <span className="text-xs text-slate-400 line-through tabular-nums">
                        ₹{offer.originalPrice}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 ml-auto tabular-nums">
                        Save ₹{offer.originalPrice - offer.discountedPrice}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Claim Button */}
                <div className="p-5 pt-0">
                  {claimedByMe ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center text-xs">
                      <span className="text-emerald-800 font-semibold flex items-center justify-center gap-1 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        You have claimed this meal
                      </span>
                      <button
                        onClick={onNavigateToClaims}
                        className="text-emerald-700 font-bold underline hover:text-emerald-900 cursor-pointer inline-flex items-center gap-1"
                      >
                        View Claim Token <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClaim(offer)}
                      disabled={isSoldOut || isDeactivated || claimingId === offer.id}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isSoldOut || isDeactivated
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-[#1C3B2B] hover:bg-[#27533c] text-white shadow-sm hover:shadow-md'
                      }`}
                    >
                      {claimingId === offer.id ? (
                        <span>Validating with Canteen Server...</span>
                      ) : isSoldOut ? (
                        <span>Sold Out</span>
                      ) : (
                        <>
                          <Tag className="w-4 h-4 text-lime-400" />
                          <span>Claim Surplus Meal (₹{offer.discountedPrice})</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUCCESS CLAIM POPUP MODAL */}
      {successClaim && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-emerald-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Claimed Successfully!
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your surplus meal portion has been reserved in the canteen system.
              </p>
            </div>

            {/* Claim Reference Token Card */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-left space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase">
                  Claim Reference Code
                </span>
                <span className="font-mono text-base font-bold text-slate-900 tracking-wider">
                  {successClaim.claimCode}
                </span>
              </div>

              <div className="text-xs space-y-1 text-slate-700">
                <p>
                  <strong>Meal:</strong> {successClaim.offerMealName}
                </p>
                <p>
                  <strong>Student:</strong> {currentUser.name} ({currentUser.studentId})
                </p>
                <p>
                  <strong>Amount to Pay:</strong> ₹{successClaim.pricePaid} (at pickup)
                </p>
                <p className="text-emerald-900 font-semibold pt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  Pickup Deadline: {successClaim.pickupDeadline}
                </p>
                <p className="text-[11px] text-slate-500 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  {successClaim.pickupLocation}
                </p>
              </div>
            </div>

            {/* Simulated Digital QR */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-1">
              <QrCode className="w-4 h-4 text-slate-400" />
              <span>Show code {successClaim.claimCode} at the canteen collection counter</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSuccessClaim(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSuccessClaim(null);
                  onNavigateToClaims();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#1C3B2B] hover:bg-[#27533c] text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                View in My Claims
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
