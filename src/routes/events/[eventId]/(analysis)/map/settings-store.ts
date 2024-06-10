import { LOCAL_STORAGE_PREFIX } from '$lib/constants';
import { createPersistentStore } from '$lib/stores/persistent-store';
import { z } from 'zod';

export const labelPositionEnum = z.enum(['nextToTrack', 'aside', 'none']);
export const runnersTracksColorsEnum = z.enum(['time', 'routechoice', 'original']);

const settingsSchema = z.object({
	routechoicesLabels: labelPositionEnum,
	runnersLabels: labelPositionEnum,
	runnersTracksColors: runnersTracksColorsEnum,
	runnersTracksOpacity: z.number()
});

export const settingsStore = createPersistentStore(
	`${LOCAL_STORAGE_PREFIX}_settings`,
	settingsSchema,
	{
		routechoicesLabels: 'nextToTrack',
		runnersLabels: 'nextToTrack',
		runnersTracksColors: 'original',
		runnersTracksOpacity: 0.8
	}
);
