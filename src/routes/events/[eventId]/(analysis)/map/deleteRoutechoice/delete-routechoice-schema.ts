import { z } from 'zod';

export const deleteRoutechoiceSchema = z.object({
	routechoiceId: z.string(),
	runnerLegsToUpdate: z.array(
		z.object({ id: z.string(), fkRunner: z.string(), fkDetectedRoutechoice: z.string().nullable() })
	)
});

export type DeleteRoutechoice = z.infer<typeof deleteRoutechoiceSchema>;
