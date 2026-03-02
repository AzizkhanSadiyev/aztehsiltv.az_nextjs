/**
 * Database Migration Script
 * Runs all pending SQL migrations in order
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

// ESM-safe __dirname / __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envFile = process.env.ENV_FILE || '.env';
const envPath = path.isAbsolute(envFile)
  ? envFile
  : path.join(__dirname, '..', envFile);
dotenv.config({ path: envPath });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'strafig_web',
  multipleStatements: true,
  charset: 'utf8mb4',
};

interface Migration {
  filename: string;
  content: string;
}

/**
 * Get all migration files from the migrations directory
 */
async function getMigrationFiles(): Promise<Migration[]> {
  const migrationsDir = path.join(__dirname, '../migrations');
  const files = await fs.readdir(migrationsDir);
  
  // Filter and sort migration files
  const migrationFiles = files
    .filter(file => file.endsWith('.sql'))
    .sort(); // Lexicographic sort works for our naming convention (001_, 002_, etc.)
  
  // Read content of each migration file
  const migrations: Migration[] = [];
  for (const filename of migrationFiles) {
    const content = await fs.readFile(
      path.join(migrationsDir, filename),
      'utf-8'
    );
    migrations.push({ filename, content });
  }
  
  return migrations;
}

/**
 * Get list of already executed migrations
 */
async function getExecutedMigrations(
  connection: mysql.Connection
): Promise<string[]> {
  try {
    const [rows] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT migration FROM migrations ORDER BY id'
    );
    return rows.map(row => row.migration);
  } catch (error) {
    // If migrations table doesn't exist, return empty array
    return [];
  }
}

/**
 * Run a single migration
 */
async function runMigration(
  connection: mysql.Connection,
  migration: Migration
): Promise<void> {
  console.log(`Running migration: ${migration.filename}`);
  
  try {
    // Execute the migration SQL
    await connection.query(migration.content);
    console.log(`✓ Migration ${migration.filename} completed successfully`);
  } catch (error) {
    console.error(`✗ Migration ${migration.filename} failed:`, error);
    throw error;
  }
}

/**
 * Main migration function
 */
async function migrate(): Promise<void> {
  let connection: mysql.Connection | null = null;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connected to database');
    
    // Get all migration files
    const migrations = await getMigrationFiles();
    console.log(`Found ${migrations.length} migration files`);
    
    // Get already executed migrations
    const executedMigrations = await getExecutedMigrations(connection);
    console.log(`${executedMigrations.length} migrations already executed`);
    
    // Filter pending migrations
    const pendingMigrations = migrations.filter(
      migration => !executedMigrations.includes(migration.filename)
    );
    
    if (pendingMigrations.length === 0) {
      console.log('✓ No pending migrations. Database is up to date.');
      return;
    }
    
    console.log(`\nRunning ${pendingMigrations.length} pending migrations...\n`);
    
    // Run each pending migration
    for (const migration of pendingMigrations) {
      await runMigration(connection, migration);
    }
    
    console.log('\n✓ All migrations completed successfully!');
  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run migrations if this script is executed directly
const isDirectRun = (() => {
  try {
    const invoked = pathToFileURL(process.argv[1]).href;
    return import.meta.url === invoked;
  } catch {
    return false;
  }
})();

if (isDirectRun) {
  migrate()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}

export default migrate;
