import { courseValidator, type Course } from '$lib/models/course';
import getMapCallibrationFromLoggatorEventMap from '$lib/o-utils/loggator/map-calibration';
import { buildRunnersTracksFromLoggatorData } from '$lib/o-utils/loggator/points';
import { courseDataWithoutRunnersValidator } from '$lib/o-utils/models/course-data';
import { parseNestedArraysInLegs } from '$lib/o-utils/models/leg';
import type { LoggatorEvent } from '$lib/o-utils/models/loggator-api/logator-event';
import type { LoggatorPoints } from '$lib/o-utils/models/loggator-api/loggator-points';
import type Runner from '$lib/o-utils/models/runner';
import { runnerValidator } from '$lib/o-utils/models/runner';
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
import { initializeApp } from 'firebase/app';

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

function isLoggatorPoints(
	data: LoggatorPoints | { message: string; error: unknown }
): data is LoggatorPoints {
	return 'data' in data;
}

function isLoggatorEvent(
	data: LoggatorEvent | { message: string; error: unknown }
): data is LoggatorEvent {
	return !('error' in data);
}

export const load = async ({ params: { courseId } }) => {
	let course: Course;

	try {
		const loggatorEventID = courseId.split('-')[1];

		if (loggatorEventID === undefined) throw new Error('Wrong format for course id');

		const runnersRef = collection(db, 'coursesData', courseId, 'runners');

		const runnersQuery = query(runnersRef, orderBy('rank', 'desc'));

		const [
			courseDocument,
			courseDataDocument,
			runnersCollection,
			loggatorEventResponse,
			loggatorPointsResponse
		] = await Promise.all([
			getDoc(doc(db, 'courses', courseId)),
			getDoc(doc(db, 'coursesData', courseId)),
			getDocs(runnersQuery),
			getLoggatorEvent(loggatorEventID),
			getLoggatorEventPoints(loggatorEventID)
		]);

		if (!isLoggatorEvent(loggatorEventResponse.data))
			throw new Error('Could not get loggator event');

		const loggatorEvent = loggatorEventResponse.data;

		if (!isLoggatorPoints(loggatorPointsResponse.data))
			throw new Error('Could not get loggator points');

		const loggatorPoints = loggatorPointsResponse.data.data;

		course = courseValidator.parse({
			...courseDocument.data(),
			id: courseId
		});

		const courseData = {
			...courseDataWithoutRunnersValidator.parse({
				...courseDataDocument.data(),
				legs: parseNestedArraysInLegs(courseDataDocument.data()?.legs)
			}),
			runners: []
		};

		if (!('url' in loggatorEvent.map)) throw new Error("Event isn't started yet");

		if (courseData.legs.length === 0) return courseData;

		const courseDataWithoutRunners = courseDataWithoutRunnersValidator.parse({
			...courseDataDocument.data(),
			legs: parseNestedArraysInLegs(courseDataDocument.data()?.legs)
		});

		const runners: Runner[] = [];

		runnersCollection.forEach((doc) => {
			try {
				runners.push(runnerValidator.parse({ ...doc.data(), id: doc.id }));
			} catch (error) {
				console.error(error);
			}
		});

		const runnersWithTracks = buildRunnersTracksFromLoggatorData(
			runners,
			loggatorPoints,
			loggatorEvent
		);

		const map = {
			calibration: await getMapCallibrationFromLoggatorEventMap(loggatorEvent.map),
			url: loggatorEvent.map.url
		};

		return {
			...courseDataWithoutRunners,
			runners: runnersWithTracks,
			map
		};
	} catch (error) {
		console.error(error);
	}
};
