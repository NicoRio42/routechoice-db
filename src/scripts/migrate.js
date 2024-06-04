import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient } from '@libsql/client';


const db = drizzle(createClient({ url: 'file:sqlite.db' }));

migrate(db, { migrationsFolder: './migrations' });
