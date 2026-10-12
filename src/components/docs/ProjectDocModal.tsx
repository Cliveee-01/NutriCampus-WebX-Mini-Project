import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Database,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  Copy,
  Check,
} from 'lucide-react';

interface ProjectDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDocModal: React.FC<ProjectDocModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const firestoreSchemaText = `// Firestore Schema Collections
1. "users"/{userId}
   - name: string
   - email: string
   - role: 'student' | 'admin'
   - studentId: string
   - dietaryPreferences: { vegan: boolean, glutenFree: boolean, highProtein: boolean }
   - allergies: string[]

2. "meals"/{mealId}
   - name: string
   - period: 'breakfast' | 'lunch' | 'dinner'
   - price: number
   - dietaryTags: string[]
   - recipe: Array<{ ingredientName: string, quantityPerPortion: number, unit: string }>

3. "mealRSVPs"/{compoundId: userId_period_date}
   - userId: string
   - period: 'breakfast' | 'lunch' | 'dinner'
   - date: string (YYYY-MM-DD)
   - status: 'attending' | 'not_attending'
   - updatedAt: timestamp

4. "surplusOffers"/{offerId}
   - mealName: string
   - originalPrice: number
   - discountedPrice: number
   - availableQuantity: number (atomic decrement on claim)
   - initialQuantity: number
   - pickupDeadline: string
   - status: 'active' | 'sold_out' | 'expired'

5. "surplusClaims"/{claimId}
   - offerId: string
   - userId: string
   - claimCode: string (e.g. NC-7482)
   - status: 'claimed' | 'collected'
   - claimedAt: timestamp`;

  const securityRulesText = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /meals/{mealId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
    match /mealRSVPs/{rsvpId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    match /surplusOffers/{offerId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
    match /surplusClaims/{claimId} {
      allow read: if request.auth != null && (request.auth.uid == resource.data.userId || request.auth.token.role == 'admin');
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#1C3B2B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-lime-400" />
            <div>
              <h2 className="text-base font-bold leading-tight">
                NutriCampus — Mini-Project Documentation & Viva Guide
              </h2>
              <p className="text-[11px] text-emerald-200/80">
                Full-Stack Architecture · Firestore Schema · Local Setup · Demonstration Protocol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Executive Overview */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>Project Abstract & Problem Statement</span>
            </h3>
            <p className="text-slate-600">
              Institutional dining halls face huge variances in attendance due to variable student timetables, lab sessions, and weekend departures. Cooking fixed batches results in 30%–45% of edible food discarded into municipal bins daily. <strong>NutriCampus</strong> introduces a closed-loop digital ecosystem where advance student RSVPs drive deterministic ingredient procurement formulas, and end-of-service batch surpluses are atomically redistributed to students via discounted flash sales.
            </p>
          </div>

          {/* Mathematical Formulations */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-700" />
              <span>Core Mathematical Formulations (Viva Talk Points)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-sans font-bold text-slate-800 block mb-1">
                  1. Raw Ingredient Scaling Formula:
                </span>
                <code>Required_Quantity = Expected_Demand × Quantity_Per_Portion</code>
                <p className="font-sans text-[11px] text-slate-500 mt-1">
                  e.g., 80 students × 150g rice = 12,000g (12.0 kg)
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-sans font-bold text-slate-800 block mb-1">
                  2. Surplus Redistribution Rate:
                </span>
                <code>Redistribution_Rate = (Claimed / Announced) × 100%</code>
                <p className="font-sans text-[11px] text-slate-500 mt-1">
                  Safe division guard prevents divide-by-zero errors.
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-sans font-bold text-slate-800 block mb-1">
                  3. Food Waste Avoided (kg):
                </span>
                <code>Food_Saved_kg = Total_Claimed_Portions × 0.45 kg</code>
                <p className="font-sans text-[11px] text-slate-500 mt-1">
                  0.45 kg is standard institutional meal edible weight benchmark.
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-sans font-bold text-slate-800 block mb-1">
                  4. CO₂e Emissions Abated:
                </span>
                <code>CO₂e_Saved_kg = Food_Saved_kg × 2.5 kg CO₂e</code>
                <p className="font-sans text-[11px] text-slate-500 mt-1">
                  Derived from EPA LCA organic degradation factors.
                </p>
              </div>
            </div>
          </div>

          {/* Database Schema */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-700" />
                <span>Firestore Collections Architecture</span>
              </h3>
              <button
                onClick={() => copyToClipboard(firestoreSchemaText, 'schema')}
                className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === 'schema' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'schema' ? 'Copied' : 'Copy Schema'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-emerald-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre">
              {firestoreSchemaText}
            </pre>
          </div>

          {/* Security Rules */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Firestore Security Rules (firestore.rules)</span>
              </h3>
              <button
                onClick={() => copyToClipboard(securityRulesText, 'rules')}
                className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === 'rules' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'rules' ? 'Copied' : 'Copy Rules'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre">
              {securityRulesText}
            </pre>
          </div>

          {/* Local Setup Instructions */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-700" />
              <span>Local Deployment & Running Instructions</span>
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-mono text-[11px]">
              <div>
                <p className="font-sans font-bold text-slate-800">1. Clone & Install Dependencies:</p>
                <code className="text-slate-900 block bg-white p-2 rounded border border-slate-200 mt-1">
                  git clone &lt;repo-url&gt; && cd nutricampus<br />
                  npm install
                </code>
              </div>
              <div>
                <p className="font-sans font-bold text-slate-800">2. Configure Environment (.env):</p>
                <code className="text-slate-900 block bg-white p-2 rounded border border-slate-200 mt-1">
                  VITE_FIREBASE_API_KEY="your-key"<br />
                  VITE_FIREBASE_PROJECT_ID="your-project"<br />
                  VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
                </code>
              </div>
              <div>
                <p className="font-sans font-bold text-slate-800">3. Run Development Server:</p>
                <code className="text-slate-900 block bg-white p-2 rounded border border-slate-200 mt-1">
                  npm run dev
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            NutriCampus Mini-Project · Computer Science & Engineering
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#1C3B2B] text-white font-semibold hover:bg-[#27533c] cursor-pointer"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
