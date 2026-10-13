import React, { useState, useEffect } from 'react';
import { useNutriStore } from '../../hooks/useNutriStore';
import {
  getAdminOrders,
  updateOrderStatus,
  getOrderReceipt,
  OrderRecord,
  OrderStatus,
  ReceiptData,
} from '../../services/orderApi';
import { ReceiptModal } from '../orders/ReceiptModal';
import {
  ShoppingBag,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  ChefHat,
  PackageCheck,
  TrendingUp,
  DollarSign,
  ChevronDown,
  User,
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const store = useNutriStore();
  const adminUser = store.getCurrentUser();

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Stats
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // Receipt Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    const res = await getAdminOrders(adminUser, statusFilter);
    setLoading(false);
    if (res.success && res.data) {
      setOrders(res.data);
      if (res.totalRevenue !== undefined) setTotalRevenue(res.totalRevenue);
      if (res.pendingCount !== undefined) setPendingCount(res.pendingCount);
    } else {
      setError(res.error || 'Failed to fetch canteen orders from MongoDB database.');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (order: OrderRecord, newStatus: OrderStatus) => {
    setUpdatingId(order._id);
    setActionMessage(null);
    const res = await updateOrderStatus(order._id, newStatus, adminUser);
    setUpdatingId(null);

    if (res.success && res.data) {
      // Update local state immediately
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? { ...o, orderStatus: newStatus } : o))
      );
      setActionMessage(`Order #${order.orderNumber} updated to "${newStatus}" in MongoDB.`);
      setTimeout(() => setActionMessage(null), 3000);
    } else {
      alert(res.error || 'Failed to update order status');
    }
  };

  const handleOpenReceipt = async (order: OrderRecord) => {
    setSelectedOrder(order);
    setIsReceiptOpen(true);
    const res = await getOrderReceipt(order.orderNumber, adminUser);
    if (res.success && res.receipt) {
      setSelectedReceipt(res.receipt);
    } else {
      setSelectedReceipt(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.studentName.toLowerCase().includes(q) ||
      o.studentEmail.toLowerCase().includes(q) ||
      (o.studentId && o.studentId.toLowerCase().includes(q))
    );
  });

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'Placed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Preparing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Ready for Pickup':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 ring-1 ring-emerald-300';
      case 'Completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Canteen Food Orders Console
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time incoming dining tray orders stored in MongoDB Atlas database "nutricampus".
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {orders.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Recorded in canteen system</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending / In Kitchen</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 tabular-nums">
            {orders.filter((o) => ['Placed', 'Preparing'].includes(o.orderStatus)).length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Requires kitchen fulfillment</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-[#1C3B2B]" />
          </div>
          <div className="text-2xl font-bold text-emerald-800 tabular-nums">
            ₹{totalRevenue || orders.filter((o) => o.orderStatus !== 'Cancelled').reduce((sum, o) => sum + o.totalAmount, 0)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">From active canteen orders</p>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, ID, or order #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {['All', 'Placed', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'].map((f) => {
            const isActive = statusFilter === f;
            return (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1C3B2B] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs">Loading orders from MongoDB Atlas...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No orders found</p>
            <p className="text-xs text-slate-500">
              {searchQuery ? 'Try adjusting your search query.' : 'No orders in this status category.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order / Time</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Tray Items</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => {
                  const dateStr = new Date(ord.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={ord._id || ord.orderNumber} className="hover:bg-slate-50/70 transition-colors">
                      {/* Order & Time */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 block">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">{dateStr}</span>
                      </td>

                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{ord.studentName}</div>
                        <div className="text-[11px] text-slate-500">
                          {ord.studentId || 'ID: N/A'} · {ord.studentEmail}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {ord.items.map((i, idx) => (
                            <div key={idx} className="text-slate-700">
                              <span className="font-medium text-slate-900">{i.quantity}x</span>{' '}
                              <span>{i.name}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Amount & Payment */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 tabular-nums block">
                          ₹{ord.totalAmount}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {ord.paymentMethod} ({ord.paymentStatus})
                        </span>
                      </td>

                      {/* Status Selector Dropdown */}
                      <td className="py-3.5 px-4">
                        <div className="relative inline-block">
                          <select
                            value={ord.orderStatus}
                            disabled={updatingId === ord._id}
                            onChange={(e) =>
                              handleStatusChange(ord, e.target.value as OrderStatus)
                            }
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border uppercase tracking-wider cursor-pointer focus:outline-hidden ${getStatusBadgeClass(
                              ord.orderStatus
                            )}`}
                          >
                            <option value="Placed">Placed</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Ready for Pickup">Ready for Pickup</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>

                      {/* Actions: View Receipt */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenReceipt(ord)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Digital Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={selectedOrder}
        receipt={selectedReceipt}
      />
    </div>
  );
};
