import React from 'react';
import { IMAGES } from '../../data/seedData';
import { ActiveTab } from '../layout/Navbar';
import { useNutriStore } from '../../hooks/useNutriStore';
import {
  Leaf,
  Users,
  ChefHat,
  CalendarCheck,
  Tag,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';

interface LandingPageProps {
  onSelectRole: (role: 'student' | 'admin') => void;
  onOpenDocs: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole, onOpenDocs }) => {
  const store = useNutriStore();
  const metrics = store.getSustainabilityMetrics();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-semibold">
              <Leaf className="w-3.5 h-3.5 text-emerald-700" />
              <span>College Mini-Project · Smart Campus Sustainability</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] text-balance">
              Smart Mess Meal Planning &{' '}
              <span className="text-[#2E7D32]">Food Waste Reduction</span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
              <strong className="text-slate-900">“Every meal planned is food saved.”</strong>{' '}
              NutriCampus closes the gap between student appetite and canteen cooking batches through predictive student RSVPs, dynamic recipe scaling, and instant surplus flash sales.
            </p>

            {/* Quick Portal Switcher Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => onSelectRole('student')}
                className="px-6 py-3.5 rounded-xl bg-[#1C3B2B] hover:bg-[#27533c] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
              >
                <Users className="w-4 h-4 text-lime-400" />
                <span>Launch Student Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectRole('admin')}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <ChefHat className="w-4 h-4 text-emerald-700" />
                <span>Canteen Admin Portal</span>
              </button>
            </div>

            {/* Viva Mini-Project Notice */}
            <div className="pt-2 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Full-Stack Architecture
              </span>
              <span>·</span>
              <button
                onClick={onOpenDocs}
                className="text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Viva Presentation Guide</span>
              </button>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white">
              <div className="relative aspect-[4/3]">
                <img
                  src={IMAGES.hero}
                  alt="NutriCampus Dining Hall"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs font-semibold text-lime-300 uppercase tracking-wider block mb-1">
                    Central Campus Canteen
                  </span>
                  <p className="text-sm font-bold leading-tight">
                    Synchronizing 350+ hostellers with kitchen preparation batches
                  </p>
                </div>
              </div>

              {/* Live Metric Banner below hero */}
              <div className="p-4 bg-emerald-50/50 border-t border-slate-100 flex items-center justify-around text-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Waste Avoided</span>
                  <strong className="text-emerald-800 font-bold text-sm">
                    {metrics.foodWasteAvoidedKg} kg
                  </strong>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <span className="text-slate-400 block text-[11px]">Redistributed</span>
                  <strong className="text-slate-900 font-bold text-sm">
                    {metrics.redistributionRate}%
                  </strong>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <span className="text-slate-400 block text-[11px]">Carbon Abated</span>
                  <strong className="text-emerald-800 font-bold text-sm">
                    {metrics.co2SavedKg} kg CO₂
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of NutriCampus */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How NutriCampus Eliminates Canteen Waste
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            A cohesive 4-step workflow connecting students and campus chefs into a sustainable dining loop.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">1. Advance RSVP Roster</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Students mark "Attending" or "Not Attending" before session cutoff times. Single authoritative response per student prevents duplicate or ghost counts.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">2. Recipe Demand Scaler</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kitchen staff view exact ingredient requirements derived from confirmed attendance multiplied by portion weights (e.g. 150g rice × 80 RSVPs = 12 kg).
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">3. Surplus Flash Sales</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Leftover food from meal batches is immediately broadcasted at 50%–65% discount. Students claim atomic portions with digital pickup tokens before deadlines.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-lime-100 text-lime-800 flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">4. Impact Analytics</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time monitoring of redistribution rate, kilograms of food saved from landfills, and CO₂e emissions abated, illustrated via interactive Chart.js graphs.
            </p>
          </div>
        </div>
      </section>

      {/* Step-by-Step Demonstration Workflow Card for Viva */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-lime-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                Examiner & Viva Demonstration Protocol
              </span>
              <h3 className="text-xl sm:text-2xl font-bold">
                Experience the 9-Step End-to-End Live Workflow
              </h3>
            </div>
            <button
              onClick={onOpenDocs}
              className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              View Full Architecture Guide
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 pt-2">
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 space-y-2">
              <span className="text-lime-400 font-bold text-sm block">Step 1 — 3: Student Flow</span>
              <p>
                1. Browse the <strong>Daily Menu</strong> with dietary filters (Vegan, Gluten-Free, High Protein).
              </p>
              <p>
                2. Switch RSVP to <strong>Attending</strong> or <strong>Not Attending</strong> on the RSVP screen.
              </p>
              <p>
                3. Save your <strong>Food Profile</strong> preferences to highlight matching meals.
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 space-y-2">
              <span className="text-lime-400 font-bold text-sm block">Step 4 — 6: Admin Flow</span>
              <p>
                4. Switch role to <strong>Canteen Admin</strong> in the top bar.
              </p>
              <p>
                5. Check <strong>Demand Forecast</strong>: witness attending RSVP count and raw ingredient kilos update live.
              </p>
              <p>
                6. Broadcast a new discounted <strong>Surplus Offer</strong> with quantity and deadline.
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 space-y-2">
              <span className="text-lime-400 font-bold text-sm block">Step 7 — 9: Close Loop</span>
              <p>
                7. Switch back to <strong>Student Portal</strong> and open <strong>Flash Sale</strong>.
              </p>
              <p>
                8. Click <strong>Claim</strong>: atomic transaction reserves meal and provides token.
              </p>
              <p>
                9. Review <strong>Sustainability Analytics</strong>: redistribution rate & kg saved advance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
