import { z } from 'zod';
import { timezones } from '$lib/components/form-fields/timezones.js';

export const splitTimesFromLocalFile = z.object({
	file: z.any(),
	className: z.string(),
	timezone: z
		.string()
		.refine((arg) => timezones.map((tz) => tz.offset).includes(arg), 'Not a valid time zone')
});
