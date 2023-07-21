import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import database from 'better-sqlite3';

const thirdArg = process.argv[2];

const db = drizzle(thirdArg === 'prod' ? env.ROUTECHOICE_DB : database('sqlite.db'));

migrate(db, { migrationsFolder: './migrations' });
