import React from 'react';
import { useNutriStore } from '../../hooks/useNutriStore';
import { ActiveTab } from '../layout/Navbar';
import {
  Users,
  Utensils,
  ShoppingBag,
  TrendingUp,
  Recycle,
  Tag,
  ArrowRight,
  Sparkles,
  CalendarCheck,
  ChefHat,
  Scale,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const store = useNutriStore();
  const currentUser = store.getCurrentUser();
  const bfAgg = store.getAggregateRsvps('breakfast');
  const lunchAgg = store.getAggregateRsvps('lunch');
  const dinnerAgg = store.getAggregateRsvps('dinner');

  const totalTodayRsvps = bfAgg.attending + lunchAgg.attending + dinnerAgg.attending;
  const activeOffers = store.getSurplusOffers().filter((o) => o.status === 'active');
  const allClaims = store.getAllClaims();
  const metrics = store.getSustainabilityMetrics();

  // Demand forecasts for ingredient preview
  const lunchForecast = store.getDemandForecast('lunch');

  // Recent activity stream combining RSVPs and claims
  const recentRsvps = store.getAllRsvps().slice(-4).reverse();
  const recentClaims = store.getAllClaims().slice(-4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Admin Header */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-lime-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ChefHat className="w-4 h-4" />
            <span>Canteen Operations & Waste Management Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Kitchen Administration Overview
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            Monitoring live student attendance, raw material procurement estimates, and dynamic surplus redistribution across all campus dining sessions.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('admin-orders')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-400 hover:bg-lime-300 text-slate-950 font-semibold text-xs sm:text-sm transition-colors cursor-pointer shadow-sm"
            >
              <ShoppingBag className="w-4 h-4 text-slate-950" />
              <span>Canteen Tray Orders</span>
            </button>
            <button
              onClick={() => onNavigate('demand-forecast')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm border border-white/20 transition-colors cursor-pointer"
            >
              <span>Open Demand Forecast</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('surplus-broadcast')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm border border-white/20 transition-colors cursor-pointer"
            >
              <Tag className="w-4 h-4 text-lime-300" />
              <span>Broadcast Surplus Meal</span>
            </button>
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 hidden md:flex items-center justify-center p-8 opacity-10 pointer-events-none">
          <Utensils className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* KPI Cards Strip (6 key indicators) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* KPI 1: Total Student RSVPs */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total RSVPs</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {totalTodayRsvps}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Confirmed attending today</p>
        </div>

        {/* KPI 2: Lunch Expected Demand */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Lunch Demand</span>
            <Utensils className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {lunchAgg.attending} <span className="text-xs font-normal text-slate-500">portions</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Peak meal of the day</p>
        </div>

        {/* KPI 3: Key Raw Ingredient Req */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Est. Rice Req</span>
            <Scale className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {(
              (lunchAgg.attending * 0.15) // 150g per portion
            ).toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Formula: Demand × Portion</p>
        </div>

        {/* KPI 4: Active Flash Sales */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Flash Sales</span>
            <Tag className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {activeOffers.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {activeOffers.reduce((sum, o) => sum + o.availableQuantity, 0)} portions on sale
          </p>
        </div>

        {/* KPI 5: Surplus Meals Claimed */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Surplus Claimed</span>
            <ShoppingBag className="w-4 h-4 text-lime-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {allClaims.length} <span className="text-xs font-normal text-slate-500">meals</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Redistribution rate {metrics.redistributionRate}%</p>
        </div>

        {/* KPI 6: Food Saved from Waste */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Food Saved</span>
            <Recycle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-800 tabular-nums">
            {metrics.foodWasteAvoidedKg} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">~{metrics.co2SavedKg} kg CO₂e avoided</p>
        </div>
      </div>

      {/* Demand Breakdown by Meal Period (Comparison strip) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Today’s Meal Period Attendance Overview</h2>
            <p className="text-xs text-slate-500">
              Live responses across campus. Kitchen batch planning adjusts according to these live RSVP counts.
            </p>
          </div>
          <button
            onClick={() => onNavigate('demand-forecast')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            Detailed Recipe Forecasting <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { id: 'breakfast', label: 'Breakfast', agg: bfAgg, time: '7:30 AM – 9:30 AM', color: 'bg-emerald-500' },
            { id: 'lunch', label: 'Lunch', agg: lunchAgg, time: '12:00 PM – 2:30 PM', color: 'bg-blue-500' },
            { id: 'dinner', label: 'Dinner', agg: dinnerAgg, time: '7:30 PM – 9:30 PM', color: 'bg-purple-500' },
          ].map((item) => {
            const total = item.agg.attending + item.agg.notAttending;
            const pctAttending = total > 0 ? Math.round((item.agg.attending / total) * 100) : 0;

            return (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{item.label}</span>
                  <span className="text-xs text-slate-500">{item.time}</span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold text-slate-900 tabular-nums">
                    {item.agg.attending}{' '}
                    <span className="text-xs font-normal text-slate-500">attending</span>
                  </div>
                  <div className="text-xs font-medium text-slate-500 tabular-nums">
                    {item.agg.notAttending} not attending
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full transition-all duration-500`}
                    style={{ width: `${pctAttending}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Attendance Rate: {pctAttending}%</span>
                  <span>Cutoff: {item.agg.cutoffTime}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Recent Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Activity Feed */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-700" />
              <span>Recent Activity Stream</span>
            </h3>
            <span className="text-[11px] text-slate-400">Live event logs</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentClaims.map((claim) => (
              <div key={claim.id} className="py-2.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-800">
                    Flash Sale Claimed: {claim.offerMealName}
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    By {claim.studentName} ({claim.studentId}) · Token: {claim.claimCode}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  ₹{claim.pricePaid} Paid
                </span>
              </div>
            ))}

            {recentRsvps.map((rsvp) => (
              <div key={rsvp.id} className="py-2.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-800">
                    RSVP updated for {rsvp.period}
                  </span>
                  <p className="text-slate-500 text-[11px]">
                    Student: {rsvp.studentName}
                  </p>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    rsvp.status === 'attending'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {rsvp.status === 'attending' ? 'Attending' : 'Not Attending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Operations & Ingredient Procurement Shortcut */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-700" />
                <span>Next Service Ingredient Requirements (Lunch)</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                Based on {lunchForecast.attendingRsvps} RSVPs
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Ingredient</th>
                    <th className="py-2 px-3">Portion Size</th>
                    <th className="py-2 px-3 text-right">Procure Today</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lunchForecast.calculatedIngredients.slice(0, 4).map((ing) => (
                    <tr key={ing.name}>
                      <td className="py-2 px-3 font-medium text-slate-800">{ing.name}</td>
                      <td className="py-2 px-3 text-slate-500 tabular-nums">
                        {ing.quantityPerPortion} {ing.unit}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900 tabular-nums">
                        {ing.formattedTotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Formula: Expected Demand × Portion Qty
            </span>
            <button
              onClick={() => onNavigate('demand-forecast')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Adjust Recipes & Buffer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
