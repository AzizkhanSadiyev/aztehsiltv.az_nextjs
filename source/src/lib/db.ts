/**
 * Database Configuration and Connection Pool
 * Provides MySQL connection pool and query helper functions
 */

import mysql from 'mysql2/promise';

const globalForDb = globalThis as typeof globalThis & {
  __mysqlPool?: mysql.Pool;
};

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

const CONNECTION_ERROR_CODES = new Set([
  'PROTOCOL_CONNECTION_LOST',
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EPIPE',
  'POOL_CLOSED',
  'ERR_POOL_CLOSED',
  'ER_POOL_CLOSED',
  'POOL_ENDED',
]);

function isConnectionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = (error as { code?: string }).code;
  const message = (error as { message?: string }).message;
  if (code && CONNECTION_ERROR_CODES.has(code)) return true;
  if (typeof message === 'string') {
    const normalized = message.toLowerCase();
    if (normalized.includes('pool is closed')) return true;
  }
  return false;
}

async function getConnectionWithRetry(): Promise<mysql.PoolConnection> {
  try {
    return await getPool().getConnection();
  } catch (error) {
    if (isConnectionError(error)) {
      await closePool();
      return await getPool().getConnection();
    }
    throw error;
  }
}

async function withConnection<T>(
  executor: (connection: mysql.PoolConnection) => Promise<T>,
): Promise<T> {
  const run = async () => {
    const connection = await getConnectionWithRetry();
    try {
      return await executor(connection);
    } finally {
      try {
        connection.release();
      } catch {
        // ignore release errors
      }
    }
  };

  try {
    return await run();
  } catch (error) {
    if (isConnectionError(error)) {
      await closePool();
      return await run();
    }
    throw error;
  }
}

/**
 * Get database connection pool
 */
export function getPool(): mysql.Pool {
  if (!pool) {
    pool = globalForDb.__mysqlPool ?? null;
  }
  if (pool) {
    const anyPool = pool as { _closed?: boolean; closed?: boolean; _ending?: boolean; ended?: boolean };
    if (anyPool._closed || anyPool.closed || anyPool._ending || anyPool.ended) {
      pool = null;
    }
  }
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    if (process.env.NODE_ENV !== 'production') {
      globalForDb.__mysqlPool = pool;
    }
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
  return withConnection(async (connection) => {
    const [rows] = await connection.query(sql, params);
    return rows as T[];
  });
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
  return withConnection(async (connection) => {
    const [result] = await connection.query(sql, params);
    return (result as any).insertId;
  });
}

/**
 * Execute an update query and return the number of affected rows
 */
export async function update(
  sql: string,
  params?: any[]
): Promise<number> {
  return withConnection(async (connection) => {
    const [result] = await connection.query(sql, params);
    return (result as any).affectedRows;
  });
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
  const connection = await getConnectionWithRetry();
  try {
    await connection.beginTransaction();
    return connection;
  } catch (error) {
    try {
      connection.release();
    } catch {
      // ignore release errors
    }
    if (isConnectionError(error)) {
      await closePool();
      const retryConnection = await getConnectionWithRetry();
      await retryConnection.beginTransaction();
      return retryConnection;
    }
    throw error;
  }
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
    try {
      await pool.end();
    } finally {
      pool = null;
      if (globalForDb.__mysqlPool) {
        globalForDb.__mysqlPool = undefined;
      }
    }
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
