import { createRoutechoiceStatisticsForOneLeg } from 'orienteering-js/statistics';
import type { CourseData } from 'orienteering-js/models';
import type { Routechoice } from 'orienteering-js/models';
import { doc, type Firestore, updateDoc } from 'firebase/firestore/lite';
import { serializeNestedArraysInLegs } from 'orienteering-js/models';

export async function changeRunnerRoutechoice(
	courseData: CourseData,
	newRoutechoiceID: string,
	runnerID: string,
	legNumber: number,
	db: Firestore
): Promise<CourseData> {
	let routechoiceToAttribute: Routechoice | null;
	if (newRoutechoiceID === null) {
		routechoiceToAttribute = null;
	} else {
		const routechoice = courseData.legs[legNumber - 1].routechoices.find(
			(r) => r.id === newRoutechoiceID
		);

		if (routechoice === undefined) return courseData;
		routechoiceToAttribute = structuredClone(routechoice) as Routechoice;
		delete routechoiceToAttribute.statistics;
		routechoiceToAttribute.track = [];
	}

	const completeRunner = courseData.runners.find((r) => r.id === runnerID);
	if (completeRunner === undefined) return courseData;

	const legToUpdate = completeRunner.legs[legNumber - 1];
	if (legToUpdate === null) return courseData;
	legToUpdate.manualRouteChoice = routechoiceToAttribute;

	// Update legs routechoices stats
	courseData.legs[legNumber - 1] = createRoutechoiceStatisticsForOneLeg(
		courseData.legs[legNumber - 1],
		legNumber,
		courseData.runners
	);

	try {
		await updateDoc(doc(db, 'coursesData', courseData.id, 'runners', runnerID), {
			legs: completeRunner.legs
		});
		await updateDoc(doc(db, 'coursesData', courseData.id), {
			legs: serializeNestedArraysInLegs(courseData.legs)
		});

		return courseData;
	} catch (error) {
		alert('An error occured while manually updating the routechoice.');
		console.error(error);
		return courseData;
	}
}
