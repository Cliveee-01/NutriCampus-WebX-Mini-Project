import React, { useState } from 'react';
import { OrderRecord, ReceiptData } from '../../services/orderApi';
import {
  CheckCircle2,
  Clock,
  Printer,
  Copy,
  Check,
  X,
  MapPin,
  Utensils,
  Receipt,
  AlertCircle,
  ChefHat,
  PackageCheck,
  Building,
} from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderRecord | null;
  receipt?: ReceiptData | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  receipt,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || (!order && !receipt)) return null;

  const orderNum = receipt?.orderNumber || order?.orderNumber || 'NC-ORD';
  const receiptNum = receipt?.receiptNumber || `REC-${orderNum}`;
  const student = receipt?.student || {
    name: order?.studentName || 'Student',
    email: order?.studentEmail || '',
    studentId: order?.studentId || 'STUDENT',
    roomOrHostel: order?.roomOrHostel || '',
  };
  const items = receipt?.items || order?.items || [];
  const subtotal = receipt?.subtotal ?? order?.subtotal ?? 0;
  const totalAmount = receipt?.totalAmount ?? order?.totalAmount ?? 0;
  const paymentMethod = receipt?.paymentMethod || order?.paymentMethod || 'Pay at Pickup';
  const paymentStatus = receipt?.paymentStatus || order?.paymentStatus || 'Pending';
  const orderStatus = receipt?.orderStatus || order?.orderStatus || 'Placed';
  const placedAt = receipt?.placedAt || order?.createdAt || new Date().toISOString();
  const pickupInstructions =
    receipt?.pickupInstructions ||
    order?.pickupInstructions ||
    'Collect order at Central Canteen Counter within 30 minutes of preparation.';

  const handleCopy = () => {
    navigator.clipboard.writeText(orderNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(placedAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Status step configuration
  const steps = [
    { label: 'Placed', icon: Clock, active: true },
    { label: 'Preparing', icon: ChefHat, active: ['Preparing', 'Ready for Pickup', 'Completed'].includes(orderStatus) },
    { label: 'Ready for Pickup', icon: PackageCheck, active: ['Ready for Pickup', 'Completed'].includes(orderStatus) },
    { label: 'Completed', icon: CheckCircle2, active: orderStatus === 'Completed' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8 relative flex flex-col max-h-[90vh]">
        {/* Top Header / Bar */}
        <div className="bg-[#1C3B2B] text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-lime-400">
                Official Digital Receipt
              </span>
              <h2 className="text-lg font-bold leading-tight">NutriCampus Canteen</h2>
              <p className="text-xs text-emerald-100/80">Campus Food & Waste Management</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-900/50 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800 text-xs">
          {/* Success Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5 text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold block text-sm">Order Confirmed & Saved to Database</span>
              <span className="text-[11px] text-emerald-700">
                Recorded in MongoDB Atlas collection "orders"
              </span>
            </div>
          </div>

          {/* Reference & Date Card */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                Order Reference
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                  {orderNum}
                </span>
                <button
                  onClick={handleCopy}
                  title="Copy Order Number"
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Receipt: {receiptNum}</span>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                Placed At
              </span>
              <span className="font-medium text-slate-700 block mt-0.5">{formattedDate}</span>
              <span className="text-[11px] font-semibold text-emerald-700 mt-0.5 inline-block bg-emerald-100/60 px-2 py-0.5 rounded">
                Status: {orderStatus}
              </span>
            </div>
          </div>

          {/* Order Progress Stepper */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Fulfillment Tracker
            </span>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {steps.map((st, idx) => {
                const Icon = st.icon;
                return (
                  <div key={st.label} className="flex flex-col items-center text-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs mb-1 transition-colors ${
                        st.active
                          ? 'bg-[#1C3B2B] text-lime-400 ring-2 ring-emerald-300'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={`text-[10px] font-semibold leading-tight ${
                        st.active ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Details */}
          <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-white">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
              Student Details
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 text-[11px]">Name:</span>
                <p className="font-semibold text-slate-800">{student.name}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Student ID:</span>
                <p className="font-semibold text-slate-800">{student.studentId || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Email:</span>
                <p className="font-medium text-slate-700 truncate">{student.email}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Hostel / Room:</span>
                <p className="font-medium text-slate-700">{student.roomOrHostel || 'Campus Resident'}</p>
              </div>
            </div>
          </div>

          {/* Itemized Order Breakdown */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
              Ordered Meal Items
            </span>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-2 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={`${item.menuItemId}-${idx}`} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900 block">{item.name}</span>
                        {item.period && (
                          <span className="text-[10px] text-slate-400 capitalize">
                            {item.period} Session
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-slate-800 tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 tabular-nums">
                        ₹{item.unitPrice}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                        ₹{item.lineTotal || item.unitPrice * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="bg-slate-50/80 p-3.5 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium tabular-nums">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Canteen Convenience Fee & GST</span>
                  <span className="text-emerald-700 font-medium">₹0 (Mess Subsidized)</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="text-base text-[#1C3B2B] tabular-nums">₹{totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Pickup Card */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-amber-950 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-amber-800" />
                <span>Pickup Counter: Counter 1 (Central Dining Hall)</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[11px]">
                {paymentMethod} ({paymentStatus})
              </span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              {pickupInstructions}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1C3B2B] hover:bg-[#27533c] text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
