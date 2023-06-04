// See https://kit.svelte.dev/docs/types#app

import type { User as UserFromDB } from '$lib/server/db/schema';
import type { RolesEnum } from '$lib/models/enums/roles.enum.ts';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			authRequest: import('lucia-auth').AuthRequest;
			db: BetterSQLite3Database | DrizzleD1Database;
			auth: Lucia.Auth;
			emailVerificationToken: import('./hooks.server').EmailVerificationToken;
			passwordResetToken: import('./hooks.server').PasswordResetToken;
		}

		interface Platform {
			env?: {
				TODO_LIST_DB: D1Database;
			};
		}
	}
}

/// <reference types="lucia-auth" />
declare global {
	namespace Lucia {
		type Auth = import('./hooks.server').Auth;
		type UserAttributes = {
			name: string;
			email: string;
			email_verified: number;
			role: RolesEnum;
		};
	}
}

export {};
