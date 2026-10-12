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
  FileText,
  Users,
  Award,
} from 'lucide-react';

interface ProjectDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDocModal: React.FC<ProjectDocModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'prd' | 'architecture' | 'schema' | 'rules' | 'viva'>('prd');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const firestoreSchemaText = `// Firestore Schema Collections
1. "users"/{userId}
   - name: string (e.g. 'Jaden Dsouza')
   - email: string (e.g. 'jaden.dsouza@campus.edu')
   - role: 'student' | 'admin'
   - studentId: string ('2023-CS-104')
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
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#1C3B2B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-lime-400" />
            <div>
              <h2 className="text-base font-bold leading-tight">
                NutriCampus — Mini-Project PRD & Technical Documentation
              </h2>
              <p className="text-[11px] text-emerald-200/80">
                Product Requirements Document · Firestore Schema · Security Rules · Viva Protocol
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-slate-50 text-xs overflow-x-auto">
          {[
            { id: 'prd', label: 'PRD Document', icon: FileText },
            { id: 'architecture', label: 'Formulas & Math', icon: Cpu },
            { id: 'schema', label: 'Firestore Collections', icon: Database },
            { id: 'rules', label: 'Security Rules', icon: ShieldCheck },
            { id: 'viva', label: 'Viva Examiner Script', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 py-2.5 px-3.5 font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[#1C3B2B] text-[#1C3B2B] bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed flex-1">
          {/* TAB 1: PRD DOCUMENT */}
          {activeTab === 'prd' && (
            <div className="space-y-6">
              {/* Authors & Metadata */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide">
                    Project Contributors (Academic Team)
                  </span>
                  <div className="text-xs text-emerald-950 font-medium">
                    <strong>Jaden Dsouza</strong> (2023-CS-104) · <strong>Leon Dsouza</strong> (2023-EC-048) · <strong>Clive Fernandes</strong> (2022-ME-219)
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    Canteen Stakeholder: <strong>Chef Leron & Mess Committee</strong>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard('Please see /PRD.md for complete Markdown contents', 'prd_root')}
                  className="px-3 py-1.5 rounded-lg bg-[#1C3B2B] hover:bg-[#27533c] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSection === 'prd_root' ? 'Copied' : 'PRD Compiled to /PRD.md'}</span>
                </button>
              </div>

              {/* 1. Problem Statement */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <span>1. Problem Statement & Mission</span>
                </h3>
                <p className="text-slate-600">
                  Residential colleges experience 30%–45% cafeteria food waste because dining halls prepare static batches for ~350 students regardless of attendance swings. <strong>NutriCampus</strong> introduces a closed-loop system where advance student RSVPs drive deterministic ingredient purchase orders, and end-of-service batch surpluses are atomically redistributed to students via discounted flash sales.
                </p>
              </div>

              {/* 2. Stakeholders & User Personas */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>2. User Personas</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <strong className="text-slate-900 block">Jaden Dsouza (Student)</strong>
                    <span className="text-[11px] text-slate-500 block">3rd Year CS · High-Protein Focus</span>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Wants 1-click RSVP before cutoff, checks calories/protein, and grabs discounted surplus meal tokens.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <strong className="text-slate-900 block">Leon Dsouza (Student)</strong>
                    <span className="text-[11px] text-slate-500 block">2nd Year EC · Vegan & Gluten-Free</span>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Relies on dynamic dietary filters and allergen safety disclosures to verify ingredients.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <strong className="text-slate-900 block">Chef Leron (Canteen Admin)</strong>
                    <span className="text-[11px] text-slate-500 block">Head Superintendent & Catering</span>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Needs live RSVP headcount to scale raw ingredient procurement (rice, dal, paneer kg) and broadcast surplus.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Core Functional Pillars */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-700" />
                  <span>3. Functional Specifications (FR Matrix)</span>
                </h3>
                <div className="space-y-2 text-slate-600">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <strong className="text-slate-900 block mb-0.5">FR-1: Cutoff-Enforced Advance RSVP</strong>
                    Single response stored per student/date/session. Cutoff rules lock breakfast at 6:30 AM, lunch at 10:30 AM, dinner at 5:30 PM.
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <strong className="text-slate-900 block mb-0.5">FR-2: Dynamic Recipe Ingredient Scaler</strong>
                    Calculates: <code>Required Qty = Expected Demand × Portion Qty</code>. Immediate update across rice, dal, paneer, and cooking oil.
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <strong className="text-slate-900 block mb-0.5">FR-3: Atomic Surplus Flash Sale</strong>
                    Discounted surplus meals (50%–65% off). Concurrency guards prevent negative stock; generates claim codes (e.g. <code>NC-7482</code>).
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <strong className="text-slate-900 block mb-0.5">FR-4: Sustainability Telemetry</strong>
                    Tracks Redistribution Rate % and EPA-standard carbon avoided (2.5 kg CO2e per kg food saved) via Chart.js.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARCHITECTURE & FORMULAS */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Mathematical Formulations & Environmental Factors
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="font-sans font-bold text-slate-800 block mb-1">
                    1. Raw Ingredient Scaling Formula:
                  </span>
                  <code>Required_Quantity = Expected_Demand × Quantity_Per_Portion</code>
                  <p className="font-sans text-[11px] text-slate-500 mt-1">
                    e.g., 80 students × 150g rice = 12,000g (12.0 kg)
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="font-sans font-bold text-slate-800 block mb-1">
                    2. Surplus Redistribution Rate:
                  </span>
                  <code>Redistribution_Rate = (Claimed / Announced) × 100%</code>
                  <p className="font-sans text-[11px] text-slate-500 mt-1">
                    Safe division guard prevents divide-by-zero errors.
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="font-sans font-bold text-slate-800 block mb-1">
                    3. Food Waste Avoided (kg):
                  </span>
                  <code>Food_Saved_kg = Total_Claimed_Portions × 0.45 kg</code>
                  <p className="font-sans text-[11px] text-slate-500 mt-1">
                    0.45 kg is standard institutional meal edible weight benchmark.
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
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
          )}

          {/* TAB 3: SCHEMA */}
          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-700" />
                  <span>Firestore Collections Blueprint</span>
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
          )}

          {/* TAB 4: RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Security Rules (firestore.rules)</span>
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
          )}

          {/* TAB 5: VIVA PROTOCOL */}
          {activeTab === 'viva' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>Examiner Live Demonstration Walkthrough</span>
              </h3>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <p><strong>Step 1:</strong> Select Student view (Jaden Dsouza) and check today's Lunch Menu.</p>
                <p><strong>Step 2:</strong> Apply the "Vegan" filter to inspect dynamic filtering.</p>
                <p><strong>Step 3:</strong> Open Meal RSVP and select "Attending" for Lunch.</p>
                <p><strong>Step 4:</strong> Switch to Canteen Admin (Chef Leron) $\rightarrow$ Demand Forecast to verify attendance & ingredient totals update.</p>
                <p><strong>Step 5:</strong> Click "Simulate +8 RSVPs" in the top banner to demonstrate live responsive scaling on the Chart.js graph.</p>
                <p><strong>Step 6:</strong> Open Surplus Broadcast and announce a surplus dish batch.</p>
                <p><strong>Step 7:</strong> Switch back to Student Portal $\rightarrow$ Flash Sale and click "Claim Surplus Meal".</p>
                <p><strong>Step 8:</strong> Verify atomic stock decrement and digital claim token generation (e.g. <code>NC-7482</code>).</p>
                <p><strong>Step 9:</strong> Check Sustainability Analytics to view updated redistribution rate % and kg of food saved.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            NutriCampus PRD v1.0.0 · Jaden Dsouza, Leon Dsouza, Clive Fernandes, Chef Leron
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
