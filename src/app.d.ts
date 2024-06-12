// See https://kit.svelte.dev/docs/types#app

import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import type { Client } from '@libsql/client/web';
import type { R2Bucket } from '@cloudflare/workers-types';

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: import('lucia').User | null;
			session: import('lucia').Session | null;
		}

		interface Platform {
			env?: {
				R2_BUCKET: R2Bucket;
			};
		}
	}
}

declare module '$env/static/private' {
	export const TURSO_DB_TOKEN: string;
	export const BREVO_API_KEY: string;
	export const LOGGATOR_POLE_FRANCE_BASIC_AUTH: string;
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
			role: 'default' | 'admin';
		};
		type UserAttributes = {
			firstName: string;
			lastName: string;
			email: string;
			emaiVerified: number;
			passwordExpired: number;
			role: 'default' | 'admin';
		};
		// eslint-disable-next-line @typescript-eslint/ban-types
		type DatabaseSessionAttributes = {};
	}
}

export {};
