import { courseValidator, type Course } from '$lib/models/course';
import { collection, getDocs, getFirestore, orderBy, query, where } from 'firebase/firestore/lite';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import firebaseConfig from '../environments/environment';
import { initializeApp } from 'firebase/app';

const fireBaseApp = initializeApp(firebaseConfig);
const db = getFirestore();

export const load = (async ({ url, depends }) => {
	depends('courses');

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

		return { courses };
	} catch (e) {
		const errorText =
			typeof e === 'object' ? JSON.stringify(e) : typeof e === 'string' ? e : 'An error occured';
		throw error(500);
	}
}) satisfies PageLoad;

function getTagsFromSearchParams(url: URL): string[] {
	const tagsString = url.searchParams.get('tags');
	if (tagsString === null) return [];
	return tagsString.split(',');
}
