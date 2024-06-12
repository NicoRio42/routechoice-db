import { z } from 'zod';
import { timezones } from '$lib/components/form-fields/timezones.js';
import { MAX_R2_SIZE } from '$lib/constants';

export const splitTimesFromLocalFile = z.object({
	file: z
		.instanceof(File, { message: 'Please upload a file.' })
		.refine((f) => f.size < MAX_R2_SIZE / 10, 'Max 1 MB upload size.'),
	className: z.string(),
	timezone: z
		.string()
		.refine((arg) => timezones.map((tz) => tz.offset).includes(arg), 'Not a valid time zone')
});
