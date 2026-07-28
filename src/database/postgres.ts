import { Pool } from 'pg';

export function createPostgresPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL nao configurada. Defina a URL do PostgreSQL no arquivo .env.');
  }

  return new Pool({
    connectionString,
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });
}
