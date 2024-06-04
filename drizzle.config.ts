import type { Config } from 'drizzle-kit';

export default {
	dialect: 'sqlite',
	out: './migrations',
	schema: './src/lib/server/db/schema.js',
	breakpoints: true,
	driver: 'turso'
} satisfies Config;
