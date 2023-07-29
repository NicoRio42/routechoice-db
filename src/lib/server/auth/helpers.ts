import { RolesEnum } from '$lib/models/enums/roles.enum.js';
import { redirect } from '@sveltejs/kit';
import type { User } from 'lucia';

export function redirectIfNotLogedIn(user: User) {
	if (!user) {
		throw redirect(302, '/login');
	}

	if (user.passwordExpired) {
		throw redirect(302, '/login');
	}

	if (!user.emailVerified) {
		throw redirect(302, '/email-verification');
	}
}

export function redirectIfNotAdmin(user: User) {
	redirectIfNotLogedIn(user);

	if (user.role !== RolesEnum.Enum.admin) {
		throw redirect(302, '/');
	}
}

export function redirectIfNotAdminOrNotCurrentUser(user: User, userId: string) {
	redirectIfNotLogedIn(user);

	if (user.id !== userId && user.role !== RolesEnum.Enum.admin) {
		throw redirect(302, '/');
	}

	if (user.role !== RolesEnum.Enum.admin) {
		throw redirect(302, '/');
	}
}
