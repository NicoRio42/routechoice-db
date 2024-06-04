import { RolesEnum } from '$lib/models/enums/roles.enum.js';
import { redirect } from '@sveltejs/kit';
import type { User } from '../db/models.js';

export function redirectIfNotLogedIn(user: User | null) {
	if (user === null) {
		throw redirect(302, '/login');
	}

	if (user.passwordExpired) {
		throw redirect(302, '/login');
	}

	if (!user.emailVerified) {
		throw redirect(302, '/email-verification');
	}
}

export function redirectIfNotAdmin(user: User | null) {
	if (user === null) {
		throw redirect(302, '/login');
	}

	if (user.passwordExpired) {
		throw redirect(302, '/login');
	}

	if (!user.emailVerified) {
		throw redirect(302, '/email-verification');
	}

	if (user.role !== 'admin') {
		throw redirect(302, '/events');
	}
}

export function redirectIfNotAdminOrNotCurrentUser(user: User | null, userId: string) {
	if (user === null) {
		throw redirect(302, '/login');
	}

	if (user.passwordExpired) {
		throw redirect(302, '/login');
	}

	if (!user.emailVerified) {
		throw redirect(302, '/email-verification');
	}

	if (user.role !== 'admin' && user.id !== userId) {
		throw redirect(302, '/events');
	}
}
