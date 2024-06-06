import { z } from 'zod';

export const partialAddEventObjectSchema = z.object({
	name: z.string().min(1, 'Please enter a name for the event'),
	tags: z.array(z.string()),
	liveProviderUrl: z.string().url('Please enter a valid url'),
	timeZoneOffset: z.number(),
	startTime: z.date(),
	publishTime: z.date(),
	finishTime: z.date()
});

export const addEventSchema = partialAddEventObjectSchema.refine(
	(data) => data.startTime <= data.finishTime,
	{
		message: 'Finish time should be after start time',
		path: ['finishTime']
	}
);
