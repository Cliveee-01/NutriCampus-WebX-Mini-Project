import React from 'react';
import { useNutriStore } from '../../hooks/useNutriStore';
import {
  ShoppingBag,
  Clock,
  MapPin,
  QrCode,
  Tag,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ActiveTab } from '../layout/Navbar';

interface MyClaimsProps {
  onNavigateToFlashSale: () => void;
}

export const MyClaims: React.FC<MyClaimsProps> = ({ onNavigateToFlashSale }) => {
  const store = useNutriStore();
  const currentUser = store.getCurrentUser();
  const claims = store.getClaimsForUser();

  const totalMoneySaved = claims.reduce((acc, c) => acc + (c.pricePaid > 0 ? 40 : 0), 0);
  const totalKgAvoided = Number((claims.length * 0.45).toFixed(1));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Claimed Surplus Meals
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Present your claim tokens at the designated canteen pickup counters before the deadline.
          </p>
        </div>

        {/* Environmental impact metric box */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 text-xs shadow-xs flex items-center gap-4">
          <div>
            <span className="text-slate-400 block text-[11px]">Food Waste Prevented</span>
            <span className="font-bold text-emerald-800 text-sm tabular-nums">
              {totalKgAvoided} kg
            </span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-slate-400 block text-[11px]">Student Savings</span>
            <span className="font-bold text-slate-900 text-sm tabular-nums">
              ~₹{totalMoneySaved}
            </span>
          </div>
        </div>
      </div>

      {/* Claims List */}
      {claims.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No surplus claims yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You haven't claimed any discounted surplus meals yet today. Help prevent cafeteria waste and save on tasty canteen treats!
          </p>
          <button
            onClick={onNavigateToFlashSale}
            className="mt-5 px-5 py-2.5 rounded-xl bg-[#1C3B2B] text-white text-xs font-semibold hover:bg-[#27533c] transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
          >
            <Tag className="w-3.5 h-3.5 text-lime-400" />
            <span>Explore Today’s Flash Sale</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {claims.map((claim) => {
            const dateFormatted = new Date(claim.claimedAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={claim.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors"
              >
                <div className="space-y-4">
                  {/* Top Bar with Status & Reference code */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {claim.status === 'claimed' ? 'Ready for Pickup' : 'Collected'}
                      </span>
                      <span className="text-xs text-slate-400">Claimed at {dateFormatted}</span>
                    </div>

                    <div className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                      {claim.claimCode}
                    </div>
                  </div>

                  {/* Meal Name & Price */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {claim.offerMealName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Portion reserved for student <strong>{claim.studentName}</strong> ({claim.studentId})
                    </p>
                  </div>

                  {/* Pickup Instructions */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-950 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        Pickup Deadline:{' '}
                        <strong className="text-emerald-900">{claim.pickupDeadline}</strong>
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-slate-600 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{claim.pickupLocation}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-slate-700 text-xs">
                      <span>Amount Payable at Counter:</span>
                      <strong className="text-base font-bold text-slate-900 tabular-nums">
                        ₹{claim.pricePaid}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Digital Token & Pickup Verification Footnote */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-slate-400 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-500">
                    <QrCode className="w-3.5 h-3.5 text-slate-400" />
                    Present code to mess staff
                  </span>
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    ~450g food saved from waste
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
