import { building, dev } from '$app/environment';
import { libsql } from '@lucia-auth/adapter-sqlite';
import type { Handle } from '@sveltejs/kit';
import { lucia } from 'lucia';
import { sveltekit } from 'lucia/middleware';
import * as schema from '$lib/server/db/schema.js';
import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';

let libsqlClient: Client;
let drizzleClient: LibSQLDatabase<typeof schema>;

export const handle: Handle = async ({ event, resolve }) => {
	// TODO see if still relevant
	if (building) return await resolve(event);

	if (libsqlClient === undefined) {
		libsqlClient = createClient({ url: 'file:sqlite.db' });
	}

	if (drizzleClient === undefined) {
		drizzleClient = drizzle(libsqlClient, { schema });
	}

	event.locals.db = drizzleClient;
	const auth = getAuth(libsqlClient);
	event.locals.auth = auth;
	event.locals.authRequest = auth.handleRequest(event);

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
		})
	});
}

function getAuth(client: Client) {
	if (auth !== undefined) return auth;

	return createNewAuth(client);
}
