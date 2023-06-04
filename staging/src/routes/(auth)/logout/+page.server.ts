import { fail } from '@sveltejs/kit';

export const actions = {
	default: async ({ locals }) => {
		const session = await locals.authRequest.validate();
		if (!session) return fail(401);
		await locals.auth.invalidateSession(session.sessionId);
		locals.authRequest.setSession(null);
	}
};
