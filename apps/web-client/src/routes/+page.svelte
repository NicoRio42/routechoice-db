<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import AddCourseDialog from '$lib/components/AddCourseDialog.svelte';
	import Table from '$lib/components/icons/Table.svelte';
	import Trash from '$lib/components/icons/Trash.svelte';
	import TagsSelect from '$lib/components/TagsSelect/TagsSelect.svelte';
	import type { Course } from '$lib/models/course';
	import type { Tag } from '$lib/models/tag';
	import userStore, { isUserAdminStore } from '$lib/stores/user.store';
	import { getFunctions, httpsCallable } from 'firebase/functions';
	import { onDestroy, onMount } from 'svelte';
	import type { Unsubscriber } from 'svelte/store';
	import { fade } from 'svelte/transition';

	export let data;

	let isAddCourseDialogOpen = false;
	let courseCurrentlyDeletedID: string | null = null;
	let isCourseDeletionLoading = false;
	let tags: Tag[] = [];

	const functions = getFunctions(undefined, 'europe-west1');
	const deleteCourse = httpsCallable(functions, 'deleteCourse');
	let unsub: Unsubscriber;

	onMount(() => {
		unsub = userStore.subscribe((user) => {
			if (user === null) {
				goto('/login');
			}
		});
	});

	async function handleDeleteCourse(course: Course) {
		if (!confirm('Are you sure to delete this course?')) {
			return;
		}

		courseCurrentlyDeletedID = course.id;
		isCourseDeletionLoading = true;

		try {
			await deleteCourse(course);
			invalidate('courses');
		} catch (error) {
			alert('An error occured while deleting the course.');
			console.error(error);
		} finally {
			courseCurrentlyDeletedID = null;
			isCourseDeletionLoading = false;
		}
	}

	function handleTagsSelected(event: CustomEvent<Tag[]>) {
		tags = event.detail;
		goto(`${location.pathname}?tags=${tags.map((t) => t.id).join(',')}`);
	}

	onDestroy(() => {
		if (unsub !== undefined) unsub();
	});
</script>

<svelte:head>
	<title>Routechoice DB</title>
</svelte:head>

{#if isAddCourseDialogOpen}
	<AddCourseDialog bind:isAddCourseDialogOpen on:onAddCourse={() => invalidate('courses')} />
{/if}

<main class="container" in:fade={{ duration: 500 }}>
	<h1>Courses</h1>

	<TagsSelect on:tagsSelect={handleTagsSelected} />

	<div class="table-wrapper">
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Date</th>
					<th>Tags</th>

					{#if $isUserAdminStore}
						<th />
						<th />
					{/if}
				</tr>
			</thead>

			<tbody>
				{#each data.courses as course (course.id)}
					<tr>
						<td>
							<a class="course-link" href={`/courses/#/${course.id}`}>{course.name}</a>
							{#if $isUserAdminStore}
								&nbsp;<a href={`#/courses/${course.id}`}>(beta)</a>
							{/if}
						</td>

						<td>{new Date(course.date).toLocaleDateString()}</td>

						<td>
							{#each course.tags as tag}
								<span style:background-color={tag.color} class="tag">{tag.name}</span>
							{/each}
						</td>

						{#if $isUserAdminStore}
							<td class="action-row">
								<a class="action-icon" href={`#/courses/${course.id}/course-manager`}><Table /></a>
							</td>

							<td class="action-row">
								<button
									aria-busy={courseCurrentlyDeletedID === course.id && isCourseDeletionLoading}
									disabled={isCourseDeletionLoading}
									on:click={() => handleDeleteCourse(course)}
									class="action-icon"
									type="button"><Trash /></button
								>
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if $isUserAdminStore}
		<button on:click={() => (isAddCourseDialogOpen = true)} class="add-course-button" type="button"
			>Add new course</button
		>
	{/if}
</main>

<style>
	.add-course-button {
		width: fit-content;
		margin-top: 1rem;
	}

	.course-link {
		margin-right: 1rem;
	}

	.action-row {
		text-align: right;
	}

	.action-icon {
		display: contents;
		background-color: transparent;
		color: var(--h1-color);
		margin: 0;
		padding: 0;
		cursor: pointer;
	}

	.table-wrapper {
		overflow-x: auto;
		position: relative;
	}

	.tag {
		margin-right: 0.5rem;
		color: white;
		padding: 0 0.5rem;
		white-space: nowrap;
		border-radius: 0.25rem;
	}
</style>
