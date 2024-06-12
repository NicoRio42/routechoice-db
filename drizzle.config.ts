import type { Config } from 'drizzle-kit';

export default {
	dialect: 'sqlite',
	out: './migrations',
	schema: './src/lib/server/db/schema.js',
	breakpoints: true,
	driver: 'turso',
	dbCredentials: { url: 'file:sqlite.db' }
} satisfies Config;
