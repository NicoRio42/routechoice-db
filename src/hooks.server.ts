import { dev } from '$app/environment';
import { TURSO_DB_TOKEN } from '$env/static/private';
import { generateScryptHash, validateScryptHash } from '$lib/server/auth/crypto.js';
import * as schema from '$lib/server/db/schema.js';
import { createClient as createClientWeb, type Client } from '@libsql/client/web';
import { libsql } from '@lucia-auth/adapter-sqlite';
import type { Handle } from '@sveltejs/kit';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import { lucia } from 'lucia';
import { sveltekit } from 'lucia/middleware';

let libsqlClient: Client;
let drizzleClient: LibSQLDatabase<typeof schema>;

export const handle: Handle = async ({ event, resolve }) => {
	if (libsqlClient === undefined) {
		console.debug('[HOOK HANDLE] Init libsqlClient');

		const config = dev
			? { url: 'file:sqlite.db' }
			: { url: 'libsql://routechoice-db-routechoice-db.turso.io', authToken: TURSO_DB_TOKEN };

		libsqlClient = dev
			? (await import('@libsql/client')).createClient(config)
			: createClientWeb(config);
	}

	if (drizzleClient === undefined) {
		console.debug('[HOOK HANDLE] init drizzleClient');

		drizzleClient = drizzle(libsqlClient, { schema });
	}

	event.locals.libsqlClient = libsqlClient;
	event.locals.db = drizzleClient;
	const auth = getAuth(libsqlClient);
	event.locals.auth = auth;
	event.locals.authRequest = auth.handleRequest(event);

	// CORS handling for pubic api routes
	if (event.url.pathname.startsWith('/api/public')) {
		if (event.request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': '*'
				}
			});
		}
	}

	const response = await resolve(event);

	if (event.url.pathname.startsWith('/api/public')) {
		response.headers.append('Access-Control-Allow-Origin', `*`);
	}

	return response;
};

export type Auth = ReturnType<typeof createNewAuth>;
let auth: Auth;

function createNewAuth(client: Client) {
	return lucia({
		adapter: libsql(client, {
			user: 'auth_user',
			key: 'auth_key',
			session: 'auth_session'
		}),
		env: dev ? 'DEV' : 'PROD',
		middleware: sveltekit(),
		transformDatabaseUser: (userData: schema.UserColumnsNames) => ({
			id: userData.id,
			firstName: userData.first_name,
			lastName: userData.last_name,
			email: userData.email,
			emailVerified: !!userData.email_verified,
			passwordExpired: !!userData.password_expired,
			role: userData.role
		}),
		getUserAttributes: (userData) => ({
			id: userData.id,
			firstName: userData.first_name,
			lastName: userData.last_name,
			email: userData.email,
			emailVerified: !!userData.email_verified,
			passwordExpired: !!userData.password_expired,
			role: userData.role
		}),
		passwordHash: {
			generate: generateScryptHash,
			validate: validateScryptHash
		}
	});
}

function getAuth(client: Client) {
	if (auth !== undefined) {
		return auth;
	}

	console.debug('[HOOK HANDLE] init Lucia auth');
	auth = createNewAuth(client);
	return auth;
}
