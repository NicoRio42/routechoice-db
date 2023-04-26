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
import { getFunctions, httpsCallable, type HttpsCallableResult } from 'firebase/functions';
import firebaseConfig from '../../../environments/environment';
import { getLoggatorEventAndMapCallibration } from '$lib/utils/functions';

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

export const load = async ({ params: { courseId } }) => {
	try {
		const loggatorEventID = courseId.split('-')[1];
		if (loggatorEventID === undefined) throw new Error('Wrong format for course id');
		const runnersRef = collection(db, 'coursesData', courseId, 'runners');
		const runnersQuery = query(runnersRef, orderBy('rank', 'desc'));
		const loggatorEventPromise = getLoggatorEvent(loggatorEventID);

		return {
			promises: {
				coursePRomise: getDoc(doc(db, 'courses', courseId)),
				courseDataPromise: getDoc(doc(db, 'coursesData', courseId)),
				runnersPromise: getDocs(runnersQuery),
				loggatorEventMapCallibrationPromise:
					getLoggatorEventAndMapCallibration(loggatorEventPromise),
				loggatorPointsPromise: getLoggatorEventPoints(loggatorEventID)
			}
		};
	} catch (e) {
		throw error(500, 'An error occured');
	}
};
