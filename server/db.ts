import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Create a postgres client
const connectionString = process.env.DATABASE_URL || '';
export const client = postgres(connectionString);
export const db = drizzle(client, { schema });

export async function initializeDb() {
  try {
    console.log('Initializing database connection...');
    
    // Test the connection
    const result = await client`SELECT 1 as test`;
    console.log('Database connection established.');
    
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}