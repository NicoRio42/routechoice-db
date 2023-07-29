export async function load({ locals }) {
	const session = await locals.authRequest.validate();

	return { user: session?.user ?? null };
}
