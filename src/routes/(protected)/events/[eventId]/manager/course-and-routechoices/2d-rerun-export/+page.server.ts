import { fail, redirect } from '@sveltejs/kit';
import { twoDRerunCourseExportSchema } from 'orienteering-js/models';
import { parseTwoDRerunCourseAndRoutechoicesExport } from 'orienteering-js/two-d-rerun';

export const actions = {
	default: async ({ request, locals }) => {
		const { user } = await locals.authRequest.validateUser();
		if (!user) throw redirect(302, '/login');
		if (user.emailVerified === 0) throw redirect(302, '/email-verification');

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
