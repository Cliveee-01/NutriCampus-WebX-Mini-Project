import React, { useState } from 'react';
import { useNutriStore } from '../../hooks/useNutriStore';
import { MealItem, MealPeriod, DietaryTag } from '../../types';
import {
  Clock,
  Sparkles,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UtensilsCrossed,
} from 'lucide-react';

interface DailyMenuProps {
  onNavigateToRsvp?: () => void;
}

export const DailyMenu: React.FC<DailyMenuProps> = () => {
  const store = useNutriStore();
  const currentUser = store.getCurrentUser();
  const [selectedPeriod, setSelectedPeriod] = useState<MealPeriod>('lunch');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Vegan' | 'Gluten-Free' | 'High Protein'>('All');
  const [selectedMealForModal, setSelectedMealForModal] = useState<MealItem | null>(null);

  const periods: { id: MealPeriod; label: string; time: string }[] = [
    { id: 'breakfast', label: 'Breakfast', time: '7:30 AM – 9:30 AM' },
    { id: 'lunch', label: 'Lunch', time: '12:00 PM – 2:30 PM' },
    { id: 'dinner', label: 'Dinner', time: '7:30 PM – 9:30 PM' },
  ];

  const currentRsvpStatus = store.getStudentRsvp(selectedPeriod);

  // Filter meals for the selected period and dietary filter
  const allPeriodMeals = store.getMeals(selectedPeriod);
  const filteredMeals = allPeriodMeals.filter((meal) => {
    if (activeFilter === 'All') return true;
    return meal.dietaryTags.includes(activeFilter as DietaryTag);
  });

  // Check if meal matches student's saved profile preferences
  const matchesStudentProfile = (meal: MealItem): boolean => {
    const prefs = currentUser.dietaryPreferences;
    if (prefs.vegan && !meal.dietaryTags.includes('Vegan')) return false;
    if (prefs.glutenFree && !meal.dietaryTags.includes('Gluten-Free')) return false;
    if (prefs.highProtein && !meal.dietaryTags.includes('High Protein')) return false;
    return true;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Intro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Daily Mess Menu & Nutrition
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Carefully curated fresh canteen meals prepared by campus catering with full ingredient disclosures.
          </p>
        </div>

        {/* Current Period RSVP Status indicator */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-xs">
          <span className="text-slate-500">Your {selectedPeriod} RSVP:</span>
          {currentRsvpStatus === 'attending' ? (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              <CheckCircle className="w-3.5 h-3.5" /> Attending
            </span>
          ) : currentRsvpStatus === 'not_attending' ? (
            <span className="inline-flex items-center gap-1 font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              <XCircle className="w-3.5 h-3.5" /> Not Attending
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              Pending RSVP
            </span>
          )}
        </div>
      </div>

      {/* Meal Period Segmented Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {periods.map((p) => {
            const isActive = selectedPeriod === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPeriod(p.id)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{p.label}</span>
                <span className="hidden sm:inline text-[11px] font-normal text-slate-400 ml-1.5">
                  ({p.time.split('–')[0].trim()})
                </span>
              </button>
            );
          })}
        </div>

        {/* Dietary Filters (Segmented buttons - allowed as functional interactive controls) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 font-medium mr-1 hidden sm:inline">Dietary:</span>
          {(['All', 'Vegan', 'Gluten-Free', 'High Protein'] as const).map((filter) => {
            const isFilterActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  isFilterActive
                    ? 'bg-[#1C3B2B] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Preference Info Note */}
      {(currentUser.dietaryPreferences.vegan ||
        currentUser.dietaryPreferences.glutenFree ||
        currentUser.dietaryPreferences.highProtein) && (
        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              Your profile preferences (
              {[
                currentUser.dietaryPreferences.vegan && 'Vegan',
                currentUser.dietaryPreferences.glutenFree && 'Gluten-Free',
                currentUser.dietaryPreferences.highProtein && 'High Protein',
              ]
                .filter(Boolean)
                .join(', ')}
              ) are active. Matching meals are highlighted below.
            </span>
          </div>
        </div>
      )}

      {/* Meals Grid */}
      {filteredMeals.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No meals matching “{activeFilter}”</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try switching the dietary filter back to "All" or explore other meal periods.
          </p>
          <button
            onClick={() => setActiveFilter('All')}
            className="mt-4 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            Show All {selectedPeriod} Meals
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeals.map((meal) => {
            const isProfileMatch = matchesStudentProfile(meal);

            return (
              <div
                key={meal.id}
                className={`bg-white rounded-xl border overflow-hidden flex flex-col justify-between transition-all hover:shadow-sm ${
                  isProfileMatch
                    ? 'border-emerald-300 ring-1 ring-emerald-200'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Food Image with Fallback */}
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img
                      src={meal.imageUrl}
                      alt={meal.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        // Resilient fallback
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />

                    {/* Top status indicator: Availability status */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {meal.isAvailable ? (
                        <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-xs text-emerald-800 text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Available Today
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-xs text-rose-700 text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                          Unavailable
                        </span>
                      )}
                    </div>

                    {isProfileMatch && (
                      <div className="absolute top-3 right-3 bg-emerald-700/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
                        Profile Match
                      </div>
                    )}
                  </div>

                  {/* Meal Content */}
                  <div className="p-5">
                    {/* Zero-Pill Dietary Metadata: Clean unboxed text with typographic separators */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                      {meal.dietaryTags.map((tag, idx) => (
                        <React.Fragment key={tag}>
                          {idx > 0 && <span aria-hidden="true" className="text-slate-300">·</span>}
                          <span className="font-medium text-emerald-800">{tag}</span>
                        </React.Fragment>
                      ))}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug mb-1.5">
                      {meal.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                      {meal.description}
                    </p>

                    {/* Nutrition & Serving Specs */}
                    <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3" /> Serving Time:
                        </span>
                        <span className="font-medium text-slate-800">{meal.servingTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Est. Calories / Protein:</span>
                        <span className="font-semibold text-slate-800 tabular-nums">
                          {meal.caloriesEstimate} kcal · {meal.proteinGrams}g protein
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Price & Details button */}
                <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Price</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      {meal.price === 0 ? 'Included in Mess Fee' : `₹${meal.price}`}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedMealForModal(meal)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 py-1 px-2 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Ingredients & Allergens</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ingredient & Allergen Modal */}
      {selectedMealForModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedMealForModal.name}</h3>
                <p className="text-xs text-slate-500">{selectedMealForModal.servingTime}</p>
              </div>
              <button
                onClick={() => setSelectedMealForModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Ingredients List */}
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-2">Ingredients Used in Preparation</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMealForModal.ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Portion Recipe Breakdown */}
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1.5">Kitchen Recipe Portion Specification</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Ingredient</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3 text-right">Per Portion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedMealForModal.recipe.map((r) => (
                        <tr key={r.ingredientName}>
                          <td className="py-1.5 px-3 font-medium text-slate-800">{r.ingredientName}</td>
                          <td className="py-1.5 px-3 text-slate-500">{r.category}</td>
                          <td className="py-1.5 px-3 text-right font-semibold text-slate-800 tabular-nums">
                            {r.quantityPerPortion} {r.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Allergen Safety Disclosure */}
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Allergen & Cross-Contamination Safety Notice</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  {selectedMealForModal.allergens.length > 0 ? (
                    <>
                      Declared potential allergens: <strong>{selectedMealForModal.allergens.join(', ')}</strong>.
                    </>
                  ) : (
                    'No common declared allergens in recipe.'
                  )}
                </p>
                <p className="text-[11px] text-amber-700/90 leading-tight">
                  <em>Disclaimer:</em> While canteen staff adhere to strict hygiene protocols, meals are prepared in a shared institutional kitchen environment. Students with acute anaphylactic allergies must consult the mess superintendent before consumption.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedMealForModal(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Disclosure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
