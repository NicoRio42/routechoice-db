import { dev } from '$app/environment';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia } from 'lucia';
import { db } from '../db/db.js';
import { session as sessionTable, user as userTable } from '../db/schema.js';
import type { User } from '../db/models.js';

const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);

export const auth = new Lucia(adapter, {
	sessionCookie: { attributes: { secure: !dev } },
	getUserAttributes: (attributes) => ({
		id: attributes.id,
		firstName: attributes.firstName,
		lastName: attributes.lastName,
		email: attributes.email,
		emailVerified: attributes.emailVerified,
		passwordExpired: attributes.passwordExpired,
		role: attributes.role
	})
});

declare module 'lucia' {
	interface Register {
		Lucia: Auth;
		DatabaseUserAttributes: User;
	}
}

type Auth = typeof auth;
