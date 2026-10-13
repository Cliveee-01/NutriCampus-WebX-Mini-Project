import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  period?: 'breakfast' | 'lunch' | 'dinner';
}

export type OrderStatus = 'Placed' | 'Preparing' | 'Ready for Pickup' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded';

export interface IOrder extends Document {
  orderNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  roomOrHostel?: string;
  items: IOrderItem[];
  subtotal: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  pickupInstructions: string;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema: Schema = new Schema(
  {
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
    period: { type: String, enum: ['breakfast', 'lunch', 'dinner'], default: 'lunch' },
  },
  { _id: false }
);

const OrderSchema: Schema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    studentId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    studentEmail: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    roomOrHostel: {
      type: String,
      default: '',
      trim: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => Array.isArray(items) && items.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      default: 'Pay at Pickup',
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: ['Placed', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'],
      default: 'Placed',
      index: true,
    },
    pickupInstructions: {
      type: String,
      default: 'Collect at Central Canteen Counter with your order reference number.',
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'orders', // Stored in MongoDB collection "orders"
    toJSON: {
      virtuals: true,
      transform: (_, ret: Record<string, any>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Prevent recompilation in development HMR
export const Order =
  (mongoose.models.Order as mongoose.Model<IOrder>) ||
  mongoose.model<IOrder>('Order', OrderSchema);
