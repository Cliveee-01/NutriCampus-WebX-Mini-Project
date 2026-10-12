import React, { useState } from 'react';
import { useNutriStore } from '../../hooks/useNutriStore';
import {
  User,
  ShieldAlert,
  Save,
  CheckCircle2,
  Sparkles,
  Info,
  AlertTriangle,
} from 'lucide-react';

export const FoodProfile: React.FC = () => {
  const store = useNutriStore();
  const currentUser = store.getCurrentUser();

  const [vegan, setVegan] = useState(currentUser.dietaryPreferences.vegan);
  const [glutenFree, setGlutenFree] = useState(currentUser.dietaryPreferences.glutenFree);
  const [highProtein, setHighProtein] = useState(currentUser.dietaryPreferences.highProtein);
  const [allergiesText, setAllergiesText] = useState((currentUser.allergies || []).join(', '));
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAllergies = allergiesText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    store.updateProfileDietary(
      {
        vegan,
        glutenFree,
        highProtein,
      },
      parsedAllergies
    );

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Student Food & Dietary Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Personalize your campus dining experience. Saved dietary tags will highlight relevant mess meals and customize menu notifications.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {/* Student identification badge */}
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
            {currentUser.name[0]}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{currentUser.name}</h3>
            <p className="text-xs text-slate-500">
              Student ID: <code className="font-mono text-slate-700">{currentUser.studentId}</code> · {currentUser.roomOrHostel}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 pt-6">
          {/* Dietary Preferences Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <h4 className="font-bold text-slate-900 text-sm">
                Everyday Dining Preferences
              </h4>
            </div>
            <p className="text-xs text-slate-500">
              Selecting preferences marks compliant meals with a "Profile Match" indicator on your menu dashboard. (You can still manually filter or explore all meals at any time).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  vegan
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-1 ring-emerald-400'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={vegan}
                  onChange={(e) => setVegan(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-semibold text-xs sm:text-sm block">100% Vegan</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Zero dairy, paneer, ghee, curd, or honey. Plant-based only.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  glutenFree
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-1 ring-emerald-400'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={glutenFree}
                  onChange={(e) => setGlutenFree(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-semibold text-xs sm:text-sm block">Gluten-Free</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Exclude wheat atta, maida, sooji, and whole wheat rotis.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  highProtein
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-1 ring-emerald-400'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={highProtein}
                  onChange={(e) => setHighProtein(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-semibold text-xs sm:text-sm block">High Protein Focus</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Prioritize meals with ≥18g protein (paneer, dals, sprouts, chana).
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Allergies Input */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-800">
              Reported Food Allergies & Intolerances (Comma-separated)
            </label>
            <input
              type="text"
              value={allergiesText}
              onChange={(e) => setAllergiesText(e.target.value)}
              placeholder="e.g. Peanuts, Cashews, Mustard, Lactose"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
            />
            <p className="text-[11px] text-slate-400">
              Example: Peanuts, Shellfish, Tree Nuts, Mustard seeds
            </p>
          </div>

          {/* CRITICAL MEDICAL ALLERGEN SAFETY DISCLAIMER */}
          <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-4 text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Institutional Kitchen Safety & Allergen Notice</span>
            </div>
            <p className="leading-relaxed text-amber-900">
              <strong>Dietary preferences are distinct from medically certified allergen safety.</strong>{' '}
              While NutriCampus displays full recipes and tags from canteen staff, all campus meals are prepared in a shared high-volume mess kitchen. Equipment and counter surfaces may come into contact with common allergens including wheat gluten, dairy, peanuts, and mustard seeds.
            </p>
            <p className="text-[11px] text-amber-800">
              NutriCampus does not medically guarantee 100% allergen-free preparation without cross-contamination. If you have severe anaphylactic allergies, please inform the Chief Mess Warden and Medical Center directly.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {savedSuccess ? (
              <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Preferences updated successfully!
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                Preferences take effect immediately on your menu view.
              </span>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#1C3B2B] hover:bg-[#27533c] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
