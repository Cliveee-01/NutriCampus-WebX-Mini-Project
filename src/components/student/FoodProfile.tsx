import React, { useState, useEffect } from 'react';
import { useNutriStore } from '../../hooks/useNutriStore';
import {
  User,
  ShieldAlert,
  Save,
  CheckCircle2,
  Sparkles,
  Info,
  AlertTriangle,
  Database,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  getStudentProfile,
  updateStudentProfile,
  createStudentProfile,
  getAllStudents,
  getDatabaseStatus,
  StudentMongoProfile,
  DatabaseStatus,
} from '../../services/studentApi';

export const FoodProfile: React.FC = () => {
  const store = useNutriStore();
  const currentUser = store.getCurrentUser();
  const isAdmin = currentUser.role === 'admin';

  // Form State
  const [name, setName] = useState(currentUser.name);
  const [vegan, setVegan] = useState(currentUser.dietaryPreferences.vegan);
  const [glutenFree, setGlutenFree] = useState(currentUser.dietaryPreferences.glutenFree);
  const [highProtein, setHighProtein] = useState(currentUser.dietaryPreferences.highProtein);
  const [allergiesText, setAllergiesText] = useState((currentUser.allergies || []).join(', '));
  const [roomOrHostel, setRoomOrHostel] = useState(currentUser.roomOrHostel || '');
  const [studentId, setStudentId] = useState(currentUser.studentId || '');

  // Async Network States
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [mongoDocId, setMongoDocId] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Database Connection Info
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);

  // Admin View State
  const [allStudents, setAllStudents] = useState<StudentMongoProfile[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  // 1. Fetch Student Profile from MongoDB on mount or when persona switches
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setServerError(null);
      setServerSuccess(null);

      // Check DB Status
      const status = await getDatabaseStatus();
      if (isMounted && status) {
        setDbStatus(status);
      }

      // Fetch student profile for current student
      const result = await getStudentProfile(currentUser.email, currentUser);

      if (isMounted) {
        if (result.success && result.data) {
          const doc = result.data;
          setMongoDocId(doc._id);
          setName(doc.name || currentUser.name);
          setStudentId(doc.studentId || currentUser.studentId || '');
          setRoomOrHostel(doc.roomOrHostel || currentUser.roomOrHostel || '');
          setAllergiesText(doc.allergies?.join(', ') || '');
          setVegan(doc.dietaryPreferencesObj?.vegan ?? doc.dietaryPreferences?.includes('Vegan') ?? false);
          setGlutenFree(
            doc.dietaryPreferencesObj?.glutenFree ?? doc.dietaryPreferences?.includes('Gluten-Free') ?? false
          );
          setHighProtein(
            doc.dietaryPreferencesObj?.highProtein ?? doc.dietaryPreferences?.includes('High Protein') ?? false
          );
          setLastSavedAt(doc.updatedAt || doc.createdAt);

          // Sync in-memory store so daily menu immediately highlights matches
          store.updateProfileDietary(
            {
              vegan: doc.dietaryPreferences?.includes('Vegan') || false,
              glutenFree: doc.dietaryPreferences?.includes('Gluten-Free') || false,
              highProtein: doc.dietaryPreferences?.includes('High Protein') || false,
            },
            doc.allergies || []
          );
        } else {
          // If not found in DB yet, seed from current user defaults
          setName(currentUser.name);
          setStudentId(currentUser.studentId || '');
          setRoomOrHostel(currentUser.roomOrHostel || '');
          setVegan(currentUser.dietaryPreferences.vegan);
          setGlutenFree(currentUser.dietaryPreferences.glutenFree);
          setHighProtein(currentUser.dietaryPreferences.highProtein);
          setAllergiesText((currentUser.allergies || []).join(', '));
        }

        // If admin, load all registered students list
        if (isAdmin) {
          loadAdminStudents();
        }

        setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [currentUser.id, currentUser.email, isAdmin]);

  const loadAdminStudents = async () => {
    setIsLoadingAll(true);
    const res = await getAllStudents(currentUser);
    if (res.success && res.data) {
      setAllStudents(res.data);
    }
    setIsLoadingAll(false);
  };

  // 2. Submit Handler: Save to Express Backend and MongoDB
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);
    setIsSaving(true);

    const parsedAllergies = allergiesText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const dietaryList: string[] = [];
    if (vegan) dietaryList.push('Vegan');
    if (glutenFree) dietaryList.push('Gluten-Free');
    if (highProtein) dietaryList.push('High Protein');

    const payload = {
      name: name.trim(),
      email: currentUser.email.toLowerCase().trim(),
      studentId: studentId.trim(),
      roomOrHostel: roomOrHostel.trim(),
      dietaryPreferences: dietaryList,
      allergies: parsedAllergies,
    };

    // Try updating first (or create if new)
    let res = await updateStudentProfile(currentUser.email, payload, currentUser);

    // If student didn't exist yet in MongoDB, create record
    if (!res.success && res.error?.includes('not found')) {
      res = await createStudentProfile(payload, currentUser);
    }

    setIsSaving(false);

    if (res.success && res.data) {
      const savedDoc = res.data;
      setMongoDocId(savedDoc._id);
      setLastSavedAt(savedDoc.updatedAt || savedDoc.createdAt);
      setServerSuccess(
        `Profile saved successfully in MongoDB collection "students"! (Document _id: ${savedDoc._id})`
      );

      // Sync local store
      store.updateProfileDietary(
        {
          vegan,
          glutenFree,
          highProtein,
        },
        parsedAllergies
      );

      // Refresh admin list if admin
      if (isAdmin) {
        loadAdminStudents();
      }

      setTimeout(() => {
        setServerSuccess((prev) => (prev?.includes(savedDoc._id) ? prev : null));
      }, 5000);
    } else {
      setServerError(res.error || 'Failed to save student profile to MongoDB database.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Student Food & Dietary Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Personalize your campus dining experience. Saved preferences are persisted in MongoDB database <code className="font-mono text-emerald-800 bg-emerald-50 px-1 rounded">nutricampus</code>.
          </p>
        </div>

        {/* Database Status Indicator */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-xs self-start sm:self-auto">
          <Database className="w-3.5 h-3.5 text-emerald-700" />
          <span className="text-slate-500">Database:</span>
          {dbStatus?.connected ? (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              MongoDB Atlas (nutricampus.students)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              nutricampus (Express API Connected)
            </span>
          )}
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {/* Student identification badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
              {currentUser.name[0]}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{currentUser.name}</h3>
              <p className="text-xs text-slate-500">
                Email: <strong className="text-slate-700">{currentUser.email}</strong> · Student ID: <code className="font-mono text-slate-700">{currentUser.studentId}</code>
              </p>
            </div>
          </div>

          {/* MongoDB Metadata badge */}
          <div className="text-right text-[11px] text-slate-400">
            {mongoDocId ? (
              <div>
                <span className="block text-slate-500 font-mono">
                  MongoDB _id: <strong className="text-slate-700">{mongoDocId}</strong>
                </span>
                {lastSavedAt && (
                  <span className="block text-slate-400">
                    Last synced: {new Date(lastSavedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-slate-400">Not yet registered in MongoDB</span>
            )}
          </div>
        </div>

        {/* Server Success Banner */}
        {serverSuccess && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold">{serverSuccess}</span>
          </div>
        )}

        {/* Server Error Banner */}
        {serverError && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
            <span className="font-semibold">{serverError}</span>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
            <span>Fetching saved profile from MongoDB backend...</span>
          </div>
        )}

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
            <span className="text-xs text-slate-400">
              Synchronized directly with Express API & MongoDB.
            </span>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#1C3B2B] hover:bg-[#27533c] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to MongoDB...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Admin Only: All Registered Student Profiles View (Endpoint: GET /api/students) */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-700" />
              <h3 className="text-base font-bold text-slate-900">
                All Student Profiles in MongoDB (Admin Access)
              </h3>
            </div>
            <button
              onClick={loadAdminStudents}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-semibold hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Records</span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Retrieved via secure endpoint <code>GET /api/students</code>. Access restricted to canteen administrators.
          </p>

          {isLoadingAll ? (
            <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading registered students...</span>
            </div>
          ) : allStudents.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No student profiles found in MongoDB.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Student ID</th>
                    <th className="py-2.5 px-3">Dietary Preferences</th>
                    <th className="py-2.5 px-3">Allergies</th>
                    <th className="py-2.5 px-3 font-mono">MongoDB _id</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allStudents.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-semibold text-slate-800">{s.name}</td>
                      <td className="py-2 px-3 text-slate-600">{s.email}</td>
                      <td className="py-2 px-3 text-slate-500 font-mono">{s.studentId || '—'}</td>
                      <td className="py-2 px-3">
                        {s.dietaryPreferences && s.dietaryPreferences.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {s.dietaryPreferences.map((tag) => (
                              <span
                                key={tag}
                                className="bg-emerald-50 text-emerald-800 font-medium px-1.5 py-0.5 rounded text-[10px]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">Standard</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-500">
                        {s.allergies && s.allergies.length > 0 ? s.allergies.join(', ') : 'None'}
                      </td>
                      <td className="py-2 px-3 font-mono text-[10px] text-slate-400">
                        {s._id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
