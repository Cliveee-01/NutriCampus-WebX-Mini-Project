import React, { useState } from 'react';
import { useNutriStore } from '../../hooks/useNutriStore';
import { MealPeriod, RsvpStatus } from '../../types';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  ShieldCheck,
  Calendar,
  Lock,
} from 'lucide-react';

export const MealRsvp: React.FC = () => {
  const store = useNutriStore();
  const currentUser = store.getCurrentUser();
  const bypassCutoff = store.getBypassCutoff();
  const [feedback, setFeedback] = useState<{ period: MealPeriod; text: string; type: 'success' | 'error' } | null>(null);

  const mealPeriods: {
    id: MealPeriod;
    label: string;
    hours: string;
    cutoff: string;
    menuPreview: string;
    calories: string;
  }[] = [
    {
      id: 'breakfast',
      label: 'Breakfast Session',
      hours: '7:30 AM – 9:30 AM',
      cutoff: '06:30 AM',
      menuPreview: 'Idli Vada Sambar, Kanda Poha with Sprouts, Masala Dosa, Filter Coffee / Tea',
      calories: '320–410 kcal',
    },
    {
      id: 'lunch',
      label: 'Lunch Session',
      hours: '12:00 PM – 2:30 PM',
      cutoff: '10:30 AM',
      menuPreview: 'Paneer Butter Masala, Shahi Veg Pulao, Dal Tadka, Phulkas, Curd Rice',
      calories: '420–620 kcal',
    },
    {
      id: 'dinner',
      label: 'Dinner Session',
      hours: '7:30 PM – 9:30 PM',
      cutoff: '05:30 PM',
      menuPreview: 'Punjabi Chana Masala, Palak Paneer, Moong Dal Khichdi, Tawa Rotis, Jeera Rice',
      calories: '480–580 kcal',
    },
  ];

  const handleRsvpChange = (period: MealPeriod, status: RsvpStatus) => {
    const result = store.setRsvp(period, status);
    if (result.success) {
      setFeedback({ period, text: result.message, type: 'success' });
    } else {
      setFeedback({ period, text: result.message, type: 'error' });
    }
    setTimeout(() => {
      setFeedback((prev) => (prev?.period === period ? null : prev));
    }, 4000);
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Today’s Dining Roster · {todayStr}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Advance Meal RSVP System
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            RSVP in advance to help kitchen staff accurately forecast ingredient purchases and cook the exact right quantity.
          </p>
        </div>

        {/* Cutoff Status badge */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 text-xs shadow-xs flex items-center gap-2 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <div>
            <span className="font-semibold text-slate-800">Cutoff Protection:</span>{' '}
            <span className="text-slate-500">
              {bypassCutoff ? 'Demo Mode (Responses Unlocked)' : 'Strict Enforcement Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Rules Notice */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-4 text-xs text-emerald-950 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-emerald-900">
            How NutriCampus RSVP Prevents Campus Food Waste:
          </p>
          <p className="text-emerald-800 leading-relaxed">
            1. You can update or change your response at any time before the session cutoff time.
            <br />
            2. Only one authoritative response is stored per student per meal period (no duplicates).
            <br />
            3. When you mark <em>“Attending”</em>, raw ingredient quantities automatically allocate on the admin dashboard.
          </p>
        </div>
      </div>

      {/* Meal Period RSVP Cards */}
      <div className="space-y-5">
        {mealPeriods.map((period) => {
          const currentStatus = store.getStudentRsvp(period.id);
          const aggregate = store.getAggregateRsvps(period.id);
          const isLocked = aggregate.isCutoffPassed;
          const isThisFeedback = feedback?.period === period.id;

          return (
            <div
              key={period.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                currentStatus === 'attending'
                  ? 'border-emerald-300 shadow-xs'
                  : currentStatus === 'not_attending'
                  ? 'border-slate-300'
                  : 'border-amber-200 shadow-xs'
              }`}
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Meal Period Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold text-slate-900">{period.label}</h2>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Serving: {period.hours}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-medium bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200/60">
                        {isLocked ? <Lock className="w-3 h-3 text-amber-700" /> : <Clock className="w-3 h-3 text-amber-700" />}
                        Cutoff: {period.cutoff}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      <strong className="text-slate-800">Menu Highlights:</strong> {period.menuPreview}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="tabular-nums font-bold text-emerald-800">{aggregate.attending}</span> attending
                        <span className="text-slate-300">|</span>
                        <span className="tabular-nums text-slate-600">{aggregate.notAttending}</span> not attending
                      </span>
                      <span>·</span>
                      <span>Est. {period.calories}</span>
                    </div>
                  </div>

                  {/* Right: Response Controls */}
                  <div className="flex flex-col items-start lg:items-end gap-3 min-w-[280px]">
                    <div className="text-xs font-semibold text-slate-500">
                      Your Response:{' '}
                      {currentStatus === 'attending' ? (
                        <span className="text-emerald-700 font-bold">Attending</span>
                      ) : currentStatus === 'not_attending' ? (
                        <span className="text-slate-700 font-bold">Not Attending</span>
                      ) : (
                        <span className="text-amber-700 font-bold">Not Responded</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                      <button
                        onClick={() => handleRsvpChange(period.id, 'attending')}
                        disabled={isLocked}
                        className={`flex-1 lg:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                          currentStatus === 'attending'
                            ? 'bg-[#1C3B2B] text-white shadow-sm ring-2 ring-emerald-600/30'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300'
                        } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Attending</span>
                      </button>

                      <button
                        onClick={() => handleRsvpChange(period.id, 'not_attending')}
                        disabled={isLocked}
                        className={`flex-1 lg:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                          currentStatus === 'not_attending'
                            ? 'bg-slate-800 text-white shadow-sm ring-2 ring-slate-400'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                        } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Not Attending</span>
                      </button>
                    </div>

                    {isLocked && (
                      <p className="text-[11px] text-amber-700 flex items-center gap-1 font-medium">
                        <Lock className="w-3 h-3" />
                        Cutoff time passed for today. Modifications locked.
                      </p>
                    )}
                  </div>
                </div>

                {/* Inline Confirmation or Error banner */}
                {isThisFeedback && (
                  <div
                    className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 transition-all ${
                      feedback.type === 'success'
                        ? 'bg-emerald-100/70 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-100/70 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {feedback.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                    )}
                    <span className="font-medium">{feedback.text}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Student Account Attribution */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span>Recording responses for: </span>
          <strong className="text-slate-800">{currentUser.name}</strong>
          <span className="mx-2">·</span>
          <span>Student ID: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 font-mono">{currentUser.studentId}</code></span>
        </div>
        <div className="text-slate-400">
          Persistent local sync active · Automatic multi-student aggregation
        </div>
      </div>
    </div>
  );
};
