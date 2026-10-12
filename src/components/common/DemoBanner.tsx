import React, { useState } from 'react';
import { useNutriStore } from '../../hooks/useNutriStore';
import { RefreshCw, Users, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

interface DemoBannerProps {
  onOpenDocs: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onOpenDocs }) => {
  const store = useNutriStore();
  const currentUser = store.getCurrentUser();
  const allUsers = store.getAllUsers();
  const bypassCutoff = store.getBypassCutoff();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSimulateRsvps = () => {
    store.simulateBatchStudentRsvps(8);
    setFeedback('+8 Random Student RSVPs added! Check Demand Forecast.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo state (RSVPs, surplus stock, and claims) to initial seed data?')) {
      store.resetToSeedData();
      setFeedback('Demo data reset to initial seed values.');
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  return (
    <div className="bg-[#1C3B2B] text-emerald-100 border-b border-emerald-900/50 text-xs px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Presentation Mode indicator */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            College Viva Demo Mode
          </span>
          <span className="hidden sm:inline text-emerald-300/80">
            Interactive Firestore & Node.js Engine
          </span>
          {feedback && (
            <span className="text-emerald-200 font-medium bg-emerald-800/60 px-2 py-0.5 rounded transition-all">
              {feedback}
            </span>
          )}
        </div>

        {/* Right: Quick actions for presentation */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Persona Switcher */}
          <div className="flex items-center gap-1.5 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800/60">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300 hidden md:inline">Switch Persona:</span>
            <select
              value={currentUser.id}
              onChange={(e) => store.switchUser(e.target.value)}
              className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                  {u.role === 'admin' ? `[Admin] ${u.name}` : `[Student] ${u.name}`}
                </option>
              ))}
            </select>
          </div>

          {/* Simulate RSVPs button */}
          <button
            onClick={handleSimulateRsvps}
            title="Simulate 8 student meal responses to showcase real-time forecasting update"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-emerald-300" />
            <span>Simulate +8 RSVPs</span>
          </button>

          {/* Cutoff Bypass Toggle */}
          <button
            onClick={() => store.toggleBypassCutoff(!bypassCutoff)}
            title="Toggle time-based RSVP cutoff enforcement"
            className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors cursor-pointer ${
              bypassCutoff
                ? 'bg-emerald-900/40 border-emerald-700/60 text-emerald-300'
                : 'bg-amber-950/60 border-amber-800/60 text-amber-300'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Cutoff: {bypassCutoff ? 'Unlocked' : 'Strict'}</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={handleReset}
            title="Reset to initial values"
            className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Data</span>
          </button>

          {/* Project Architecture Guide */}
          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold transition-colors cursor-pointer"
          >
            <BookOpen className="w-3 h-3" />
            <span>Architecture & Viva Guide</span>
          </button>
        </div>
      </div>
    </div>
  );
};
