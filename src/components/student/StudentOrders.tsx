import React, { useState, useEffect } from 'react';
import { useNutriStore } from '../../hooks/useNutriStore';
import { getStudentOrders, getOrderReceipt, OrderRecord, ReceiptData } from '../../services/orderApi';
import { ReceiptModal } from '../orders/ReceiptModal';
import {
  ShoppingBag,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Utensils,
  ChevronRight,
  PackageCheck,
  ChefHat,
  Filter,
} from 'lucide-react';

interface StudentOrdersProps {
  onNavigateToMenu: () => void;
}

export const StudentOrders: React.FC<StudentOrdersProps> = ({ onNavigateToMenu }) => {
  const store = useNutriStore();
  const currentUser = store.getCurrentUser();

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // Selected receipt modal
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [fetchingReceipt, setFetchingReceipt] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    const res = await getStudentOrders(currentUser);
    setLoading(false);
    if (res.success && res.data) {
      setOrders(res.data);
    } else {
      setError(res.error || 'Failed to load order history from database.');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser.id, currentUser.email]);

  const handleOpenReceipt = async (ord: OrderRecord) => {
    setSelectedOrder(ord);
    setFetchingReceipt(true);
    setIsReceiptModalOpen(true);
    const res = await getOrderReceipt(ord.orderNumber, currentUser);
    setFetchingReceipt(false);
    if (res.success && res.receipt) {
      setSelectedReceipt(res.receipt);
    } else {
      setSelectedReceipt(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'All') return true;
    return o.orderStatus === activeFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Placed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Preparing':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Ready for Pickup':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-300';
      case 'Completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Canteen Orders & Receipts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track preparation progress, verify MongoDB receipts, and collect food tokens at the dining counter.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onNavigateToMenu}
            className="px-4 py-1.5 rounded-lg bg-[#1C3B2B] hover:bg-[#27533c] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Order New Meal
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs">
        {['All', 'Placed', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'].map((f) => {
          const count = orders.filter((o) => (f === 'All' ? true : o.orderStatus === f)).length;
          const isActive = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#1C3B2B] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{f}</span>
              <span className="ml-1.5 opacity-80 tabular-nums">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchOrders}
            className="px-2.5 py-1 bg-white border border-rose-300 rounded font-bold hover:bg-rose-100 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs">Fetching orders from MongoDB Atlas...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No orders in this view</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeFilter === 'All'
              ? 'You have not placed any canteen meals yet. Check out the Daily Menu!'
              : `No orders currently marked as "${activeFilter}".`}
          </p>
          <button
            onClick={onNavigateToMenu}
            className="mt-2 px-4 py-2 rounded-xl bg-[#1C3B2B] text-white text-xs font-bold hover:bg-[#27533c] transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Utensils className="w-4 h-4 text-lime-400" />
            <span>Browse Daily Menu</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((ord) => {
            const dateStr = new Date(ord.createdAt).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            });

            return (
              <div
                key={ord._id || ord.orderNumber}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top order info & status */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Order Number
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {ord.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{dateStr}</span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wider ${getStatusColor(
                        ord.orderStatus
                      )}`}
                    >
                      {ord.orderStatus}
                    </span>
                  </div>

                  {/* Items list */}
                  <div className="py-3 space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Tray Items ({ord.items.length})
                    </span>
                    <ul className="divide-y divide-slate-100">
                      {ord.items.map((item, idx) => (
                        <li key={idx} className="py-1.5 flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <span className="font-semibold text-slate-800 truncate block">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-slate-400 capitalize">
                              Qty: {item.quantity} · ₹{item.unitPrice} each
                            </span>
                          </div>
                          <span className="font-bold text-slate-900 tabular-nums shrink-0">
                            ₹{item.lineTotal || item.unitPrice * item.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer totals and View Receipt action */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Total Amount</span>
                      <span className="text-base font-bold text-[#1C3B2B] tabular-nums">
                        ₹{ord.totalAmount}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Payment</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {ord.paymentMethod}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenReceipt(ord)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                    <span>View Digital Receipt</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Digital Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        order={selectedOrder}
        receipt={selectedReceipt}
      />
    </div>
  );
};
