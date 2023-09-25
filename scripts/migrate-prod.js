import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient } from '@libsql/client/web';

/**
 * @typedef {Object} Env
 * @property {string} TURSO_DB_TOKEN
 */

const db = drizzle(createClient({
    url: 'libsql://routechoice-db-routechoice-db.turso.io',
    authToken: env.TURSO_DB_TOKEN,
}));

migrate(db, { migrationsFolder: './migrations' });
