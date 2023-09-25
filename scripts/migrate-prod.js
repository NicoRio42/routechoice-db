import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient } from '@libsql/client/web';
import { TURSO_DB_TOKEN } from '$env/static/private';


const db = drizzle(createClient({
    url: 'libsql://routechoice-db-routechoice-db.turso.io',
    authToken: TURSO_DB_TOKEN,
}));

migrate(db, { migrationsFolder: './migrations' });
