import React, { useState } from 'react';
import { useNutriStore } from '../../hooks/useNutriStore';
import { SurplusOffer } from '../../types';
import { IMAGES } from '../../data/seedData';
import {
  Tag,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Eye,
  Slash,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const SurplusBroadcast: React.FC = () => {
  const store = useNutriStore();
  const offers = store.getSurplusOffers();
  const claims = store.getAllClaims();

  // Form State
  const [mealName, setMealName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(IMAGES.paneerCurry);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [originalPrice, setOriginalPrice] = useState<number>(75);
  const [discountedPrice, setDiscountedPrice] = useState<number>(30);
  const [availableQuantity, setAvailableQuantity] = useState<number>(8);
  const [pickupStartTime, setPickupStartTime] = useState('2:15 PM');
  const [pickupDeadline, setPickupDeadline] = useState('3:45 PM');
  const [pickupLocation, setPickupLocation] = useState('Counter 2 (Surplus Bay), Ground Floor Canteen');
  const [ingredientsText, setIngredientsText] = useState('Steamed Rice, Yellow Lentils, Ghee, Spices');
  const [allergensText, setAllergensText] = useState('Dairy (Ghee)');

  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPublishForm, setShowPublishForm] = useState(false);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!mealName.trim()) {
      setFormError('Meal Name is required.');
      return;
    }
    if (!description.trim()) {
      setFormError('Description is required.');
      return;
    }
    if (originalPrice <= 0) {
      setFormError('Original price must be greater than ₹0.');
      return;
    }
    if (discountedPrice <= 0) {
      setFormError('Discounted price must be greater than ₹0.');
      return;
    }
    if (discountedPrice > originalPrice) {
      setFormError('Discounted price cannot exceed original price.');
      return;
    }
    if (availableQuantity <= 0) {
      setFormError('Available quantity must be a positive integer.');
      return;
    }
    if (!pickupDeadline.trim()) {
      setFormError('Pickup deadline is required.');
      return;
    }

    const imageToUse = customImageUrl.trim() ? customImageUrl.trim() : selectedImage;
    const ingredients = ingredientsText.split(',').map((s) => s.trim()).filter(Boolean);
    const allergens = allergensText.split(',').map((s) => s.trim()).filter(Boolean);

    const result = store.publishSurplusOffer({
      mealName: mealName.trim(),
      description: description.trim(),
      imageUrl: imageToUse,
      originalPrice,
      discountedPrice,
      availableQuantity,
      initialQuantity: availableQuantity,
      pickupStartTime,
      pickupDeadline,
      pickupLocation,
      ingredients,
      allergens,
    });

    if (result.success) {
      setSuccessMessage(`Surplus offer "${mealName}" published live to students!`);
      // Reset form
      setMealName('');
      setDescription('');
      setOriginalPrice(75);
      setDiscountedPrice(30);
      setAvailableQuantity(8);
      setShowPublishForm(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setFormError(result.error || 'Failed to publish offer.');
    }
  };

  const handleDeactivate = (id: string) => {
    store.updateSurplusOfferStatus(id, 'deactivated');
  };

  const handleReactivate = (id: string) => {
    store.updateSurplusOfferStatus(id, 'active');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Surplus Food Broadcast & Inventory Control
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish discounted surplus meals to students in real-time, preventing edible food from reaching cafeteria trash bins.
          </p>
        </div>

        <button
          onClick={() => setShowPublishForm(!showPublishForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C3B2B] hover:bg-[#27533c] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-lime-400" />
          <span>{showPublishForm ? 'Hide Broadcast Form' : 'Broadcast New Surplus Offer'}</span>
        </button>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Broadcast Form (Collapsible or visible) */}
      {showPublishForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Announce Surplus Leftover Meal
              </h2>
              <p className="text-xs text-slate-500">
                This item will immediately show up in the Student Flash Sale portal.
              </p>
            </div>
            <span className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 font-medium">
              Real-time synchronization
            </span>
          </div>

          {formError && (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 text-xs text-rose-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handlePublish} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Meal Name */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Meal Name *</label>
                <input
                  type="text"
                  required
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="e.g. Malai Kofta Curry with 4 Phulkas"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>

              {/* Food Image Selection */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Select Food Image</label>
                <select
                  value={selectedImage}
                  onChange={(e) => setSelectedImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                >
                  <option value={IMAGES.paneerCurry}>Paneer Butter Masala (Curry)</option>
                  <option value={IMAGES.vegPulao}>Shahi Vegetable Pulao (Rice)</option>
                  <option value={IMAGES.southIndianTiffin}>Crisp Dosa & Idli Platter</option>
                  <option value={IMAGES.hero}>Modern Campus Canteen Plate</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-800">Description & Packaging *</label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Freshly prepared lunch batch, packed hot in compostable box. Includes mint chutney."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            {/* Pricing & Stock Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Original Price (₹) *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Discounted Price (₹) *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
                <span className="text-[11px] text-emerald-700 font-semibold">
                  {originalPrice > 0 && discountedPrice <= originalPrice
                    ? `${Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)}% Discount`
                    : 'Invalid discount'}
                </span>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Available Surplus Quantity *</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={availableQuantity}
                  onChange={(e) => setAvailableQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
                <span className="text-[11px] text-slate-400">Total surplus portions</span>
              </div>
            </div>

            {/* Timings & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Pickup Start Time</label>
                <input
                  type="text"
                  value={pickupStartTime}
                  onChange={(e) => setPickupStartTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Pickup Deadline *</label>
                <input
                  type="text"
                  required
                  value={pickupDeadline}
                  onChange={(e) => setPickupDeadline(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Pickup Counter Location</label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Ingredients & Allergens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Ingredients</label>
                <input
                  type="text"
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Declared Allergens</label>
                <input
                  type="text"
                  value={allergensText}
                  onChange={(e) => setAllergensText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPublishForm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#1C3B2B] hover:bg-[#27533c] text-white font-semibold cursor-pointer shadow-sm"
              >
                Publish Surplus Offer Live
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Surplus Offers Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Active & Past Surplus Offers ({offers.length})
          </h3>
          <span className="text-xs text-slate-400">Inventory Status</span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Meal Offering</th>
                <th className="py-3 px-4">Pricing</th>
                <th className="py-3 px-4">Remaining / Initial</th>
                <th className="py-3 px-4">Claims Logged</th>
                <th className="py-3 px-4">Pickup Deadline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {offers.map((offer) => {
                const offerClaims = claims.filter((c) => c.offerId === offer.id);

                return (
                  <tr key={offer.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{offer.mealName}</div>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{offer.description}</span>
                    </td>
                    <td className="py-3 px-4 tabular-nums">
                      <span className="font-bold text-emerald-800">₹{offer.discountedPrice}</span>{' '}
                      <span className="text-slate-400 line-through text-[11px]">₹{offer.originalPrice}</span>
                    </td>
                    <td className="py-3 px-4 tabular-nums">
                      <span
                        className={`font-bold ${
                          offer.availableQuantity === 0
                            ? 'text-rose-600'
                            : offer.availableQuantity <= 3
                            ? 'text-amber-700'
                            : 'text-slate-900'
                        }`}
                      >
                        {offer.availableQuantity}
                      </span>{' '}
                      <span className="text-slate-400">/ {offer.initialQuantity}</span>
                    </td>
                    <td className="py-3 px-4 tabular-nums">
                      <span className="font-semibold text-slate-800">{offerClaims.length} claimed</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span>{offer.pickupDeadline}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          offer.status === 'active' && offer.availableQuantity > 0
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : offer.status === 'sold_out' || offer.availableQuantity === 0
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {offer.availableQuantity === 0 ? 'Sold Out' : offer.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {offer.status === 'active' ? (
                        <button
                          onClick={() => handleDeactivate(offer.id)}
                          className="text-slate-500 hover:text-rose-700 px-2 py-1 rounded hover:bg-slate-100 font-medium cursor-pointer"
                          title="Deactivate offer"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(offer.id)}
                          className="text-emerald-700 hover:text-emerald-900 px-2 py-1 rounded hover:bg-slate-100 font-medium cursor-pointer"
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
