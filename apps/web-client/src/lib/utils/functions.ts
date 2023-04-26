import getMapCallibrationFromLoggatorEventMap from '$lib/o-utils/loggator/map-calibration';
import type { MapCalibration } from '$lib/o-utils/models/course-map';
import type { LoggatorEvent } from '$lib/o-utils/models/loggator-api/logator-event';
import type { HttpsCallableResult } from 'firebase/functions';

export function isNotErrorResponse<T extends Object>(
	data: T | { message: string; error: unknown }
): data is T {
	return !('error' in data);
}

export async function getLoggatorEventAndMapCallibration(
	loggatorEventPromise: Promise<
		HttpsCallableResult<
			| LoggatorEvent
			| {
					message: string;
					error: unknown;
			  }
		>
	>
): Promise<[LoggatorEvent, MapCalibration]> {
	const loggatorEventResponse = await loggatorEventPromise;
	if (!isNotErrorResponse<LoggatorEvent>(loggatorEventResponse.data))
		throw new Error('Could not get loggator event');

	const loggatorEvent = loggatorEventResponse.data;
	if (!('url' in loggatorEvent.map)) throw new Error("Event isn't started yet");
	const calibration = await getMapCallibrationFromLoggatorEventMap(loggatorEvent.map);

	return [loggatorEvent, calibration];
}
