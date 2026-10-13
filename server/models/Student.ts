import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  email: string;
  studentId?: string;
  roomOrHostel?: string;
  dietaryPreferences: string[];
  allergies: string[];
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema<IStudent>(
  {
    name: {
      type: String,
      required: [true, 'Student full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Student email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    studentId: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    roomOrHostel: {
      type: String,
      trim: true,
      default: '',
    },
    dietaryPreferences: {
      type: [String],
      default: [],
      validate: {
        validator: function (val: string[]) {
          const allowed = ['Vegan', 'Gluten-Free', 'High Protein', 'Vegetarian', 'Contains Dairy'];
          return val.every((item) => allowed.includes(item));
        },
        message: 'Invalid dietary preference provided',
      },
    },
    allergies: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'students', // Ensure the collection name is strictly 'students'
    toJSON: {
      virtuals: true,
      transform: (_, ret: Record<string, any>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Prevent model recompilation error in development
export const Student =
  (mongoose.models.Student as mongoose.Model<IStudent>) ||
  mongoose.model<IStudent>('Student', StudentSchema);
