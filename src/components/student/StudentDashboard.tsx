import React from 'react';
import { useNutriStore } from '../../hooks/useNutriStore';
import { MealPeriod, RsvpStatus } from '../../types';
import { ActiveTab } from '../layout/Navbar';
import {
  Utensils,
  CalendarCheck,
  Tag,
  ShoppingBag,
  Clock,
  ArrowRight,
  Leaf,
  CheckCircle,
  XCircle,
  HelpCircle,
  HeartHandshake,
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const store = useNutriStore();
  const currentUser = store.getCurrentUser();
  const meals = store.getMeals();
  const offers = store.getSurplusOffers().filter((o) => o.status === 'active' && o.availableQuantity > 0);
  const myClaims = store.getClaimsForUser();

  const periods: { id: MealPeriod; label: string; time: string }[] = [
    { id: 'breakfast', label: 'Breakfast', time: '7:30 AM – 9:30 AM' },
    { id: 'lunch', label: 'Lunch', time: '12:00 PM – 2:30 PM' },
    { id: 'dinner', label: 'Dinner', time: '7:30 PM – 9:30 PM' },
  ];

  // Count student RSVPs for today
  const rsvpStatuses = periods.map((p) => ({
    period: p.id,
    status: store.getStudentRsvp(p.id),
  }));

  const rsvpCount = rsvpStatuses.filter((r) => r.status !== null).length;
  const attendingCount = rsvpStatuses.filter((r) => r.status === 'attending').length;

  const handleQuickRsvp = (period: MealPeriod, status: RsvpStatus) => {
    store.setRsvp(period, status);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Welcome & Mission Banner */}
      <div className="bg-gradient-to-r from-[#1C3B2B] to-[#2E583E] rounded-2xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-lime-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Leaf className="w-4 h-4" />
            <span>Sustainable Campus Dining</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-balance">
            Good day, {currentUser.name}!
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-4">
            <strong className="text-white">“Every meal planned is food saved.”</strong>{' '}
            Your advance RSVPs allow canteen chefs to purchase exact ingredients, preventing up to 40% of kitchen preparation waste.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => onNavigate('meal-rsvp')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-lime-400 hover:bg-lime-300 text-slate-950 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <span>Update Today's RSVP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('flash-sale')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm border border-white/20 transition-colors cursor-pointer"
            >
              <Tag className="w-4 h-4 text-lime-300" />
              <span>Surplus Flash Sale ({offers.length} active)</span>
            </button>
          </div>
        </div>

        {/* Decorative background eco graphic */}
        <div className="absolute right-0 bottom-0 top-0 hidden md:flex items-center justify-center opacity-10 pointer-events-none p-8">
          <Leaf className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* 4 Summary Cards (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Available Meals */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Today's Menu</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                {meals.length} <span className="text-xs font-normal text-slate-500">options</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Across 3 meal slots</span>
            <button
              onClick={() => onNavigate('daily-menu')}
              className="text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Menu <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Meals RSVP'd */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">My RSVP Status</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                {rsvpCount} / 3 <span className="text-xs font-normal text-slate-500">confirmed</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Attending {attendingCount} meals</span>
            <button
              onClick={() => onNavigate('meal-rsvp')}
              className="text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Active Flash Sale Offers */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Surplus Flash Sales</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                {offers.length} <span className="text-xs font-normal text-slate-500">available</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Up to 60% discounted</span>
            <button
              onClick={() => onNavigate('flash-sale')}
              className="text-amber-800 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Grab Meal <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Meals Successfully Claimed */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">My Saved Meals</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                {myClaims.length} <span className="text-xs font-normal text-slate-500">claimed</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-lime-50 text-lime-800 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">~{(myClaims.length * 0.45).toFixed(1)} kg saved</span>
            <button
              onClick={() => onNavigate('my-claims')}
              className="text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Tokens <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Today's 3 Meal Periods & Quick RSVP Cards */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Today's Meal Schedule & Attendance</h2>
            <p className="text-xs text-slate-500">
              Set your RSVP for each meal period. Chefs prepare quantities according to confirmed attendees.
            </p>
          </div>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Cutoff rules active · Instant synchronization
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {periods.map((period) => {
            const currentRsvp = store.getStudentRsvp(period.id);
            const periodMeals = store.getMeals(period.id);
            const aggregate = store.getAggregateRsvps(period.id);

            return (
              <div
                key={period.id}
                className={`rounded-xl p-5 border transition-all ${
                  currentRsvp === 'attending'
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : currentRsvp === 'not_attending'
                    ? 'border-slate-200 bg-slate-50/50'
                    : 'border-amber-200 bg-amber-50/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-base">{period.label}</span>
                  {currentRsvp === 'attending' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle className="w-3.5 h-3.5" /> Attending
                    </span>
                  ) : currentRsvp === 'not_attending' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                      <XCircle className="w-3.5 h-3.5" /> Not Attending
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                      <HelpCircle className="w-3.5 h-3.5" /> Pending Response
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {period.time}
                </p>

                {/* Primary Menu Preview */}
                <div className="text-xs text-slate-700 mb-4 bg-white/80 p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Canteen Menu Highlight:</span>
                  <p className="font-medium text-slate-800 line-clamp-1">
                    {periodMeals[0]?.name || 'Standard Canteen Menu'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {periodMeals[0]?.description}
                  </p>
                </div>

                {/* Aggregate attending badge */}
                <div className="flex items-center justify-between text-xs text-slate-600 mb-4 pb-3 border-b border-slate-200/60">
                  <span>Campus-wide:</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    {aggregate.attending} students attending
                  </span>
                </div>

                {/* RSVP Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickRsvp(period.id, 'attending')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentRsvp === 'attending'
                        ? 'bg-[#1C3B2B] text-white shadow-xs'
                        : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    Attending
                  </button>
                  <button
                    onClick={() => handleQuickRsvp(period.id, 'not_attending')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentRsvp === 'not_attending'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    Not Attending
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flash Sale Banner Strip */}
      {offers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                Surplus Food Flash Sale is Live! ({offers.length} delicious meals available)
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Save food from going to waste while enjoying high-quality chef preparations at up to 60% off standard prices.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('flash-sale')}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors shadow-xs"
          >
            Explore Flash Sale
          </button>
        </div>
      )}
    </div>
  );
};
