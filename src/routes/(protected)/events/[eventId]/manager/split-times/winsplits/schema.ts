import { z } from 'zod';
import { timezones } from '$lib/components/form-fields/timezones.js';

export const splitTimesFromWinsplitsSchema = z.object({
    date: z.string().nonempty(),
    eventId: z.string().nonempty(),
    classId: z.string().nonempty(),
    timezone: z
        .string()
        .refine((arg) => timezones.map((tz) => tz.offset).includes(arg), 'Not a valid time zone')
});
