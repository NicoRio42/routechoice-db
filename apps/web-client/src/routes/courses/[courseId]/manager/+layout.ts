import { getCourse } from '$lib/db/course';
import { getCourseData } from '$lib/db/course-data';
import { createUserLoggedInPromise } from '$lib/stores/user.store';
import { redirect } from '@sveltejs/kit';
import { getFirestore } from 'firebase/firestore/lite';
import firebaseConfig from '../../../../environments/environment';
import { initializeApp } from 'firebase/app';

initializeApp(firebaseConfig);
const db = getFirestore();

export const load = async ({ params, depends }) => {
	depends('manager:course-data');
	const isLoggedIn = await createUserLoggedInPromise();
	if (!isLoggedIn) throw redirect(307, '/login');

	return {
		course: getCourse(params.courseId, db),
		courseData: getCourseData(params.courseId, db)
	};
};