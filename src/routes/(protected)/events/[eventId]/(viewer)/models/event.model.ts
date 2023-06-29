import type { ControlPoint, Event as DatabaseEvent, LiveEvent } from '$lib/server/db/schema.js';
import type { Leg } from './leg.model.js';
import type { Runner } from './runner.model.js';

export type Event = DatabaseEvent & {
	liveEvents: LiveEvent[];
	runners: Runner[];
	legs: Leg[];
	controlPoints: ControlPoint[];
};
