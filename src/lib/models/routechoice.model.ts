import type { Routechoice } from '$lib/server/db/schema.js';

export type RoutechoiceWithParsedTrack = Omit<Routechoice, 'latitudes' | 'longitudes' | 'fkLeg'> & {
	track: [number, number][];
};
