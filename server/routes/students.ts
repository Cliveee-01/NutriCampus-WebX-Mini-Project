import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Student, IStudent } from '../models/Student';
import { getDBStatus } from '../db';

const router = Router();

// Fallback in-memory store for when MONGODB_URI is not provided or Atlas is temporarily unreachable
interface MemoryStudentRecord {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  roomOrHostel: string;
  dietaryPreferences: string[];
  allergies: string[];
  createdAt: string;
  updatedAt: string;
}

// Initial seed students for realistic multi-student support
const memoryStudents: MemoryStudentRecord[] = [
  {
    _id: '670ae001f0123456789abc01',
    name: 'Jaden Dsouza',
    email: 'jaden.dsouza@campus.edu',
    studentId: '2023-CS-104',
    roomOrHostel: 'Aryabhatta Hall, Rm 312',
    dietaryPreferences: ['High Protein'],
    allergies: ['Peanuts'],
    createdAt: '2026-10-10T08:00:00.000Z',
    updatedAt: '2026-10-12T10:00:00.000Z',
  },
  {
    _id: '670ae001f0123456789abc02',
    name: 'Leon Dsouza',
    email: 'leon.dsouza06@campus.edu',
    studentId: '2023-EC-048',
    roomOrHostel: 'Gargi Hostel, Rm 108',
    dietaryPreferences: ['Vegan', 'Gluten-Free'],
    allergies: [],
    createdAt: '2026-10-10T09:30:00.000Z',
    updatedAt: '2026-10-12T11:15:00.000Z',
  },
  {
    _id: '670ae001f0123456789abc03',
    name: 'Clive Fernandes',
    email: 'clive.fernandes@campus.edu',
    studentId: '2022-ME-219',
    roomOrHostel: 'Bhabha Hall, Rm 420',
    dietaryPreferences: ['Gluten-Free', 'High Protein'],
    allergies: ['Lactose Intolerant (Mild)'],
    createdAt: '2026-10-11T14:20:00.000Z',
    updatedAt: '2026-10-12T09:45:00.000Z',
  },
];

// Helper to normalize dietary preferences input (handles either array or boolean object)
function normalizeDietaryPreferences(input: any): string[] {
  if (Array.isArray(input)) {
    return input.map((s) => String(s).trim()).filter(Boolean);
  }
  if (input && typeof input === 'object') {
    const list: string[] = [];
    if (input.vegan) list.push('Vegan');
    if (input.glutenFree) list.push('Gluten-Free');
    if (input.highProtein) list.push('High Protein');
    if (input.jainFriendly) list.push('Vegetarian');
    return list;
  }
  return [];
}

// Helper to check if Mongoose is connected to MongoDB Atlas
function isMongoLive(): boolean {
  return mongoose.connection.readyState === 1;
}

// Generate MongoDB-like 24-character hexadecimal ObjectId
function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Math.floor(Math.random() * 0xffffffffffff).toString(16).padStart(12, '0');
  const counter = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  return `${timestamp}${random}${counter}`.toLowerCase();
}

// Auth Helper: extract caller identity from request headers
function getCallerIdentity(req: Request) {
  const role = (req.headers['x-user-role'] as string) || 'student';
  const email = ((req.headers['x-user-email'] as string) || '').toLowerCase().trim();
  const userId = (req.headers['x-user-id'] as string) || '';
  const isAdmin = role === 'admin';
  return { role, email, userId, isAdmin };
}

// Format Student Document to response format
function formatStudentResponse(doc: any) {
  const raw = doc.toObject ? doc.toObject() : doc;
  const dietaryList = Array.isArray(raw.dietaryPreferences) ? raw.dietaryPreferences : [];
  
  return {
    _id: String(raw._id),
    name: raw.name,
    email: raw.email,
    studentId: raw.studentId || '',
    roomOrHostel: raw.roomOrHostel || '',
    dietaryPreferences: dietaryList,
    dietaryPreferencesObj: {
      vegan: dietaryList.includes('Vegan'),
      glutenFree: dietaryList.includes('Gluten-Free'),
      highProtein: dietaryList.includes('High Protein'),
    },
    allergies: Array.isArray(raw.allergies) ? raw.allergies : [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

// ==========================================
// 1. GET /api/students — Retrieve all students (Admin Only)
// ==========================================
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const caller = getCallerIdentity(req);

  // Security: Restrict the complete student list to authorized administrators
  if (!caller.isAdmin) {
    res.status(403).json({
      success: false,
      error: 'Forbidden: Access restricted to authorized canteen administrators.',
      code: 'AUTH_FORBIDDEN',
    });
    return;
  }

  try {
    if (isMongoLive()) {
      const students = await Student.find().sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        count: students.length,
        data: students.map(formatStudentResponse),
        database: 'mongodb-atlas',
      });
      return;
    }

    // Memory fallback
    res.status(200).json({
      success: true,
      count: memoryStudents.length,
      data: memoryStudents.map(formatStudentResponse),
      database: 'memory-fallback',
      notice: 'Operating in memory store (configure MONGODB_URI in .env for live Atlas connection)',
    });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve student records from database.',
      details: error.message,
    });
  }
});

// ==========================================
// 2. GET /api/students/:id — Retrieve specific student
// ==========================================
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const identifier = req.params.id.trim();
  const caller = getCallerIdentity(req);

  try {
    let studentRecord: any = null;

    if (isMongoLive()) {
      // Look up by _id if valid ObjectId, else by normalized email or studentId
      if (mongoose.Types.ObjectId.isValid(identifier)) {
        studentRecord = await Student.findById(identifier);
      }
      if (!studentRecord) {
        studentRecord = await Student.findOne({
          $or: [
            { email: identifier.toLowerCase() },
            { studentId: identifier },
          ],
        });
      }
    } else {
      // Memory fallback lookup
      studentRecord = memoryStudents.find(
        (s) =>
          s._id === identifier ||
          s.email.toLowerCase() === identifier.toLowerCase() ||
          (s.studentId && s.studentId.toLowerCase() === identifier.toLowerCase())
      );
    }

    if (!studentRecord) {
      res.status(404).json({
        success: false,
        error: `Student profile not found for identifier "${identifier}".`,
        code: 'NOT_FOUND',
      });
      return;
    }

    const formatted = formatStudentResponse(studentRecord);

    // Security check: Only allow students to view their own records, or admin
    if (!caller.isAdmin && caller.email && caller.email !== formatted.email.toLowerCase()) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You are not authorized to view another student’s profile.',
        code: 'AUTH_FORBIDDEN',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error('Error retrieving student profile:', error);
    res.status(500).json({
      success: false,
      error: 'Database error occurred while retrieving student profile.',
      details: error.message,
    });
  }
});

// ==========================================
// 3. POST /api/students — Create a student profile
// ==========================================
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { name, email, studentId, roomOrHostel, dietaryPreferences, allergies } = req.body;

  // Validation
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    res.status(400).json({
      success: false,
      error: 'Invalid input: Full name is required and must be at least 2 characters long.',
      field: 'name',
    });
    return;
  }

  if (!email || typeof email !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Invalid input: Student email address is required.',
      field: 'email',
    });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(normalizedEmail)) {
    res.status(400).json({
      success: false,
      error: 'Invalid input: Please enter a valid email address format (e.g. name@campus.edu).',
      field: 'email',
    });
    return;
  }

  const normalizedDietary = normalizeDietaryPreferences(dietaryPreferences);
  const normalizedAllergies = Array.isArray(allergies)
    ? allergies.map((s) => String(s).trim()).filter(Boolean)
    : [];

  try {
    if (isMongoLive()) {
      // Check for duplicate email
      const existing = await Student.findOne({ email: normalizedEmail });
      if (existing) {
        res.status(409).json({
          success: false,
          error: `A student profile with email "${normalizedEmail}" already exists. Please update the existing profile instead.`,
          code: 'DUPLICATE_EMAIL',
          existingId: existing._id,
        });
        return;
      }

      // Create in MongoDB Atlas
      const newStudent = new Student({
        name: name.trim(),
        email: normalizedEmail,
        studentId: studentId ? String(studentId).trim() : '',
        roomOrHostel: roomOrHostel ? String(roomOrHostel).trim() : '',
        dietaryPreferences: normalizedDietary,
        allergies: normalizedAllergies,
      });

      const saved = await newStudent.save();
      console.log(`✅ [MongoDB Atlas] Created student ${saved.name} (${saved.email}) with _id: ${saved._id}`);

      res.status(201).json({
        success: true,
        message: 'Student profile created successfully in MongoDB database "nutricampus".',
        data: formatStudentResponse(saved),
        database: 'mongodb-atlas',
      });
      return;
    }

    // Memory Fallback
    const existingMemory = memoryStudents.find((s) => s.email.toLowerCase() === normalizedEmail);
    if (existingMemory) {
      res.status(409).json({
        success: false,
        error: `A student profile with email "${normalizedEmail}" already exists.`,
        code: 'DUPLICATE_EMAIL',
        existingId: existingMemory._id,
      });
      return;
    }

    const now = new Date().toISOString();
    const newRecord: MemoryStudentRecord = {
      _id: generateObjectId(),
      name: name.trim(),
      email: normalizedEmail,
      studentId: studentId ? String(studentId).trim() : '',
      roomOrHostel: roomOrHostel ? String(roomOrHostel).trim() : '',
      dietaryPreferences: normalizedDietary,
      allergies: normalizedAllergies,
      createdAt: now,
      updatedAt: now,
    };

    memoryStudents.unshift(newRecord);

    res.status(201).json({
      success: true,
      message: 'Student profile created successfully.',
      data: formatStudentResponse(newRecord),
      database: 'memory-fallback',
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        error: `A student profile with email "${normalizedEmail}" already exists in MongoDB.`,
        code: 'DUPLICATE_EMAIL',
      });
      return;
    }

    console.error('Error creating student profile:', error);
    res.status(500).json({
      success: false,
      error: 'Database error occurred while creating student profile.',
      details: error.message,
    });
  }
});

// ==========================================
// 4. PUT /api/students/:id — Update existing profile
// ==========================================
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const identifier = req.params.id.trim();
  const caller = getCallerIdentity(req);
  const { name, dietaryPreferences, allergies, roomOrHostel, studentId } = req.body;

  try {
    let studentRecord: any = null;

    if (isMongoLive()) {
      if (mongoose.Types.ObjectId.isValid(identifier)) {
        studentRecord = await Student.findById(identifier);
      }
      if (!studentRecord) {
        studentRecord = await Student.findOne({
          $or: [
            { email: identifier.toLowerCase() },
            { studentId: identifier },
          ],
        });
      }
    } else {
      studentRecord = memoryStudents.find(
        (s) =>
          s._id === identifier ||
          s.email.toLowerCase() === identifier.toLowerCase() ||
          (s.studentId && s.studentId.toLowerCase() === identifier.toLowerCase())
      );
    }

    if (!studentRecord) {
      res.status(404).json({
        success: false,
        error: `Cannot update: Student profile not found for "${identifier}".`,
        code: 'NOT_FOUND',
      });
      return;
    }

    // Security check: Student can only edit their own profile; Admin can edit any
    const recordEmail = (studentRecord.email || '').toLowerCase();
    if (!caller.isAdmin && caller.email && caller.email !== recordEmail) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You are not authorized to update another student’s profile.',
        code: 'AUTH_FORBIDDEN',
      });
      return;
    }

    // Prepare updates
    const updates: Record<string, any> = {};
    if (name && typeof name === 'string' && name.trim().length >= 2) {
      updates.name = name.trim();
    }
    if (roomOrHostel !== undefined) {
      updates.roomOrHostel = String(roomOrHostel).trim();
    }
    if (studentId !== undefined) {
      updates.studentId = String(studentId).trim();
    }
    if (dietaryPreferences !== undefined) {
      updates.dietaryPreferences = normalizeDietaryPreferences(dietaryPreferences);
    }
    if (allergies !== undefined) {
      updates.allergies = Array.isArray(allergies)
        ? allergies.map((s) => String(s).trim()).filter(Boolean)
        : [];
    }

    if (isMongoLive()) {
      const updated = await Student.findByIdAndUpdate(studentRecord._id, updates, {
        new: true,
        runValidators: true,
      });

      console.log(`✅ [MongoDB Atlas] Updated student profile: ${updated?.email}`);

      res.status(200).json({
        success: true,
        message: 'Student profile updated successfully in MongoDB database "nutricampus".',
        data: formatStudentResponse(updated),
        database: 'mongodb-atlas',
      });
      return;
    }

    // Memory store update
    Object.assign(studentRecord, updates, {
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully.',
      data: formatStudentResponse(studentRecord),
      database: 'memory-fallback',
    });
  } catch (error: any) {
    console.error('Error updating student profile:', error);
    res.status(500).json({
      success: false,
      error: 'Database error occurred while updating student profile.',
      details: error.message,
    });
  }
});

// ==========================================
// 5. DELETE /api/students/:id — Delete profile
// ==========================================
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const identifier = req.params.id.trim();
  const caller = getCallerIdentity(req);

  try {
    if (isMongoLive()) {
      let query: any = {};
      if (mongoose.Types.ObjectId.isValid(identifier)) {
        query._id = identifier;
      } else {
        query = { $or: [{ email: identifier.toLowerCase() }, { studentId: identifier }] };
      }

      const existing = await Student.findOne(query);
      if (!existing) {
        res.status(404).json({
          success: false,
          error: 'Student profile not found to delete.',
        });
        return;
      }

      // Security check
      if (!caller.isAdmin && caller.email && caller.email !== existing.email.toLowerCase()) {
        res.status(403).json({
          success: false,
          error: 'Forbidden: You do not have permission to delete this profile.',
        });
        return;
      }

      await Student.deleteOne({ _id: existing._id });
      res.status(200).json({
        success: true,
        message: `Student profile ${existing.email} was successfully deleted from MongoDB.`,
      });
      return;
    }

    // Memory fallback delete
    const index = memoryStudents.findIndex(
      (s) =>
        s._id === identifier ||
        s.email.toLowerCase() === identifier.toLowerCase() ||
        (s.studentId && s.studentId.toLowerCase() === identifier.toLowerCase())
    );

    if (index === -1) {
      res.status(404).json({
        success: false,
        error: 'Student profile not found to delete.',
      });
      return;
    }

    const removed = memoryStudents.splice(index, 1)[0];
    res.status(200).json({
      success: true,
      message: `Student profile ${removed.email} deleted successfully.`,
    });
  } catch (error: any) {
    console.error('Error deleting student profile:', error);
    res.status(500).json({
      success: false,
      error: 'Database error occurred while deleting student profile.',
      details: error.message,
    });
  }
});

export default router;
