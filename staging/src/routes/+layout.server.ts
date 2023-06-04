export async function load({ locals }) {
	const { user } = await locals.authRequest.validateUser();

	if (user) {
		return {
			user
		};
	}
}
