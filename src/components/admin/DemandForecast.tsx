import React, { useState, useEffect, useRef } from 'react';
import { useNutriStore } from '../../hooks/useNutriStore';
import { MealPeriod } from '../../types';
import {
  Users,
  Scale,
  TrendingUp,
  BarChart3,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { Chart } from 'chart.js/auto';

export const DemandForecast: React.FC = () => {
  const store = useNutriStore();
  const [selectedPeriod, setSelectedPeriod] = useState<MealPeriod>('lunch');
  const [editingIngredient, setEditingIngredient] = useState<string | null>(null);
  const [tempPortionValue, setTempPortionValue] = useState<number>(0);
  const [bufferInput, setBufferInput] = useState<number>(20);

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  const forecast = store.getDemandForecast(selectedPeriod);
  const mealsInPeriod = store.getMeals(selectedPeriod);

  // Sync buffer from store
  useEffect(() => {
    setBufferInput(forecast.buffer);
  }, [selectedPeriod, forecast.buffer]);

  // Render or update Chart.js bar chart
  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const bfForecast = store.getDemandForecast('breakfast');
    const lunchForecast = store.getDemandForecast('lunch');
    const dinnerForecast = store.getDemandForecast('dinner');

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Breakfast', 'Lunch', 'Dinner'],
        datasets: [
          {
            label: 'Attending RSVPs (Expected Demand)',
            data: [
              bfForecast.expectedDemand,
              lunchForecast.expectedDemand,
              dinnerForecast.expectedDemand,
            ],
            backgroundColor: '#1C3B2B',
            borderRadius: 6,
          },
          {
            label: 'Planned Preparation (Demand + Buffer)',
            data: [
              bfForecast.plannedQuantity,
              lunchForecast.plannedQuantity,
              dinnerForecast.plannedQuantity,
            ],
            backgroundColor: '#84CC16',
            borderRadius: 6,
          },
          {
            label: 'Registered Hostellers (Max Capacity)',
            data: [350, 350, 350],
            backgroundColor: '#E2E8F0',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: {
                family: 'Plus Jakarta Sans',
                size: 11,
              },
            },
          },
          tooltip: {
            callbacks: {
              footer: (items) => {
                const demand = items[0]?.raw as number;
                return `Waste prevention efficiency: ~${Math.round((1 - demand / 350) * 100)}% ingredients saved vs blind cooking`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 400,
            ticks: {
              font: {
                family: 'Plus Jakarta Sans',
                size: 10,
              },
            },
            title: {
              display: true,
              text: 'Portions (Student Count)',
              font: { size: 11 },
            },
          },
          x: {
            ticks: {
              font: {
                family: 'Plus Jakarta Sans',
                size: 11,
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [forecast, store]);

  const handleBufferChange = (newVal: number) => {
    setBufferInput(newVal);
    store.setPlannedBuffer(selectedPeriod, newVal);
  };

  const handleSavePortion = (mealId: string, ingredientName: string) => {
    const meal = mealsInPeriod.find((m) => m.id === mealId);
    if (!meal) return;

    const updatedRecipe = meal.recipe.map((r) =>
      r.ingredientName === ingredientName
        ? { ...r, quantityPerPortion: Math.max(1, tempPortionValue) }
        : r
    );
    store.updateMealRecipe(mealId, updatedRecipe);
    setEditingIngredient(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Rule-Based Demand Forecasting & Procurement Scaler
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Calculates exact batch raw ingredient quantities from confirmed student meal RSVPs.
          </p>
        </div>

        {/* Meal Period Segmented selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start md:self-auto">
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

      {/* Top 4 Metric Cards for Selected Period */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Expected Demand */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Expected Demand
          </span>
          <div className="text-3xl font-bold text-slate-900 mt-1 tabular-nums">
            {forecast.expectedDemand}{' '}
            <span className="text-xs font-normal text-slate-500">portions</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-2 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            Formula: Attending RSVPs ({forecast.attendingRsvps})
          </p>
        </div>

        {/* Metric 2: Not Attending Count */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Opted Out (Not Attending)
          </span>
          <div className="text-3xl font-bold text-slate-900 mt-1 tabular-nums">
            {forecast.notAttendingRsvps}{' '}
            <span className="text-xs font-normal text-slate-500">students</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Eliminates {forecast.notAttendingRsvps} wasteful prep portions
          </p>
        </div>

        {/* Metric 3: Planned Meal Quantity with Buffer */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Planned Prep (With Buffer)
            </span>
          </div>
          <div className="text-3xl font-bold text-[#1C3B2B] mt-1 tabular-nums">
            {forecast.plannedQuantity}{' '}
            <span className="text-xs font-normal text-slate-500">portions</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] text-slate-500">Kitchen Buffer:</span>
            <input
              type="number"
              min={0}
              max={50}
              value={bufferInput}
              onChange={(e) => handleBufferChange(Number(e.target.value) || 0)}
              className="w-14 px-1.5 py-0.5 text-xs font-bold border border-slate-300 rounded text-center focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
            <span className="text-[11px] text-slate-400">extra</span>
          </div>
        </div>

        {/* Metric 4: Waste Avoidance Potential */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Estimated Food Saved
          </span>
          <div className="text-3xl font-bold text-emerald-800 mt-1 tabular-nums">
            {(forecast.notAttendingRsvps * 0.45).toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-500">kg saved</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Vs blind full-batch preparation of 350 seats
          </p>
        </div>
      </div>

      {/* Chart.js Comparison Graph */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-700" />
              <span>Canteen Attendance & Planned Quantity Comparison</span>
            </h3>
            <p className="text-xs text-slate-500">
              Visualizing how real-time RSVPs calibrate preparation sizes away from fixed overcooking capacity.
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Chart.js Engine</span>
        </div>

        <div className="h-72 w-full pt-2">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* Required Ingredients Calculation Table with Dynamic Editable Portions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-700" />
              <span>Required Raw Ingredients for {selectedPeriod.toUpperCase()} Batch</span>
            </h3>
            <p className="text-xs text-slate-500">
              Formula: <code>Required Quantity = Expected Demand ({forecast.expectedDemand}) × Ingredient Quantity per Portion</code>
            </p>
          </div>

          <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-medium">
            Dynamic recalculation active
          </span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ingredient Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Portion / Student</th>
                <th className="py-3 px-4 text-right">Total Procurement Needed</th>
                <th className="py-3 px-4 text-center">Adjust Portion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {forecast.calculatedIngredients.map((item) => {
                const isEditing = editingIngredient === item.name;

                return (
                  <tr key={item.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.name}</td>
                    <td className="py-3 px-4 text-slate-500">
                      <span className="font-medium">{item.category}</span>
                    </td>
                    <td className="py-3 px-4 tabular-nums">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={tempPortionValue}
                            onChange={(e) => setTempPortionValue(Number(e.target.value) || 0)}
                            className="w-16 px-1.5 py-0.5 border border-emerald-500 rounded text-slate-900 font-bold focus:outline-none"
                          />
                          <span className="text-slate-500">{item.unit}</span>
                        </div>
                      ) : (
                        <span className="font-medium text-slate-700">
                          {item.quantityPerPortion} {item.unit}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums text-sm">
                      {item.formattedTotal}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isEditing ? (
                        <button
                          onClick={() => {
                            // find which meal has this ingredient and update
                            const meal = mealsInPeriod.find((m) =>
                              m.recipe.some((r) => r.ingredientName === item.name)
                            );
                            if (meal) {
                              handleSavePortion(meal.id, item.name);
                            } else {
                              setEditingIngredient(null);
                            }
                          }}
                          className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold cursor-pointer"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingIngredient(item.name);
                            setTempPortionValue(item.quantityPerPortion);
                          }}
                          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 cursor-pointer"
                          title="Edit sample portion size to test dynamic formula"
                        >
                          <Edit2 className="w-3.5 h-3.5 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Transparent Viva Explanation Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-600 flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-slate-800">
              Project Viva Explanation Note:
            </p>
            <p className="leading-relaxed">
              This module implements transparent, deterministic rule-based demand forecasting rather than unverified AI black-boxes. The calculations directly map student RSVPs through modular recipe portion vectors. When student RSVP numbers change in real-time, ingredient purchase orders adapt on-the-fly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
