import { UserProfile } from '../types';

export interface OrderItemPayload {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice?: number;
  period?: 'breakfast' | 'lunch' | 'dinner';
}

export type OrderStatus = 'Placed' | 'Preparing' | 'Ready for Pickup' | 'Completed' | 'Cancelled';

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  period?: 'breakfast' | 'lunch' | 'dinner';
}

export interface OrderRecord {
  _id: string;
  orderNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  roomOrHostel?: string;
  items: OrderItem[];
  subtotal: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: OrderStatus;
  pickupInstructions: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptData {
  receiptNumber: string;
  orderNumber: string;
  canteenName: string;
  canteenLocation: string;
  student: {
    name: string;
    email: string;
    studentId: string;
    roomOrHostel?: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: OrderStatus;
  placedAt: string;
  pickupInstructions: string;
}

const API_BASE = '/api';

function getAuthHeaders(user: UserProfile): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-user-role': user.role,
    'x-user-email': user.email.toLowerCase(),
    'x-user-id': user.id,
    'x-user-name': user.name,
    'x-student-id': user.studentId || '',
  };
}

/**
 * Place a new food order to MongoDB via Express API
 */
export async function placeFoodOrder(
  items: OrderItemPayload[],
  user: UserProfile,
  paymentMethod: string = 'Pay at Pickup',
  roomOrHostel?: string
): Promise<{ success: boolean; data?: OrderRecord; message?: string; error?: string }> {
  try {
    const idempotencyKey = `ord-${user.id}-${Date.now()}`;
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(user),
      body: JSON.stringify({
        items,
        paymentMethod,
        roomOrHostel: roomOrHostel || user.roomOrHostel,
        idempotencyKey,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: json.error || `Failed to place order (HTTP ${res.status})`,
      };
    }

    return {
      success: true,
      data: json.data,
      message: json.message || 'Order Placed Successfully!',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error connecting to canteen server.',
    };
  }
}

/**
 * Retrieve authenticated student's previous orders
 */
export async function getStudentOrders(
  user: UserProfile
): Promise<{ success: boolean; data?: OrderRecord[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/orders/my`, {
      method: 'GET',
      headers: getAuthHeaders(user),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || 'Failed to fetch order history' };
    }

    return { success: true, data: json.data || [] };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error fetching orders' };
  }
}

/**
 * Retrieve order receipt
 */
export async function getOrderReceipt(
  orderIdOrNumber: string,
  user: UserProfile
): Promise<{ success: boolean; receipt?: ReceiptData; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderIdOrNumber)}/receipt`, {
      method: 'GET',
      headers: getAuthHeaders(user),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || 'Failed to retrieve receipt' };
    }

    return { success: true, receipt: json.receipt };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error retrieving receipt' };
  }
}

/**
 * Admin: Retrieve all canteen orders
 */
export async function getAdminOrders(
  adminUser: UserProfile,
  statusFilter: string = 'All'
): Promise<{
  success: boolean;
  data?: OrderRecord[];
  count?: number;
  totalRevenue?: number;
  pendingCount?: number;
  error?: string;
}> {
  try {
    const query = statusFilter !== 'All' ? `?status=${encodeURIComponent(statusFilter)}` : '';
    const res = await fetch(`${API_BASE}/orders/admin/all${query}`, {
      method: 'GET',
      headers: getAuthHeaders(adminUser),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || 'Failed to retrieve admin orders' };
    }

    return {
      success: true,
      data: json.data || [],
      count: json.count,
      totalRevenue: json.totalRevenue,
      pendingCount: json.pendingCount,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error fetching admin orders' };
  }
}

/**
 * Admin: Update order status
 */
export async function updateOrderStatus(
  orderIdOrNumber: string,
  newStatus: OrderStatus,
  adminUser: UserProfile,
  paymentStatus?: string
): Promise<{ success: boolean; data?: OrderRecord; message?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/orders/admin/${encodeURIComponent(orderIdOrNumber)}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(adminUser),
      body: JSON.stringify({ status: newStatus, paymentStatus }),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || 'Failed to update order status' };
    }

    return {
      success: true,
      data: json.data,
      message: json.message || `Order status updated to ${newStatus}`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error updating order status' };
  }
}
