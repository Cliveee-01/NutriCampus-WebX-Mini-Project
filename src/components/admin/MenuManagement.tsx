import React, { useState } from 'react';
import { useNutriStore } from '../../hooks/useNutriStore';
import { MealItem, MealPeriod } from '../../types';
import {
  Utensils,
  Scale,
  Edit3,
  Check,
  Plus,
  Clock,
  Sparkles,
} from 'lucide-react';

export const MenuManagement: React.FC = () => {
  const store = useNutriStore();
  const [selectedPeriod, setSelectedPeriod] = useState<MealPeriod>('lunch');
  const [editingMealId, setEditingMealId] = useState<string | null>(null);

  const meals = store.getMeals(selectedPeriod);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Mess Menu & Recipe Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure canteen dishes, serving times, and individual portion ingredient formulas used by the demand forecast engine.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          {(['breakfast', 'lunch', 'dinner'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                selectedPeriod === period
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Meals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meals.map((meal) => {
          return (
            <div
              key={meal.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  <img
                    src={meal.imageUrl}
                    alt={meal.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-xs font-semibold text-slate-800">
                    {meal.servingTime}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    {meal.dietaryTags.map((tag, idx) => (
                      <React.Fragment key={tag}>
                        {idx > 0 && <span aria-hidden="true">·</span>}
                        <span className="font-medium text-emerald-800">{tag}</span>
                      </React.Fragment>
                    ))}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{meal.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{meal.description}</p>

                  {/* Recipe Portion Matrix */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide block mb-1.5">
                      Portion Ingredients Formula:
                    </span>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 text-xs space-y-1">
                      {meal.recipe.map((ing) => (
                        <div
                          key={ing.ingredientName}
                          className="flex items-center justify-between text-slate-700"
                        >
                          <span>{ing.ingredientName}</span>
                          <span className="font-semibold tabular-nums text-slate-900">
                            {ing.quantityPerPortion} {ing.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 text-sm">
                  {meal.price === 0 ? 'Included in Mess Fee' : `₹${meal.price}`}
                </span>
                <span className="text-slate-400">
                  {meal.recipe.length} ingredients defined
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
