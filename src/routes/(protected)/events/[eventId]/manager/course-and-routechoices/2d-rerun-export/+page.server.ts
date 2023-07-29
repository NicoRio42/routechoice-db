import { redirectIfNotAdmin } from '$lib/server/auth/helpers.js';
import { fail, redirect } from '@sveltejs/kit';
import { twoDRerunCourseExportSchema } from 'orienteering-js/models';

export const actions = {
	default: async ({ request, locals }) => {
		const session = await locals.authRequest.validate();
		if (!session) throw redirect(302, '/login');
		const { user } = session;

		redirectIfNotAdmin(user);

		const formData = await request.formData();
		const file = formData.get('twoDRerunExport');

		if (!(file instanceof File)) throw fail(400);

		try {
			const twoDRerunExport = twoDRerunCourseExportSchema.parse(JSON.parse(await file.text()));
			// parseTwoDRerunCourseAndRoutechoicesExport(twoDRerunExport, )
			console.log(twoDRerunExport.tags[0]);
		} catch (e) {
			throw fail(400);
		}
	}
};
