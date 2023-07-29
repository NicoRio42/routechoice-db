import { generateRandomString, isWithinExpiration } from 'lucia/utils';
import {
	emailVerificationToken as emailVerificationTokenTable,
	passwordResetToken
} from '$lib/server/db/schema.js';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import type * as schema from '$lib/server/db/schema.js';

const EMAIL_VERIFICATION_TOKEN_EXPIRES_IN = 1000 * 60 * 60 * 2; // 2 hours

export const generateEmailVerificationToken = async (
	userId: string,
	db: LibSQLDatabase<schema>
) => {
	const storedUserTokens = await db
		.select()
		.from(emailVerificationTokenTable)
		.where(eq(emailVerificationTokenTable.userId, userId))
		.all();

	if (storedUserTokens.length > 0) {
		const reusableStoredToken = storedUserTokens.find((token) => {
			// check if expiration is within 1 hour
			// and reuse the token if true
			return isWithinExpiration(Number(token.expires) - EMAIL_VERIFICATION_TOKEN_EXPIRES_IN / 2);
		});

		if (reusableStoredToken) return reusableStoredToken.id;
	}

	const token = generateRandomString(64);

	await db
		.insert(emailVerificationTokenTable)
		.values({
			id: token,
			expires: new Date().getTime() + EMAIL_VERIFICATION_TOKEN_EXPIRES_IN,
			userId: userId
		})
		.run();

	return token;
};

export const validateEmailVerificationToken = async (token: string, db: LibSQLDatabase<schema>) => {
	const storedToken = await db
		.select()
		.from(emailVerificationTokenTable)
		.where(eq(emailVerificationTokenTable.id, token))
		.get();

	if (!storedToken) return null;
	const tokenExpires = Number(storedToken.expires);
	if (!isWithinExpiration(tokenExpires)) return null;
	// we can invalidate all tokens since a user only verifies their email once

	await db
		.delete(emailVerificationTokenTable)
		.where(eq(emailVerificationTokenTable.userId, storedToken.userId))
		.run();

	return storedToken.userId;
};

const PASSWORD_RESET_TOKEN_EXPIRES_IN = 1000 * 60 * 60 * 2; // 2 hours

export const generatePasswordResetToken = async (userId: string, db: LibSQLDatabase<schema>) => {
	const storedUserTokens = await db
		.select()
		.from(passwordResetToken)
		.where(eq(passwordResetToken.userId, userId))
		.all();

	if (storedUserTokens.length > 0) {
		const reusableStoredToken = storedUserTokens.find((token) => {
			// check if expiration is within 1 hour
			// and reuse the token if true
			return isWithinExpiration(Number(token.expires) - PASSWORD_RESET_TOKEN_EXPIRES_IN / 2);
		});
		if (reusableStoredToken) return reusableStoredToken.id;
	}

	const token = generateRandomString(128);

	await db
		.insert(passwordResetToken)
		.values({
			id: token,
			expires: new Date().getTime() + PASSWORD_RESET_TOKEN_EXPIRES_IN,
			userId: userId
		})
		.run();

	return token;
};

export const validatePasswordResetToken = async (token: string, db: LibSQLDatabase<schema>) => {
	const storedToken = await db
		.select()
		.from(passwordResetToken)
		.where(eq(passwordResetToken.id, token))
		.get();

	if (!storedToken) return null;
	const tokenExpires = Number(storedToken.expires);
	if (!isWithinExpiration(tokenExpires)) return null;

	// invalidate all user password reset tokens
	await db
		.delete(passwordResetToken)
		.where(eq(passwordResetToken.userId, storedToken.userId))
		.run();

	return storedToken.userId;
};

export const isValidPasswordResetToken = async (token: string, db: LibSQLDatabase<schema>) => {
	const storedToken = await db
		.select()
		.from(passwordResetToken)
		.where(eq(passwordResetToken.id, token))
		.get();

	if (!storedToken) return false;
	const tokenExpires = Number(storedToken.expires);
	if (!isWithinExpiration(tokenExpires)) return false;
	return true;
};
