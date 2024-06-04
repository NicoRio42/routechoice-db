import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient } from '@libsql/client/web';
import { env } from 'node:process';

const db = drizzle(
	createClient({
		url: 'libsql://routechoice-db-routechoice-db.turso.io',
		authToken: env.TURSO_DB_TOKEN
	})
);

await migrate(db, { migrationsFolder: './migrations' });
