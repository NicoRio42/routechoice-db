import { betterSqlite3 } from '@lucia-auth/adapter-sqlite';
import BetterSqlite3 from "better-sqlite3";
import lucia from 'lucia-auth';
import { node } from "lucia-auth/middleware";
import "lucia-auth/polyfill/node";

const db = BetterSqlite3("sqlite.db")

const auth = lucia({
    adapter: betterSqlite3(db),
    env: 'DEV',
    middleware: node(),
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

await auth.createUser({
    primaryKey: {
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