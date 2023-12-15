import { libsql } from '@lucia-auth/adapter-sqlite';
import { createClient } from '@libsql/client';
import { lucia } from 'lucia';
import { node } from "lucia/middleware";
import "lucia/polyfill/node";
import { generateScryptHash, validateScryptHash } from '../server/auth/crypto.js';

const db = createClient({ url: 'file:sqlite.db' })

const auth = lucia({
    adapter: libsql(db, {
        user: 'auth_user',
        key: 'auth_key',
        session: 'auth_session'
    }),
    env: 'DEV',
    middleware: node(),
    transformDatabaseUser: /** @param {import('$lib/server/db/schema.js').UserColumnsNames} userData */ (userData) => ({
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

await auth.createUser({
    key: {
        providerId: 'email',
        providerUserId: "nicolas.rio42@gmail.com",
        password: crypto.randomUUID()
    },
    attributes: {
        first_name: "Nicolas",
        last_name: "Rio",
        email: "nicolas.rio42@gmail.com",
        role: "admin",
        email_verified: 1,
        password_expired: 0
    }
});
