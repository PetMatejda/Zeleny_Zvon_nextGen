import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as schema from './schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || join(__dirname, '..', 'database.sqlite');

const client = createClient({
  url: `file:${dbPath}`,
});

export const db = drizzle(client, { schema });
