import { z } from 'zod';

export const newRoutechoiceSchema = z.object({
	id: z.string(),
	color: z.string(),
	length: z.number(),
	name: z.string(),
	fkLeg: z.string(),
	latitudes: z.string(),
	longitudes: z.string(),
	runnerLegsToUpdate: z.array(
		z.object({ id: z.string(), fkRunner: z.string(), fkDetectedRoutechoice: z.string().nullable() })
	)
});

export type NewRoutechoice = z.infer<typeof newRoutechoiceSchema>;
