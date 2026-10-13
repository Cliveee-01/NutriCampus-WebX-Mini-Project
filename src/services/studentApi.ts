import { UserProfile } from '../types';

export interface StudentMongoProfile {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  roomOrHostel: string;
  dietaryPreferences: string[];
  dietaryPreferencesObj: {
    vegan: boolean;
    glutenFree: boolean;
    highProtein: boolean;
  };
  allergies: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseStatus {
  status: string;
  connected: boolean;
  databaseName: string;
  host: string;
  mode: 'mongodb-atlas' | 'memory-fallback';
  error?: string | null;
}

const API_BASE = '/api';

/**
 * Build authentication and authorization headers
 */
function getAuthHeaders(user: UserProfile): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-user-role': user.role,
    'x-user-email': user.email.toLowerCase(),
    'x-user-id': user.id,
  };
}

/**
 * Fetch a student's profile from MongoDB Atlas via Express API
 */
export async function getStudentProfile(
  identifier: string,
  user: UserProfile
): Promise<{ success: boolean; data?: StudentMongoProfile; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(identifier)}`, {
      method: 'GET',
      headers: getAuthHeaders(user),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || `HTTP ${res.status} error` };
    }

    return { success: true, data: json.data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error connecting to Express backend.',
    };
  }
}

/**
 * Update an existing student's profile in MongoDB Atlas
 */
export async function updateStudentProfile(
  identifier: string,
  payload: {
    name?: string;
    studentId?: string;
    roomOrHostel?: string;
    dietaryPreferences?: string[] | { vegan: boolean; glutenFree: boolean; highProtein: boolean };
    allergies?: string[];
  },
  user: UserProfile
): Promise<{ success: boolean; data?: StudentMongoProfile; message?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(identifier)}`, {
      method: 'PUT',
      headers: getAuthHeaders(user),
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: json.error || `Failed to update profile (HTTP ${res.status})`,
      };
    }

    return {
      success: true,
      data: json.data,
      message: json.message || 'Profile saved successfully to MongoDB database "nutricampus".',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error connecting to Express backend.',
    };
  }
}

/**
 * Register/Create a new student profile in MongoDB Atlas
 */
export async function createStudentProfile(
  payload: {
    name: string;
    email: string;
    studentId?: string;
    roomOrHostel?: string;
    dietaryPreferences?: string[] | { vegan: boolean; glutenFree: boolean; highProtein: boolean };
    allergies?: string[];
  },
  user: UserProfile
): Promise<{ success: boolean; data?: StudentMongoProfile; message?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: getAuthHeaders(user),
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: json.error || `Failed to create profile (HTTP ${res.status})`,
      };
    }

    return {
      success: true,
      data: json.data,
      message: json.message || 'Profile created successfully in MongoDB database "nutricampus".',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error connecting to Express backend.',
    };
  }
}

/**
 * Retrieve all student records (Admin authorization required)
 */
export async function getAllStudents(
  adminUser: UserProfile
): Promise<{ success: boolean; data?: StudentMongoProfile[]; count?: number; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'GET',
      headers: getAuthHeaders(adminUser),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: json.error || `Access forbidden: Administrator privileges required (HTTP ${res.status})`,
      };
    }

    return {
      success: true,
      data: json.data,
      count: json.count,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error connecting to Express backend.',
    };
  }
}

/**
 * Fetch database connectivity status
 */
export async function getDatabaseStatus(): Promise<DatabaseStatus | null> {
  try {
    const res = await fetch(`${API_BASE}/db-status`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
