import type { MapCalibration } from 'orienteering-js/models';
import type { LoggatorEvent } from 'orienteering-js/models';
import type { HttpsCallableResult } from 'firebase/functions';
import { getMapCallibrationFromLoggatorEventMap } from 'orienteering-js/loggator';

export function isNotErrorResponse<T extends Object>(
	data: T | { message: string; error: unknown }
): data is T {
	return !('error' in data);
}

export const cachedImages: Record<string, HTMLImageElement> = {};

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
	const [calibrationPromise, image] = getMapCallibrationFromLoggatorEventMap(loggatorEvent.map);
	cachedImages[loggatorEvent.map.url] = image;
	const calibration = await calibrationPromise;
	return [loggatorEvent, calibration];
}
