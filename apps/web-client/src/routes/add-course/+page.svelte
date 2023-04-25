<script lang="ts">
	import { goto } from '$app/navigation';
	import TagsSelect from '$lib/components/TagsSelect/TagsSelect.svelte';
	import type { Tag } from '$lib/models/tag';
	import type { CourseDataWithoutRunners } from '$lib/o-utils/models/course-data';
	import { formatDateForDateInput } from '$lib/utils/date';
	import { doc, getFirestore, setDoc } from 'firebase/firestore/lite';

	let name = '';
	let liveProviderURL = '';
	let tags: Tag[] = [];
	const today = new Date();
	let date = formatDateForDateInput(today);
	let loading = false;
	const db = getFirestore();
	const allowedOrigins = ['https://events.loggator.com', 'https://live.tractrac.com'];

	async function handleSubmit(): Promise<void> {
		if (name === '') {
			alert('Name is required.');
			return;
		}

		let url: URL;
		let id: string;

		try {
			url = new URL(liveProviderURL);

			if (!allowedOrigins.includes(url.origin)) {
				alert('Only Loggator and Tractrac are supported currently.');
				return;
			}

			const lastPathPart = url.pathname.split('/').at(-1);
			if (lastPathPart === undefined) throw new Error('Invalid URL');
			id = `loggator-${lastPathPart}-${crypto.randomUUID()}`;
		} catch {
			alert('Wrong format for your url.');
			return;
		}

		const timeStamp = new Date(date).getTime();

		const courseData: CourseDataWithoutRunners = {
			id,
			course: [],
			legs: [],
			map: null,
			timeOffset: 0,
			statistics: null
		};

		const courseWithoutID = {
			name,
			liveProviderURL: liveProviderURL,
			date: timeStamp,
			tags
		};

		loading = true;

		try {
			await setDoc(doc(db, 'coursesData', id), courseData);
			await setDoc(doc(db, 'courses', id), courseWithoutID);
			goto(`/courses/${id}/manager/course-and-routechoices`);
		} catch (error) {
			alert('An error occured while creating the course.');
			console.error(error);
			loading = false;
		}
	}

	function handleTagsSelected(event: CustomEvent<Tag[]>) {
		tags = event.detail;
	}
</script>

<form on:submit|preventDefault={handleSubmit}>
	<h1>Add new course</h1>

	<label>
		Course name

		<input bind:value={name} type="text" />
	</label>

	<label>
		Date

		<input bind:value={date} type="date" />
	</label>

	<label>
		Loggator or Tractrac URL

		<input bind:value={liveProviderURL} type="text" />
	</label>

	<label>
		Tags

		<TagsSelect on:tagsSelect={handleTagsSelected} />
	</label>

	<p class="buttons-wrapper">
		<a href="/" class="outline" role="button">Cancel</a>

		<button aria-busy={loading} type="submit">Add</button>
	</p>
</form>

<style>
	form {
		max-width: 25rem;
		margin: 2em auto;
	}

	.buttons-wrapper {
		margin-top: 2rem;
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.buttons-wrapper button {
		width: fit-content;
	}
</style>
