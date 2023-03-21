<script lang="ts">
	import { goto } from '$app/navigation';
	import TagsSelect from '$lib/components/TagsSelect/TagsSelect.svelte';
	import { tagSchema, type Tag } from '$lib/models/tag';
	import { formatDateForDateInput } from '$lib/utils/date';
	import { doc, getFirestore, updateDoc } from 'firebase/firestore/lite';

	export let data;
	const db = getFirestore();

	let name = data.course.name;
	let date = formatDateForDateInput(new Date(data.course.date));
	let tags = data.course.tags;
	let initialTags = data.course.tags;
	let loading = false;

	function handleTagsSelected(event: CustomEvent<Tag[]>) {
		tags = event.detail;
	}

	async function handleSubmit() {
		const trimedName = name.trim();

		if (trimedName.length === 0) {
			alert('Please enter a valid name');
			return;
		}

		let dateObject: Date;

		try {
			dateObject = new Date(date);
		} catch (error) {
			alert('Wrong date format');
			console.error(error);
			return;
		}

		try {
			tags.forEach((tag) => tagSchema.parse(tag));
		} catch (error) {
			console.error(error);
			alert('Wrong tag format');
			return;
		}

		loading = true;

		try {
			await updateDoc(doc(db, 'courses', data.course.id), {
				name: trimedName,
				date: dateObject.getTime(),
				tags
			});

			goto(`/courses/${data.course.id}`);
		} catch (error) {
			console.error(error);
			alert("An error occured while updating the course's informations.");
		} finally {
			loading = false;
		}
	}
</script>

<main class="container">
	<h1>General informations: {data.course.name}</h1>

	<form on:submit|preventDefault={handleSubmit}>
		<label for="name"
			>Course name
			<input bind:value={name} type="text" id="name" />
		</label>

		<label for="date"
			>Date
			<input bind:value={date} type="date" id="date" />
		</label>

		<label
			>Tags
			<TagsSelect {initialTags} on:tagsSelect={handleTagsSelected} />
		</label>

		<button type="submit" aria-busy={loading} disabled={loading} class="submit-button">
			Change informations
		</button>
	</form>
</main>

<style>
	form {
		width: 50%;
		margin-bottom: 4rem;
	}

	.submit-button {
		width: fit-content;
	}

	@media screen and (max-width: 500px) {
		form {
			width: 100%;
		}
	}
</style>
