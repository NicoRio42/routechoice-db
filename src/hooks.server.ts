import { building, dev } from '$app/environment';
import { betterSqlite3, d1 } from '@lucia-auth/adapter-sqlite';
import { idToken } from '@lucia-auth/tokens';
import type { Handle } from '@sveltejs/kit';
import type { Database } from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import lucia from 'lucia-auth';
import { sveltekit } from 'lucia-auth/middleware';
import * as schema from '$lib/server/db/schema.js';

export const handle: Handle = async ({ event, resolve }) => {
	if (building) return await resolve(event);

	const db = await getDatabaseInstance(event.platform);
	// @ts-ignore
	event.locals.db = getDrizzleInstance(db);

	// @ts-ignore
	const auth = getAuth(db);
	event.locals.auth = auth;
	event.locals.authRequest = auth.handleRequest(event);

	event.locals.emailVerificationToken = getEmailVerificationToken(auth);
	event.locals.passwordResetToken = getPasswordResetToken(auth);
	return await resolve(event);
};

let sqlite3Database: Database | D1Database | undefined;

async function getDatabaseInstance(platform: App.Platform | undefined) {
	if (sqlite3Database !== undefined) return sqlite3Database;
	if (dev) return new (await import('better-sqlite3')).default('sqlite.db');
	if (platform === undefined) throw new Error('platform is undefined');
	if (platform.env === undefined) throw new Error('platform.env is undefined');
	return platform.env.ROUTECHOICE_DB;
}

let drizzleInstance: BetterSQLite3Database;

function getDrizzleInstance(db: Database | D1Database) {
	if (drizzleInstance !== undefined) return drizzleInstance;
	if (isD1Database(db)) return drizzleD1(db, { schema });

	return drizzle(db, { schema });
}

function isD1Database(db: Database | D1Database): db is D1Database {
	return !dev;
}

export type Auth = ReturnType<typeof createNewAuth>;
let auth: Auth;

function createNewAuth(db: Database | D1Database) {
	const auth = lucia({
		// @ts-ignore
		adapter: dev ? betterSqlite3(db) : d1(db),
		env: dev ? 'DEV' : 'PROD',
		middleware: sveltekit(),
		transformDatabaseUser: (userData) => ({
			id: userData.id,
			firstName: userData.first_name,
			lastName: userData.last_name,
			email: userData.email,
			emailVerified: userData.email_verified === 1,
			passwordExpired: userData.password_expired === 1,
			role: userData.role
		})
	});

	return auth;
}

function getAuth(db: Database | D1Database) {
	if (auth !== undefined) return auth;

	return createNewAuth(db);
}

export type EmailVerificationToken = ReturnType<typeof createNewEmailVerificationToken>;
let emailVerificationToken: EmailVerificationToken;

function createNewEmailVerificationToken(auth: Auth) {
	return idToken(auth, 'email_verification', {
		expiresIn: 60 * 60
	});
}

function getEmailVerificationToken(auth: Auth) {
	if (emailVerificationToken !== undefined) return emailVerificationToken;

	return createNewEmailVerificationToken(auth);
}

export type PasswordResetToken = ReturnType<typeof createNewPasswordResetToken>;
let passwordResetToken: PasswordResetToken;

function createNewPasswordResetToken(auth: Auth) {
	return idToken(auth, 'password-reset', {
		expiresIn: 60 * 60
	});
}

function getPasswordResetToken(auth: Auth) {
	if (passwordResetToken !== undefined) return passwordResetToken;

	return createNewPasswordResetToken(auth);
}
