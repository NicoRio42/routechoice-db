import { LOCAL_STORAGE_PREFIX } from '$lib/constants';
import { createPersistentStore } from '$lib/stores/persistent-store';
import { z } from 'zod';

export const labelPositionEnum = z.enum(['nextToTrack', 'aside', 'none']);

const settingsSchema = z.object({
	routechoicesLabels: labelPositionEnum,
	runnersLabels: labelPositionEnum
});

export const settingsStore = createPersistentStore(
	`${LOCAL_STORAGE_PREFIX}_settings`,
	settingsSchema,
	{ routechoicesLabels: 'nextToTrack', runnersLabels: 'nextToTrack' }
);
