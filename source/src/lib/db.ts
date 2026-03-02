/**
 * Database Configuration and Connection Pool
 * Provides MySQL connection pool and query helper functions
 */

import mysql from 'mysql2/promise';

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'strafig_web',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
};

// Create connection pool
let pool: mysql.Pool | null = null;

/**
 * Get database connection pool
 */
export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

/**
 * Execute a query with parameters
 */
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const connection = await getPool().getConnection();
  try {
    const [rows] = await connection.query(sql, params);
    return rows as T[];
  } finally {
    connection.release();
  }
}

/**
 * Execute a query and return the first row
 */
export async function queryOne<T = any>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute an insert query and return the inserted ID
 */
export async function insert(
  sql: string,
  params?: any[]
): Promise<string | number> {
  const connection = await getPool().getConnection();
  try {
    const [result] = await connection.query(sql, params);
    return (result as any).insertId;
  } finally {
    connection.release();
  }
}

/**
 * Execute an update query and return the number of affected rows
 */
export async function update(
  sql: string,
  params?: any[]
): Promise<number> {
  const connection = await getPool().getConnection();
  try {
    const [result] = await connection.query(sql, params);
    return (result as any).affectedRows;
  } finally {
    connection.release();
  }
}

/**
 * Execute a delete query and return the number of affected rows
 */
export async function remove(
  sql: string,
  params?: any[]
): Promise<number> {
  return update(sql, params);
}

/**
 * Begin a transaction
 */
export async function beginTransaction(): Promise<mysql.PoolConnection> {
  const connection = await getPool().getConnection();
  await connection.beginTransaction();
  return connection;
}

/**
 * Commit a transaction
 */
export async function commit(connection: mysql.PoolConnection): Promise<void> {
  try {
    await connection.commit();
  } finally {
    connection.release();
  }
}

/**
 * Rollback a transaction
 */
export async function rollback(connection: mysql.PoolConnection): Promise<void> {
  try {
    await connection.rollback();
  } finally {
    connection.release();
  }
}

/**
 * Execute multiple queries in a transaction
 */
export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await beginTransaction();
  try {
    const result = await callback(connection);
    await commit(connection);
    return result;
  } catch (error) {
    await rollback(connection);
    throw error;
  }
}

/**
 * Check database connection
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const connection = await getPool().getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

/**
 * Close all connections in the pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Escape identifier (table name, column name)
 */
export function escapeId(identifier: string): string {
  return mysql.escapeId(identifier);
}

/**
 * Escape value for SQL query
 */
export function escape(value: any): string {
  return mysql.escape(value);
}

// Export pool instance for direct access if needed
export { pool };

// Default export
export default {
  getPool,
  query,
  queryOne,
  insert,
  update,
  remove,
  beginTransaction,
  commit,
  rollback,
  transaction,
  checkConnection,
  closePool,
  escapeId,
  escape,
};
