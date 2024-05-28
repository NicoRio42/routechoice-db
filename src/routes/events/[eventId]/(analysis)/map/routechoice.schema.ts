import { names } from 'orienteering-js/ocad';
import { z } from 'zod';

export const newRoutechoiceSchema = z.object({
	legId: z.string().min(1),
	name: z.string().refine((arg) => names.includes(arg), 'Not a valid name.'),
	color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Not a valid color.'),
	track: z.string().transform((val, ctx) => {
		const parsed = z.array(z.array(z.number()).length(2)).safeParse(JSON.parse(val));

		if (!parsed.success) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: parsed.error.message
			});

			return z.NEVER;
		}

		return parsed.data;
	})
});
