import type { ControlPoint, Event as DatabaseEvent, LiveEvent } from '$lib/server/db/models.js';
import type { LegWithRoutechoices } from './leg.model.js';
import type { RunnerWithNullableLegsAndTrack } from './runner.model.js';

export type EventWithLiveEventsRunnersLegsAndControlPoints = DatabaseEvent & {
	liveEvents: LiveEvent[];
	runners: RunnerWithNullableLegsAndTrack[];
	legs: LegWithRoutechoices[];
	controlPoints: ControlPoint[];
};
