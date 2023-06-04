import { z } from 'zod';

const timestampFromString = z.string().transform((arg, ctx) => {
	let date: Date;

	try {
		date = new Date(arg);
	} catch (e) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Please enter a valid time'
		});

		return z.NEVER;
	}

	return date.getTime() - date.getTimezoneOffset() * 60000;
});

export const addEventSchema = z
	.object({
		name: z.string().nonempty('Please enter a name for the event'),
		liveProviderUrl: z.string().url('Please enter a valid url'),
		timeZoneOffset: z.number(),
		startTime: timestampFromString,
		publishTime: timestampFromString,
		finishTime: timestampFromString
	})
	.transform((arg) => ({
		...arg,
		startTime: arg.startTime + arg.timeZoneOffset * 60000,
		publishTime: arg.publishTime + arg.timeZoneOffset * 60000,
		finishTime: arg.finishTime + arg.timeZoneOffset * 60000
	}))
	.refine((data) => data.startTime <= data.publishTime, {
		message: 'Publish time should be after start time',
		path: ['publishTime']
	})
	.refine((data) => data.startTime <= data.finishTime, {
		message: 'Finish time should be after start time',
		path: ['finishTime']
	});
