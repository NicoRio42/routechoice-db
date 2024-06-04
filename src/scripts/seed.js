import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../lib/server/db/schema.js';

const config = { url: 'file:sqlite.db' };

export const libsqlClient = createClient(config);
export const db = drizzle(libsqlClient, { schema });

const events = await db.select().from(schema.event).limit(5).all();

console.log(events);
