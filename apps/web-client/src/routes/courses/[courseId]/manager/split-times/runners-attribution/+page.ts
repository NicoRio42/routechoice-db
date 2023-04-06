import type User from '$lib/models/user.js';
import type { LoggatorEvent } from '$lib/o-utils/models/loggator-api/logator-event.js';
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions(undefined, 'europe-west1');
const getUserList = httpsCallable<string, User[] | { message: string; error: unknown }>(
	functions,
	'getUserList'
);
const getLoggatorEvent = httpsCallable<string, LoggatorEvent | { message: string; error: unknown }>(
	functions,
	'getLoggatorEvent'
);

export async function load({ params: { courseId } }) {
	const loggatorEventID = courseId.split('-')[1];

	return { users: getUserList(), loggatorEvent: getLoggatorEvent(loggatorEventID) };
}
