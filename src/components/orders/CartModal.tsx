import React, { useState } from 'react';
import { useCartStore } from '../../services/cartStore';
import { useNutriStore } from '../../hooks/useNutriStore';
import { placeFoodOrder, OrderRecord } from '../../services/orderApi';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: OrderRecord) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const cart = useCartStore();
  const store = useNutriStore();
  const currentUser = store.getCurrentUser();
  const items = cart.getItems();
  const subtotal = cart.getSubtotal();
  const totalAmount = subtotal;

  const [paymentMethod, setPaymentMethod] = useState('Pay at Pickup');
  const [isPlacing, setIsPlacing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setErrorMessage(null);
    setIsPlacing(true);

    const orderPayload = items.map((i) => ({
      menuItemId: i.mealId,
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.price,
      period: i.period,
    }));

    const result = await placeFoodOrder(orderPayload, currentUser, paymentMethod);
    setIsPlacing(false);

    if (result.success && result.data) {
      cart.clearCart();
      onClose();
      onOrderSuccess(result.data);
    } else {
      setErrorMessage(
        result.error || 'Failed to place order in canteen database. Please check connection and try again.'
      );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-slate-200">
        {/* Cart Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1C3B2B] text-lime-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                My Canteen Tray
              </h2>
              <span className="text-[11px] text-slate-500">
                {items.length} {items.length === 1 ? 'item' : 'items'} selected
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="m-4 p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Order Placement Error</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm">Your tray is empty</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Explore the Breakfast, Lunch, or Dinner menu and tap "Add to Cart" to start your order.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.mealId}
                className="bg-white rounded-xl border border-slate-200/80 p-3.5 flex items-center gap-3 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0 relative">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {item.name}
                  </h4>
                  <div className="text-[11px] text-slate-500 capitalize">
                    {item.period} · ₹{item.price} each
                  </div>
                  <div className="text-xs font-bold text-emerald-800 tabular-nums mt-0.5">
                    ₹{item.price * item.quantity}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => cart.decrement(item.mealId)}
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
                    title="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-bold text-slate-800 text-xs tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => cart.increment(item.mealId)}
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
                    title="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Remove item button */}
                <button
                  onClick={() => cart.removeItem(item.mealId)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50/50 space-y-4">
            {/* Authenticated Student Notice */}
            <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-200/60">
              <span>Ordering as:</span>
              <span className="font-semibold text-slate-800">
                {currentUser.name} ({currentUser.studentId || 'Student'})
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Payment Option
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Pay at Pickup')}
                  className={`py-2 px-3 rounded-lg font-medium border text-left transition-all flex items-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'Pay at Pickup'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Pay at Pickup</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash at Canteen')}
                  className={`py-2 px-3 rounded-lg font-medium border text-left transition-all flex items-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'Cash at Canteen'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cash at Counter</span>
                </button>
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-slate-800 tabular-nums">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Canteen Service & Tax</span>
                <span className="text-emerald-700 font-medium">₹0 (Included)</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Payable</span>
                <span className="text-base text-[#1C3B2B] tabular-nums">₹{totalAmount}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handleCheckout}
              disabled={isPlacing || items.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-[#1C3B2B] hover:bg-[#27533c] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlacing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-lime-400" />
                  <span>Recording in MongoDB Atlas...</span>
                </>
              ) : (
                <>
                  <span>Place Canteen Order (₹{totalAmount})</span>
                  <ArrowRight className="w-4 h-4 text-lime-400" />
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400">
              Saved permanently to MongoDB database "nutricampus" · Real-time kitchen notification
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
