import { dev } from '$app/environment';
import { TURSO_DB_TOKEN } from '$env/static/private';
import * as schema from '$lib/server/db/schema.js';
import { createClient as createClientWeb } from 'libsql-stateless-easy';
import { drizzle } from 'drizzle-orm/libsql';

const config =
	!dev || import.meta.env.MODE === 'production'
		? { url: 'libsql://routechoice-db-routechoice-db.turso.io', authToken: TURSO_DB_TOKEN }
		: { url: 'file:sqlite.db' };

export const libsqlClient = dev
	? (await import('@libsql/client')).createClient(config)
	: createClientWeb(config);

export const db = drizzle(libsqlClient, { schema });
