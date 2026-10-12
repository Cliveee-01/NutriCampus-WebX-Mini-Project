import React, { useEffect, useRef } from 'react';
import { useNutriStore } from '../../hooks/useNutriStore';
import { Chart } from 'chart.js/auto';
import {
  Recycle,
  TrendingUp,
  Percent,
  Leaf,
  Scale,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';

export const SustainabilityAnalytics: React.FC = () => {
  const store = useNutriStore();
  const metrics = store.getSustainabilityMetrics();

  const doughnutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const trendCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const doughnutChartInstance = useRef<Chart | null>(null);
  const trendChartInstance = useRef<Chart | null>(null);

  // Initialize and update Chart.js instances
  useEffect(() => {
    // 1. Doughnut Chart: Surplus Meals Redistribution Rate
    if (doughnutCanvasRef.current) {
      if (doughnutChartInstance.current) {
        doughnutChartInstance.current.destroy();
      }

      const unclaimedPortions = Math.max(0, metrics.totalAvailable);
      const claimedPortions = metrics.totalClaimed;

      const ctx1 = doughnutCanvasRef.current.getContext('2d');
      if (ctx1) {
        doughnutChartInstance.current = new Chart(ctx1, {
          type: 'doughnut',
          data: {
            labels: ['Claimed & Consumed', 'Remaining in Stock'],
            datasets: [
              {
                data: [claimedPortions, unclaimedPortions],
                backgroundColor: ['#1C3B2B', '#E2E8F0'],
                borderWidth: 2,
                borderColor: '#FFFFFF',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 12,
                  font: { family: 'Plus Jakarta Sans', size: 11 },
                },
              },
            },
            cutout: '70%',
          },
        });
      }
    }

    // 2. Trend Bar/Line Chart: Weekly Waste Avoided (kg)
    if (trendCanvasRef.current) {
      if (trendChartInstance.current) {
        trendChartInstance.current.destroy();
      }

      const ctx2 = trendCanvasRef.current.getContext('2d');
      if (ctx2) {
        trendChartInstance.current = new Chart(ctx2, {
          type: 'line',
          data: {
            labels: metrics.historicalWeekly.map((h) => h.date),
            datasets: [
              {
                label: 'Edible Food Saved (kg)',
                data: metrics.historicalWeekly.map((h) => h.foodSavedKg),
                borderColor: '#16A34A',
                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#16A34A',
              },
              {
                label: 'Surplus Portions Claimed',
                data: metrics.historicalWeekly.map((h) => h.surplusClaimed),
                borderColor: '#0284C7',
                backgroundColor: 'transparent',
                borderDash: [4, 4],
                tension: 0.3,
                pointRadius: 3,
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
                  font: { family: 'Plus Jakarta Sans', size: 11 },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  font: { family: 'Plus Jakarta Sans', size: 10 },
                },
                title: {
                  display: true,
                  text: 'Kilograms (kg) / Portions',
                  font: { size: 11 },
                },
              },
              x: {
                ticks: {
                  font: { family: 'Plus Jakarta Sans', size: 11 },
                },
              },
            },
          },
        });
      }
    }

    return () => {
      if (doughnutChartInstance.current) doughnutChartInstance.current.destroy();
      if (trendChartInstance.current) trendChartInstance.current.destroy();
    };
  }, [metrics]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Campus Food Waste & Sustainability Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Tracking the ecological impact of student meal advance RSVPs and discounted surplus redistribution.
        </p>
      </div>

      {/* 4 Primary Sustainability Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Redistribution Rate */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Redistribution Rate</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 tabular-nums">
            {metrics.redistributionRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Formula: (Claimed {metrics.totalClaimed} / Announced {metrics.totalAnnounced}) × 100
          </p>
        </div>

        {/* Metric 2: Food Waste Avoided (kg) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Food Waste Avoided</span>
            <Scale className="w-4 h-4 text-lime-700" />
          </div>
          <div className="text-3xl font-bold text-emerald-800 tabular-nums">
            {metrics.foodWasteAvoidedKg}{' '}
            <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Est. 0.45 kg edible food per claimed meal
          </p>
        </div>

        {/* Metric 3: Carbon Footprint Abatement */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">CO₂e Abated</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 tabular-nums">
            {metrics.co2SavedKg}{' '}
            <span className="text-xs font-normal text-slate-500">kg CO₂e</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            2.5 kg CO₂e greenhouse gas avoided per kg food
          </p>
        </div>

        {/* Metric 4: Student Financial Savings */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Student Savings</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 tabular-nums">
            ₹{metrics.studentMoneySavedInr}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Affordable dining via surplus discounts
          </p>
        </div>
      </div>

      {/* Charts Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doughnut Chart: Redistribution Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Surplus Redistribution Ratio
            </h3>
            <p className="text-xs text-slate-500">
              Claimed portions vs portions remaining on shelf.
            </p>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            <canvas ref={doughnutCanvasRef}></canvas>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-around text-xs">
            <div className="text-center">
              <span className="text-slate-400 block text-[11px]">Total Announced</span>
              <strong className="text-slate-900 text-sm">{metrics.totalAnnounced}</strong>
            </div>
            <div className="text-center">
              <span className="text-slate-400 block text-[11px]">Total Claimed</span>
              <strong className="text-emerald-800 text-sm">{metrics.totalClaimed}</strong>
            </div>
            <div className="text-center">
              <span className="text-slate-400 block text-[11px]">Remaining</span>
              <strong className="text-slate-600 text-sm">{metrics.totalAvailable}</strong>
            </div>
          </div>
        </div>

        {/* Line Chart: Weekly Food Waste Avoidance Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Weekly Food Waste Saved Trend
              </h3>
              <p className="text-xs text-slate-500">
                Daily record of edible surplus prevented from campus disposal.
              </p>
            </div>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Past 7 Days
            </span>
          </div>

          <div className="h-64 pt-2">
            <canvas ref={trendCanvasRef}></canvas>
          </div>
        </div>
      </div>

      {/* Methodology and Environmental Formula Notice */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Info className="w-4 h-4 text-emerald-700" />
          <span>Scientific Calculation Methodology & Formula Disclosure</span>
        </div>
        <p className="leading-relaxed">
          <strong>1. Redistribution Rate:</strong> Calculated as{' '}
          <code>(Claimed Surplus Portions / Total Surplus Portions Announced) × 100</code>. Safe division guards against zero denominators.
        </p>
        <p className="leading-relaxed">
          <strong>2. Edible Waste Saved:</strong> Clearly labelled as an engineered estimate based on an institutional portion size benchmark of <strong>450 grams (0.45 kg)</strong> per meal.
        </p>
        <p className="leading-relaxed">
          <strong>3. Greenhouse Gas Mitigation:</strong> Derived from standard life cycle assessment (LCA) environmental metrics (~2.5 kg CO₂e emitted per kg of institutional food waste rotting in landfills).
        </p>
      </div>
    </div>
  );
};
