import React from 'react';
import { Leaf, Award, Recycle, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onOpenDocs: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDocs }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-10 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#1C3B2B] flex items-center justify-center text-lime-400">
                <Leaf className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-800 text-sm">NutriCampus</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Smart Mess Meal Planner & Food Waste Reducer. A full-stack academic mini-project designed to balance campus canteen demand and prevent surplus waste.
            </p>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-2.5">Core Modules</h4>
            <ul className="space-y-1.5 text-slate-600">
              <li>Student Meal RSVP with Cutoffs</li>
              <li>Dynamic Recipe Ingredient Scaler</li>
              <li>Demand vs Preparation Forecasting</li>
              <li>Atomic Flash Sale Redistribution</li>
              <li>Food Waste & CO₂e Analytics</li>
            </ul>
          </div>

          {/* Academic Viva Highlights */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-2.5">Viva Highlights</h4>
            <ul className="space-y-1.5 text-slate-600">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero Duplicate RSVPs per period</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Portion Formula: Demand × Portion Qty</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Atomic surplus claim transactions</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>EPA-standard waste reduction metric</span>
              </li>
            </ul>
          </div>

          {/* Architecture & Tech Stack */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-2.5">Tech & Architecture</h4>
            <p className="text-slate-600 mb-3 leading-relaxed">
              React 19, TypeScript, Express / Node.js architecture, Chart.js, Tailwind CSS, Firestore-ready schema.
            </p>
            <button
              onClick={onOpenDocs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#1C3B2B] font-semibold border border-emerald-200 transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-emerald-700" />
              <span>View Mini-Project Report</span>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <div>
            <span>© 2026 NutriCampus · Sustainable Campus Food Technology Mini-Project</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <Recycle className="w-3.5 h-3.5" />
              Every meal planned is food saved
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
