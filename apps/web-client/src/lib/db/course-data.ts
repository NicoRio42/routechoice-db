import {
	Firestore,
	collection,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query
} from 'firebase/firestore/lite';
import type { CourseData, Runner } from 'orienteering-js/models';
import {
	courseDataWithoutRunnersValidator,
	parseNestedArraysInLegs,
	runnerValidator
} from 'orienteering-js/models';

export async function getCourseData(courseID: string, db: Firestore): Promise<CourseData> {
	const runnersRef = collection(db, 'coursesData', courseID, 'runners');
	const runnersQuery = query(runnersRef, orderBy('rank', 'desc'));

	const [courseDataDocument, runnersCollection] = await Promise.all([
		getDoc(doc(db, 'coursesData', courseID)),
		getDocs(runnersQuery)
	]);

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

	return { ...courseDataWithoutRunners, runners };
}
