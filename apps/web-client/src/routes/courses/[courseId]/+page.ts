import getMapCallibrationFromLoggatorEventMap from '$lib/o-utils/loggator/map-calibration';
import type { MapCalibration } from '$lib/o-utils/models/course-map';
import type { LoggatorEvent } from '$lib/o-utils/models/loggator-api/logator-event';
import type { LoggatorPoints } from '$lib/o-utils/models/loggator-api/loggator-points';
import { error } from '@sveltejs/kit';
import { initializeApp } from 'firebase/app';
import {
	collection,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	orderBy,
	query
} from 'firebase/firestore/lite';
import { getFunctions, httpsCallable } from 'firebase/functions';
import firebaseConfig from '../../../environments/environment';

initializeApp(firebaseConfig);
const functions = getFunctions(undefined, 'europe-west1');
const db = getFirestore();

const getLoggatorEvent = httpsCallable<string, LoggatorEvent | { message: string; error: unknown }>(
	functions,
	'getLoggatorEvent'
);

const getLoggatorEventPoints = httpsCallable<
	string,
	LoggatorPoints | { message: string; error: unknown }
>(functions, 'getLoggatorEventPoints');

function isLoggatorEvent(
	data: LoggatorEvent | { message: string; error: unknown }
): data is LoggatorEvent {
	return !('error' in data);
}

export const load = async ({ params: { courseId } }) => {
	try {
		const loggatorEventID = courseId.split('-')[1];

		if (loggatorEventID === undefined) throw new Error('Wrong format for course id');

		const runnersRef = collection(db, 'coursesData', courseId, 'runners');

		const runnersQuery = query(runnersRef, orderBy('rank', 'desc'));

		return {
			promises: {
				coursePRomise: getDoc(doc(db, 'courses', courseId)),
				courseDataPromise: getDoc(doc(db, 'coursesData', courseId)),
				runnersPromise: getDocs(runnersQuery),
				loggatorEventMapCallibrationPromise: getLoggatorEventAndMapCallibration(loggatorEventID),
				loggatorPointsPromise: getLoggatorEventPoints(loggatorEventID)
			}
		};
	} catch (e) {
		throw error(500, 'An error occured');
	}
};

async function getLoggatorEventAndMapCallibration(
	loggatorEventID: string
): Promise<[LoggatorEvent, MapCalibration]> {
	const loggatorEventResponse = await getLoggatorEvent(loggatorEventID);
	if (!isLoggatorEvent(loggatorEventResponse.data)) throw new Error('Could not get loggator event');

	const loggatorEvent = loggatorEventResponse.data;
	if (!('url' in loggatorEvent.map)) throw new Error("Event isn't started yet");
	const calibration = await getMapCallibrationFromLoggatorEventMap(loggatorEvent.map);

	return [loggatorEvent, calibration];
}
