import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import * as schema from '../src/lib/db/schema';
import { readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const connectionString = process.env.DATABASE_URL || 
  `mysql://${process.env.DB_USER || 'root'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${process.env.DB_NAME || 'valentina_geusa'}`;

async function runMigrations() {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection(connectionString);
    const db = drizzle(connection, { schema, mode: 'default' });

    // Check if migrations folder exists
    const migrationsFolder = './drizzle';
    if (!existsSync(migrationsFolder)) {
      console.log('No migrations folder found. Skipping migrations.');
      console.log('Run "npm run db:generate" first to generate migrations.');
      await connection.end();
      process.exit(0);
    }

    // Check if there are any migration files
    try {
      const files = await readdir(migrationsFolder);
      if (files.length === 0) {
        console.log('No migration files found. Skipping migrations.');
        await connection.end();
        process.exit(0);
      }
    } catch (error) {
      console.log('Migrations folder is empty or inaccessible. Skipping migrations.');
      await connection.end();
      process.exit(0);
    }

    console.log('Running migrations...');
    await migrate(db, { migrationsFolder });
    
    console.log('Migrations completed successfully!');
    await connection.end();
    process.exit(0);
  } catch (error: any) {
    console.error('Migration error:', error);
    // Don't fail the build if migrations fail - log and continue
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      console.log('Migration already applied, continuing...');
      process.exit(0);
    }
    process.exit(1);
  }
}

runMigrations();

