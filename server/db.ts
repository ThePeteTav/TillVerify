import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Azure Database for PostgreSQL requires TLS. rejectUnauthorized is left
// false because the platform's cert chain isn't in Node's default trust
// store; the connection string itself is the secret that matters here.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
});
export const db = drizzle(pool, { schema });
