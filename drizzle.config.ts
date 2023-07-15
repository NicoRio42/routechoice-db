import type { Config } from 'drizzle-kit';

export default {
	out: './migrations',
	schema: './src/lib/server/db/schema.ts',
	breakpoints: true,
	driver: 'better-sqlite',
	dbCredentials: { url: 'C:Users/nicolas.rioDocuments/1-sourcespersonnel/routechoice-dbsqlite.db' }
} satisfies Config;
