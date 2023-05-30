<script lang="ts">
	import { goto } from '$app/navigation';
	import TagsSelect from '$lib/components/TagsSelect/TagsSelect.svelte';
	import { GPS_PROVIDERS } from '$lib/constants.js';
	import type { Course } from '$lib/models/course.js';
	import type { Tag } from '$lib/models/tag.js';
	import { formatDateForDateInput } from '$lib/utils/date.js';
	import { doc, getFirestore, writeBatch } from 'firebase/firestore/lite';
	import type { CourseDataWithoutRunners } from 'orienteering-js/models';

	let name = '';
	let liveProviderURL = '';
	let tags: Tag[] = [];
	const today = new Date();
	let date = formatDateForDateInput(today);
	const db = getFirestore();

	let loading = false;
	let showRequiredNameErrorMessage: boolean | null = null;
	let showURLErrorMessage: boolean | null = null;

	async function handleSubmit(): Promise<void> {
		showRequiredNameErrorMessage = null;
		showURLErrorMessage = null;

		if (name === '') {
			showRequiredNameErrorMessage = true;
			return;
		}

		if (!isURLValid(liveProviderURL)) {
			showURLErrorMessage = true;
			return;
		}

		let id: string;

		try {
			const url = new URL(liveProviderURL);

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

		const courseWithoutID: Omit<Course, 'id'> = {
			name,
			liveProviderURL: liveProviderURL,
			date: timeStamp,
			tags
		};

		loading = true;

		try {
			const batch = writeBatch(db);

			batch.set(doc(db, 'coursesData', id), courseData);
			batch.set(doc(db, 'courses', id), courseWithoutID);

			await batch.commit();

			goto(`/courses/${id}/manager/course-and-routechoices`);
		} catch (error) {
			alert('An error occured while creating the course.');
			console.error(error);
			loading = false;
		}
	}

	function isURLValid(url: string): boolean {
		try {
			const urlObject = new URL(url);

			return GPS_PROVIDERS.some((p) => p.url === urlObject.origin);
		} catch (e) {
			return false;
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
		<input
			bind:value={name}
			type="text"
			aria-invalid={showRequiredNameErrorMessage}
			on:input={() => {
				if (showRequiredNameErrorMessage !== null) {
					showRequiredNameErrorMessage = name === '';
				}
			}}
		/>

		{#if showRequiredNameErrorMessage}
			<small class="error">Name is required</small>
		{/if}
	</label>

	<label>
		Date
		<input bind:value={date} type="date" />
	</label>

	<label>
		Loggator or Tractrac URL
		<input
			placeholder="Loggator, GPS seuranta or Tractrac url"
			bind:value={liveProviderURL}
			type="text"
			aria-invalid={showURLErrorMessage}
			on:input={() => {
				if (showURLErrorMessage !== null) {
					showURLErrorMessage = !isURLValid(liveProviderURL);
				}
			}}
		/>

		{#if showURLErrorMessage}
			<small class="error">Only Loggator, GPS seuranta or Tractrac urls are supported</small>
		{/if}
	</label>

	<!-- svelte-ignore a11y-label-has-associated-control -->
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
		padding: 0 0.5rem;
	}

	h1 {
		margin-bottom: 1rem;
	}

	.buttons-wrapper {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.buttons-wrapper button {
		width: fit-content;
		margin: 0;
	}
</style>
