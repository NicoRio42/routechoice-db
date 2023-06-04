import { fail } from '@sveltejs/kit';
import { twoDRerunCourseExportSchema } from 'orienteering-js/models';
import { parseTwoDRerunCourseAndRoutechoicesExport } from 'orienteering-js/two-d-rerun';

export const actions = {
	default: async ({ request }) => {
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
