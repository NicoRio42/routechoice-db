import type { Runner } from 'orienteering-js/models';
import { doc, writeBatch, type Firestore } from 'firebase/firestore/lite';

export function updateRunnersRoutechoicesInFirestore(
	oldRunners: Runner[],
	newRunners: Runner[],
	db: Firestore,
	courseId: string
) {
	// So the runner track is not persisted to Firebase
	const runnersWithDetectedRoutechoicesWithoutTrack = newRunners.map((runner) => ({
		...runner,
		track: null
	}));

	// Only updated runners are pushed to Firestore
	const updatedRunner = runnersWithDetectedRoutechoicesWithoutTrack.filter(
		(newRunner, runnerIndex) =>
			oldRunners[runnerIndex].legs.some((oldRunnerLeg, legIndex) => {
				return (
					newRunner.legs[legIndex]?.detectedRouteChoice?.id !==
					oldRunnerLeg?.detectedRouteChoice?.id
				);
			})
	);

	const batch = writeBatch(db);

	updatedRunner.forEach(async (runner) => {
		batch.update(doc(db, 'coursesData', courseId, 'runners', runner.id), {
			legs: runner.legs
		});
	});

	batch.commit();
}

export async function createRunners(
	runners: Runner[],
	courseId: string,
	db: Firestore
): Promise<void> {
	const batch = writeBatch(db);

	runners.forEach(async (runner) => {
		const runnerRef = doc(db, 'coursesData', courseId, 'runners', runner.id);
		console.log(runner.lastName + ' created');
		batch.set(runnerRef, runner);
	});

	batch.commit();
}

export async function updateRunners(
	runners: Runner[],
	courseId: string,
	db: Firestore
): Promise<void> {
	const batch = writeBatch(db);

	runners.forEach(async (runner) => {
		const runnerRef = doc(db, 'coursesData', courseId, 'runners', runner.id);
		console.log(runner.lastName + ' updated');
		batch.update(runnerRef, { ...runner, track: null });
	});

	batch.commit();
}
