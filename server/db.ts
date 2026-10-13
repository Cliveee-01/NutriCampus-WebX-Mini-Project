import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env
dotenv.config();

let isConnected = false;
let connectionError: string | null = null;

export interface DBStatus {
  connected: boolean;
  databaseName: string;
  host: string;
  mode: 'mongodb-atlas' | 'memory-fallback';
  error?: string | null;
}

function cleanUri(raw?: string | null): string | null {
  if (!raw) return null;
  let uri = raw.trim();
  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1).trim();
  }
  if (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://')) {
    return uri;
  }
  return null;
}

/**
 * Clean and resolve MONGODB_URI safely from process.env, .env, or .env.example
 */
function getSanitizedMongoUri(): string | null {
  // 1. Try process.env if it has a valid mongodb:// or mongodb+srv:// scheme
  const fromEnv = cleanUri(process.env.MONGODB_URI);
  if (fromEnv) return fromEnv;

  // 2. Check .env and .env.example files
  const candidateFiles = ['.env', '.env.example'];
  for (const file of candidateFiles) {
    try {
      const filePath = path.resolve(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const match = content.match(/^MONGODB_URI\s*=\s*(.*)$/m);
        if (match && match[1]) {
          const fromFile = cleanUri(match[1]);
          if (fromFile) return fromFile;
        }
      }
    } catch {
      // Continue checking
    }
  }

  // 3. If process.env.MONGODB_URI exists but had an invalid scheme, report detailed error
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim()) {
    connectionError = `Invalid scheme: expected connection string to start with "mongodb://" or "mongodb+srv://", received: "${process.env.MONGODB_URI.trim().slice(0, 15)}..."`;
    console.error(`❌ [NutriCampus MongoDB] ${connectionError}`);
  } else {
    connectionError = 'MONGODB_URI environment variable not configured.';
  }

  return null;
}

export async function connectToDatabase(): Promise<boolean> {
  const uri = getSanitizedMongoUri();

  if (!uri) {
    console.warn(
      '⚠️ [NutriCampus MongoDB] Valid MONGODB_URI not found. Running in standalone fallback mode.'
    );
    if (!connectionError) {
      connectionError = 'MONGODB_URI environment variable not configured.';
    }
    return false;
  }

  try {
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      connectionError = null;
      return true;
    }

    console.log('🔄 [NutriCampus MongoDB] Connecting to MongoDB Atlas...');

    await mongoose.connect(uri, {
      dbName: 'nutricampus',
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    connectionError = null;
    console.log(
      `✅ [NutriCampus MongoDB] Successfully connected to database "nutricampus" on host ${mongoose.connection.host}`
    );
    return true;
  } catch (err: any) {
    isConnected = false;
    connectionError = err.message || 'Failed to connect to MongoDB Atlas';
    console.error(`❌ [NutriCampus MongoDB] Connection error: ${connectionError}`);
    return false;
  }
}

export function getDBStatus(): DBStatus {
  const readyState = mongoose.connection.readyState;
  const connected = readyState === 1;
  const uri = getSanitizedMongoUri();

  let host = 'localhost';
  if (connected) {
    host = mongoose.connection.host;
  } else if (uri) {
    try {
      const parsed = new URL(
        uri.replace('mongodb+srv://', 'http://').replace('mongodb://', 'http://')
      );
      host = parsed.host;
    } catch {
      host = 'webx.yi45ec8.mongodb.net';
    }
  }

  return {
    connected,
    databaseName: 'nutricampus',
    host,
    mode: connected ? 'mongodb-atlas' : 'memory-fallback',
    error: connectionError,
  };
}
