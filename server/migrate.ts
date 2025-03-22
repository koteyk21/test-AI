import { db, client } from './db';
import * as schema from '@shared/schema';

async function migrate() {
  console.log('Starting database migration...');

  try {
    // Create users table
    await client`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        bio TEXT DEFAULT '',
        profile_picture TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `;
    console.log('Users table created or already exists');

    // Create posts table
    await client`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        media_url TEXT,
        likes INTEGER DEFAULT 0 NOT NULL,
        comments INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `;
    console.log('Posts table created or already exists');

    // Create follows table
    await client`
      CREATE TABLE IF NOT EXISTS follows (
        id SERIAL PRIMARY KEY,
        follower_id INTEGER NOT NULL REFERENCES users(id),
        following_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `;
    console.log('Follows table created or already exists');

    // Create messages table
    await client`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id),
        receiver_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `;
    console.log('Messages table created or already exists');

    // Create notifications table
    await client`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        actor_id INTEGER NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        entity_id INTEGER,
        read BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `;
    console.log('Notifications table created or already exists');

    console.log('Database migration completed successfully!');
    return true;
  } catch (error) {
    console.error('Database migration failed:', error);
    return false;
  }
}

export { migrate };