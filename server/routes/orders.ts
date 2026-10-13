import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order, IOrder, IOrderItem, OrderStatus } from '../models/Order.ts';

const router = Router();

// Master Menu Items for server-side authoritative pricing & availability
const MASTER_MENU: Record<
  string,
  { name: string; price: number; isAvailable: boolean; period: 'breakfast' | 'lunch' | 'dinner' }
> = {
  'meal-b1': {
    name: 'Steamed Idli & Medu Vada Combo',
    price: 45,
    isAvailable: true,
    period: 'breakfast',
  },
  'meal-b2': {
    name: 'Indori Kanda Poha with Sprouts',
    price: 40,
    isAvailable: true,
    period: 'breakfast',
  },
  'meal-b3': {
    name: 'Crispy Masala Dosa with Chutneys',
    price: 50,
    isAvailable: true,
    period: 'breakfast',
  },
  'meal-l1': {
    name: 'Paneer Butter Masala Thali with Phulkas',
    price: 75,
    isAvailable: true,
    period: 'lunch',
  },
  'meal-l2': {
    name: 'Shahi Vegetable Pulao with Tadka Dal & Raita',
    price: 65,
    isAvailable: true,
    period: 'lunch',
  },
  'meal-l3': {
    name: 'South Indian Comfort Curd Rice & Poriyal',
    price: 50,
    isAvailable: true,
    period: 'lunch',
  },
  'meal-d1': {
    name: 'Punjabi Chana Masala with Jeera Rice & Chapatis',
    price: 65,
    isAvailable: true,
    period: 'dinner',
  },
  'meal-d2': {
    name: 'Palak Paneer with Tawa Rotis & Moong Dal Khichdi',
    price: 75,
    isAvailable: true,
    period: 'dinner',
  },
};

// Memory fallback store for when MONGODB_URI is connecting or offline
interface MemoryOrderRecord {
  _id: string;
  orderNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  roomOrHostel: string;
  items: IOrderItem[];
  subtotal: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: OrderStatus;
  pickupInstructions: string;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
}

const memoryOrders: MemoryOrderRecord[] = [
  {
    _id: '670bf100f0123456789abc99',
    orderNumber: 'NC-ORD-SEED-1001',
    studentId: '2023-CS-104',
    studentName: 'Jaden Dsouza',
    studentEmail: 'jaden.dsouza@campus.edu',
    roomOrHostel: 'Aryabhatta Hall, Rm 312',
    items: [
      {
        menuItemId: 'meal-l1',
        name: 'Paneer Butter Masala Thali with Phulkas',
        quantity: 1,
        unitPrice: 75,
        lineTotal: 75,
        period: 'lunch',
      },
    ],
    subtotal: 75,
    totalAmount: 75,
    paymentMethod: 'Pay at Pickup',
    paymentStatus: 'Pending',
    orderStatus: 'Ready for Pickup',
    pickupInstructions: 'Collect at Counter 1 with order number NC-ORD-SEED-1001.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

function isMongoLive(): boolean {
  return mongoose.connection.readyState === 1;
}

function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Math.floor(Math.random() * 0xffffffffffff).toString(16).padStart(12, '0');
  const counter = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  return `${timestamp}${random}${counter}`.toLowerCase();
}

function getCallerIdentity(req: Request) {
  const role = (req.headers['x-user-role'] as string) || 'student';
  const email = ((req.headers['x-user-email'] as string) || '').toLowerCase().trim();
  const userId = (req.headers['x-user-id'] as string) || '';
  const userName = (req.headers['x-user-name'] as string) || 'Student';
  const studentId = (req.headers['x-student-id'] as string) || '';
  const isAdmin = role === 'admin';
  return { role, email, userId, userName, studentId, isAdmin };
}

function formatOrderResponse(doc: any) {
  const raw = doc.toObject ? doc.toObject() : doc;
  return {
    _id: String(raw._id),
    orderNumber: raw.orderNumber,
    studentId: raw.studentId,
    studentName: raw.studentName,
    studentEmail: raw.studentEmail,
    roomOrHostel: raw.roomOrHostel || '',
    items: raw.items || [],
    subtotal: raw.subtotal,
    totalAmount: raw.totalAmount,
    paymentMethod: raw.paymentMethod || 'Pay at Pickup',
    paymentStatus: raw.paymentStatus || 'Pending',
    orderStatus: raw.orderStatus || 'Placed',
    pickupInstructions: raw.pickupInstructions,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

// ==========================================
// 1. POST /api/orders — Place a New Food Order
// ==========================================
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const caller = getCallerIdentity(req);
  const { items, paymentMethod, roomOrHostel, idempotencyKey } = req.body;

  // 1. Verify caller identity
  if (!caller.email) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Student authentication required to place an order.',
      code: 'AUTH_REQUIRED',
    });
    return;
  }

  // 2. Validate items array
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({
      success: false,
      error: 'Invalid order: Cart cannot be empty. Please select at least one meal item.',
      code: 'EMPTY_CART',
    });
    return;
  }

  // 3. Idempotency Check (prevent duplicate orders on rapid double-clicks)
  if (idempotencyKey) {
    if (isMongoLive()) {
      const existing = await Order.findOne({ idempotencyKey });
      if (existing) {
        res.status(200).json({
          success: true,
          message: 'Order already processed (idempotent submission).',
          data: formatOrderResponse(existing),
          database: 'mongodb-atlas',
          isDuplicate: true,
        });
        return;
      }
    } else {
      const existingMem = memoryOrders.find((o) => o.idempotencyKey === idempotencyKey);
      if (existingMem) {
        res.status(200).json({
          success: true,
          message: 'Order already processed (idempotent submission).',
          data: formatOrderResponse(existingMem),
          database: 'memory-fallback',
          isDuplicate: true,
        });
        return;
      }
    }
  }

  // 4. Server-Side Price & Item Validation
  const validatedItems: IOrderItem[] = [];
  let calculatedSubtotal = 0;

  for (const item of items) {
    const menuItemId = item.menuItemId || item.id;
    const requestedQty = Number(item.quantity);

    if (!menuItemId || isNaN(requestedQty) || requestedQty <= 0) {
      res.status(400).json({
        success: false,
        error: `Invalid item format or non-positive quantity for item "${item.name || menuItemId}".`,
      });
      return;
    }

    if (requestedQty > 20) {
      res.status(400).json({
        success: false,
        error: `Quantity limit exceeded: Maximum 20 portions allowed per item in a single order.`,
      });
      return;
    }

    // Verify against authoritative Master Menu
    const masterItem = MASTER_MENU[menuItemId];
    if (!masterItem) {
      res.status(404).json({
        success: false,
        error: `Menu item "${item.name || menuItemId}" not found in current canteen offerings.`,
      });
      return;
    }

    if (!masterItem.isAvailable) {
      res.status(400).json({
        success: false,
        error: `Item "${masterItem.name}" is currently marked unavailable by canteen kitchen.`,
      });
      return;
    }

    // Authoritative pricing from server
    const lineTotal = masterItem.price * requestedQty;
    calculatedSubtotal += lineTotal;

    validatedItems.push({
      menuItemId,
      name: masterItem.name,
      quantity: requestedQty,
      unitPrice: masterItem.price,
      lineTotal,
      period: masterItem.period,
    });
  }

  const finalTotalAmount = calculatedSubtotal;
  const orderNumber = `NC-ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const pickupInstructions =
    'Collect order at Central Canteen Counter within 30 minutes of preparation. Present your Order Reference Number at checkout.';

  try {
    if (isMongoLive()) {
      const newOrderDoc = new Order({
        orderNumber,
        studentId: caller.studentId || caller.userId || 'STUDENT',
        studentName: caller.userName || caller.email.split('@')[0],
        studentEmail: caller.email,
        roomOrHostel: roomOrHostel || '',
        items: validatedItems,
        subtotal: calculatedSubtotal,
        totalAmount: finalTotalAmount,
        paymentMethod: paymentMethod || 'Pay at Pickup',
        paymentStatus: 'Pending',
        orderStatus: 'Placed',
        pickupInstructions,
        idempotencyKey,
      });

      const saved = await newOrderDoc.save();
      console.log(`✅ [MongoDB Atlas] New food order created: ${saved.orderNumber} for ${saved.studentEmail} (₹${saved.totalAmount})`);

      res.status(201).json({
        success: true,
        message: 'Order Placed Successfully! Recorded in MongoDB database "nutricampus".',
        data: formatOrderResponse(saved),
        database: 'mongodb-atlas',
      });
      return;
    }

    // Memory Store Fallback
    const now = new Date().toISOString();
    const memRecord: MemoryOrderRecord = {
      _id: generateObjectId(),
      orderNumber,
      studentId: caller.studentId || caller.userId || 'STUDENT',
      studentName: caller.userName || caller.email.split('@')[0],
      studentEmail: caller.email,
      roomOrHostel: roomOrHostel || '',
      items: validatedItems,
      subtotal: calculatedSubtotal,
      totalAmount: finalTotalAmount,
      paymentMethod: paymentMethod || 'Pay at Pickup',
      paymentStatus: 'Pending',
      orderStatus: 'Placed',
      pickupInstructions,
      idempotencyKey,
      createdAt: now,
      updatedAt: now,
    };

    memoryOrders.unshift(memRecord);

    res.status(201).json({
      success: true,
      message: 'Order Placed Successfully! (Stored in active memory database)',
      data: formatOrderResponse(memRecord),
      database: 'memory-fallback',
    });
  } catch (error: any) {
    console.error('Error placing order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record order in MongoDB database. Please retry.',
      details: error.message,
    });
  }
});

// ==========================================
// 2. GET /api/orders/my — Retrieve Authenticated Student's Orders
// ==========================================
router.get('/my', async (req: Request, res: Response): Promise<void> => {
  const caller = getCallerIdentity(req);

  if (!caller.email) {
    res.status(401).json({
      success: false,
      error: 'Authentication required to view student order history.',
    });
    return;
  }

  try {
    if (isMongoLive()) {
      const orders = await Order.find({
        $or: [
          { studentEmail: caller.email.toLowerCase() },
          { studentId: caller.studentId },
          { studentId: caller.userId },
        ],
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders.map(formatOrderResponse),
        database: 'mongodb-atlas',
      });
      return;
    }

    // Memory fallback
    const studentOrders = memoryOrders.filter(
      (o) =>
        o.studentEmail.toLowerCase() === caller.email.toLowerCase() ||
        o.studentId === caller.studentId ||
        o.studentId === caller.userId
    );

    res.status(200).json({
      success: true,
      count: studentOrders.length,
      data: studentOrders.map(formatOrderResponse),
      database: 'memory-fallback',
    });
  } catch (error: any) {
    console.error('Error fetching student orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve order history from database.',
      details: error.message,
    });
  }
});

// ==========================================
// 3. GET /api/orders/:id — Retrieve Specific Order by ID or Order Number
// ==========================================
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const identifier = req.params.id.trim();
  const caller = getCallerIdentity(req);

  try {
    let orderRecord: any = null;

    if (isMongoLive()) {
      if (mongoose.Types.ObjectId.isValid(identifier)) {
        orderRecord = await Order.findById(identifier);
      }
      if (!orderRecord) {
        orderRecord = await Order.findOne({ orderNumber: identifier });
      }
    } else {
      orderRecord = memoryOrders.find(
        (o) => o._id === identifier || o.orderNumber === identifier
      );
    }

    if (!orderRecord) {
      res.status(404).json({
        success: false,
        error: `Order "${identifier}" not found.`,
      });
      return;
    }

    const formatted = formatOrderResponse(orderRecord);

    // Authorization: Student can only view their own order; Admin can view all
    if (!caller.isAdmin && caller.email && caller.email !== formatted.studentEmail.toLowerCase()) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to view another student’s order.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error('Error retrieving order:', error);
    res.status(500).json({
      success: false,
      error: 'Database error retrieving order details.',
      details: error.message,
    });
  }
});

// ==========================================
// 4. GET /api/orders/:id/receipt — Retrieve Formal Receipt Data
// ==========================================
router.get('/:id/receipt', async (req: Request, res: Response): Promise<void> => {
  const identifier = req.params.id.trim();
  const caller = getCallerIdentity(req);

  try {
    let orderRecord: any = null;

    if (isMongoLive()) {
      if (mongoose.Types.ObjectId.isValid(identifier)) {
        orderRecord = await Order.findById(identifier);
      }
      if (!orderRecord) {
        orderRecord = await Order.findOne({ orderNumber: identifier });
      }
    } else {
      orderRecord = memoryOrders.find(
        (o) => o._id === identifier || o.orderNumber === identifier
      );
    }

    if (!orderRecord) {
      res.status(404).json({
        success: false,
        error: 'Receipt not found: Order does not exist.',
      });
      return;
    }

    const formatted = formatOrderResponse(orderRecord);

    // Authorization check
    if (!caller.isAdmin && caller.email && caller.email !== formatted.studentEmail.toLowerCase()) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You are not authorized to access this receipt.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      receipt: {
        receiptNumber: `REC-${formatted.orderNumber}`,
        orderNumber: formatted.orderNumber,
        canteenName: 'NutriCampus Central Canteen',
        canteenLocation: 'Ground Floor Dining Hall, Campus Center',
        student: {
          name: formatted.studentName,
          email: formatted.studentEmail,
          studentId: formatted.studentId,
          roomOrHostel: formatted.roomOrHostel,
        },
        items: formatted.items,
        subtotal: formatted.subtotal,
        tax: 0,
        totalAmount: formatted.totalAmount,
        paymentMethod: formatted.paymentMethod,
        paymentStatus: formatted.paymentStatus,
        orderStatus: formatted.orderStatus,
        placedAt: formatted.createdAt,
        pickupInstructions: formatted.pickupInstructions,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate digital receipt.',
      details: error.message,
    });
  }
});

// ==========================================
// 5. GET /api/admin/orders — Retrieve All Orders (Admin Portal Only)
// ==========================================
router.get('/admin/all', async (req: Request, res: Response): Promise<void> => {
  const caller = getCallerIdentity(req);

  if (!caller.isAdmin) {
    res.status(403).json({
      success: false,
      error: 'Forbidden: Access restricted to authorized canteen administrators.',
    });
    return;
  }

  const statusFilter = (req.query.status as string) || 'All';

  try {
    let query: any = {};
    if (statusFilter && statusFilter !== 'All') {
      if (statusFilter === 'Today') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        query.createdAt = { $gte: startOfDay };
      } else {
        query.orderStatus = statusFilter;
      }
    }

    if (isMongoLive()) {
      const orders = await Order.find(query).sort({ createdAt: -1 });

      const totalRevenue = orders
        .filter((o) => o.orderStatus !== 'Cancelled')
        .reduce((sum, o) => sum + o.totalAmount, 0);
      const pendingCount = orders.filter((o) => o.orderStatus === 'Placed').length;

      res.status(200).json({
        success: true,
        count: orders.length,
        totalRevenue,
        pendingCount,
        data: orders.map(formatOrderResponse),
        database: 'mongodb-atlas',
      });
      return;
    }

    // Memory fallback
    let filteredMem = memoryOrders;
    if (statusFilter && statusFilter !== 'All') {
      if (statusFilter === 'Today') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        filteredMem = memoryOrders.filter((o) => new Date(o.createdAt) >= startOfDay);
      } else {
        filteredMem = memoryOrders.filter((o) => o.orderStatus === statusFilter);
      }
    }

    const totalRevenue = filteredMem
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingCount = filteredMem.filter((o) => o.orderStatus === 'Placed').length;

    res.status(200).json({
      success: true,
      count: filteredMem.length,
      totalRevenue,
      pendingCount,
      data: filteredMem.map(formatOrderResponse),
      database: 'memory-fallback',
    });
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({
      success: false,
      error: 'Database error fetching canteen orders.',
      details: error.message,
    });
  }
});

// ==========================================
// 6. PATCH /api/admin/orders/:id/status — Update Order Status (Admin Only)
// ==========================================
router.patch('/admin/:id/status', async (req: Request, res: Response): Promise<void> => {
  const identifier = req.params.id.trim();
  const caller = getCallerIdentity(req);
  const { status, paymentStatus } = req.body;

  if (!caller.isAdmin) {
    res.status(403).json({
      success: false,
      error: 'Forbidden: Administrator privileges required to change order status.',
    });
    return;
  }

  const validStatuses: OrderStatus[] = [
    'Placed',
    'Preparing',
    'Ready for Pickup',
    'Completed',
    'Cancelled',
  ];
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({
      success: false,
      error: `Invalid status "${status}". Allowed values: ${validStatuses.join(', ')}`,
    });
    return;
  }

  try {
    const updatePayload: Record<string, any> = { orderStatus: status };
    if (paymentStatus) {
      updatePayload.paymentStatus = paymentStatus;
    } else if (status === 'Completed') {
      updatePayload.paymentStatus = 'Paid';
    }

    if (isMongoLive()) {
      let query: any = {};
      if (mongoose.Types.ObjectId.isValid(identifier)) {
        query._id = identifier;
      } else {
        query.orderNumber = identifier;
      }

      const updated = await Order.findOneAndUpdate(query, updatePayload, { new: true });
      if (!updated) {
        res.status(404).json({
          success: false,
          error: `Order "${identifier}" not found to update.`,
        });
        return;
      }

      console.log(`✅ [MongoDB Atlas] Order ${updated.orderNumber} status updated to "${status}"`);

      res.status(200).json({
        success: true,
        message: `Order ${updated.orderNumber} status updated to "${status}".`,
        data: formatOrderResponse(updated),
        database: 'mongodb-atlas',
      });
      return;
    }

    // Memory fallback update
    const memOrder = memoryOrders.find(
      (o) => o._id === identifier || o.orderNumber === identifier
    );
    if (!memOrder) {
      res.status(404).json({
        success: false,
        error: `Order "${identifier}" not found to update.`,
      });
      return;
    }

    memOrder.orderStatus = status;
    if (updatePayload.paymentStatus) {
      memOrder.paymentStatus = updatePayload.paymentStatus;
    }
    memOrder.updatedAt = new Date().toISOString();

    res.status(200).json({
      success: true,
      message: `Order ${memOrder.orderNumber} status updated to "${status}".`,
      data: formatOrderResponse(memOrder),
      database: 'memory-fallback',
    });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status in MongoDB.',
      details: error.message,
    });
  }
});

export default router;
