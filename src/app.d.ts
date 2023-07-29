// See https://kit.svelte.dev/docs/types#app

import type * as schema from '$lib/server/db/schema.js';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			authRequest: import('lucia').AuthRequest<Lucia.Auth>;
			db: LibSQLDatabase<typeof schema>;
			auth: Lucia.Auth;
		}
	}
}

/// <reference types="lucia" />
declare global {
	namespace Lucia {
		type Auth = import('./hooks.server.js').Auth;
		type DatabaseUserAttributes = {
			first_name: string;
			last_name: string;
			email: string;
			email_verified: number;
			password_expired: number;
			role: RolesEnum;
		};
		type UserAttributes = {
			firstName: string;
			lastName: string;
			email: string;
			emaiVerified: number;
			passwordExpired: number;
			role: RolesEnum;
		};
		// eslint-disable-next-line @typescript-eslint/ban-types
		type DatabaseSessionAttributes = {};
	}
}

export {};
