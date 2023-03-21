import { getCourse } from '$lib/db/course';
import { getCourseData } from '$lib/db/course-data';
import { createUserLoggedInPromise } from '$lib/stores/user.store';
import { redirect } from '@sveltejs/kit';
import { getFirestore } from 'firebase/firestore/lite';

const db = getFirestore();

export const load = async ({ params }) => {
	const isLoggedIn = await createUserLoggedInPromise();
	if (!isLoggedIn) throw redirect(307, '/login');

	return {
		course: getCourse(params.courseId, db),
		courseData: getCourseData(params.courseId, db)
	};
};
