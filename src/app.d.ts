// See https://kit.svelte.dev/docs/types#app

import type { User as UserFromDB } from '$lib/server/db/schema';
import type { RolesEnum } from '$lib/models/enums/roles.enum.ts';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type * as schema from '$lib/server/db/schema.js';

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			authRequest: import('lucia-auth').AuthRequest;
			db: BetterSQLite3Database<typeof schema> | DrizzleD1Database<typeof schema>;
			auth: Lucia.Auth;
			emailVerificationToken: import('./hooks.server').EmailVerificationToken;
			passwordResetToken: import('./hooks.server').PasswordResetToken;
		}

		interface Platform {
			env?: {
				ROUTECHOICE_DB: D1Database;
			};
		}
	}
}

/// <reference types="lucia-auth" />
declare global {
	namespace Lucia {
		type Auth = import('./hooks.server.js').Auth;
		type UserAttributes = {
			first_name: string;
			last_name: string;
			email: string;
			email_verified: number;
			password_expired: number;
			role: RolesEnum;
		};
	}
}

export {};
