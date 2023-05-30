import { courseValidator, type Course } from '$lib/models/course';
import { collection, getDocs, getFirestore, orderBy, query, where } from 'firebase/firestore/lite';
import type { PageLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import firebaseConfig from '../environments/environment';
import { initializeApp } from 'firebase/app';
import { createUserLoggedInPromise } from '$lib/stores/user.store';
import type { Tag } from '$lib/models/tag';
import { TAGS } from '$lib/components/TagsSelect/tags';

initializeApp(firebaseConfig);
const db = getFirestore();

export const load = (async ({ url, depends }) => {
	depends('courses');

	const isLoggedIn = await createUserLoggedInPromise();
	if (!isLoggedIn) throw redirect(307, '/login');

	const tags = getTagsFromSearchParams(url);
	const coursesRef = collection(db, 'courses');

	const queryConstraints = [];
	if (tags.length !== 0) queryConstraints.push(where('tags', 'array-contains-any', tags));

	queryConstraints.push(orderBy('date', 'desc'));
	const q = query(coursesRef, ...queryConstraints);

	try {
		const querySnapshot = await getDocs(q);
		const courses: Course[] = [];

		querySnapshot.forEach((doc) => {
			try {
				courses.push(courseValidator.parse({ ...doc.data(), id: doc.id }));
			} catch (error) {
				console.error(error);
				throw error;
			}
		});

		return { courses, tags };
	} catch (e) {
		const errorText =
			typeof e === 'object' ? JSON.stringify(e) : typeof e === 'string' ? e : 'An error occured';

		throw error(500, errorText);
	}
}) satisfies PageLoad;

function getTagsFromSearchParams(url: URL): Tag[] {
	const tagsString = url.searchParams.get('tags');
	if (tagsString === null || tagsString === '') return [];
	const tagsIds = tagsString.split(',');
	return TAGS.filter((tag) => tagsIds.includes(tag.id));
}
