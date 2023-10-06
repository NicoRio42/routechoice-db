import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient } from '@libsql/client/web';


const db = drizzle(createClient({
    url: 'libsql://routechoice-db-routechoice-db.turso.io',
    authToken: "",
}));

migrate(db, { migrationsFolder: './migrations' });
