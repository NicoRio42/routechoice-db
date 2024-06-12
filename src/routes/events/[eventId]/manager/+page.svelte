<script>
	import BackButton from '$lib/components/BackButton.svelte';
	import ManagerListItem from './ManagerListItem.svelte';

	export let data;
</script>

<main class="container max-w-100 my-8">
	<div class="flex items-center gap-4 mb-8">
		<BackButton href="/events" />

		<h1 class="m-0">Manage event</h1>
	</div>

	<h2 class="text-5.5 font-500">Général</h2>

	<ul>
		<ManagerListItem href="/events/{data.event.id}/manager/general-informations">
			Event informations
		</ManagerListItem>

		<ManagerListItem href="/events/{data.event.id}/manager/files">Files</ManagerListItem>
	</ul>

	<h2 class="text-5.5 font-500">Course and routechoices</h2>

	<ul>
		<ManagerListItem href="/events/{data.event.id}/manager/course-and-routechoices/2d-rerun-export">
			From 2dRerun export
		</ManagerListItem>

		<ManagerListItem href="/events/{data.event.id}/manager/course-and-routechoices/ocad-export">
			From OCAD export
		</ManagerListItem>

		<ManagerListItem
			href="/events/{data.event.id}/manager/course-and-routechoices/manage-course"
			disabled={data.event.legs.length === 0}
		>
			Manage course
		</ManagerListItem>
	</ul>

	<h2 class="text-5.5 font-500">Split times</h2>

	<ul>
		<ManagerListItem href="/events/{data.event.id}/manager/split-times/local-file">
			From local file
		</ManagerListItem>

		<ManagerListItem href="/events/{data.event.id}/manager/split-times/winsplits">
			From Winsplits
		</ManagerListItem>

		<ManagerListItem href="/events/{data.event.id}/manager/split-times/runners-attribution">
			Runner attribution
		</ManagerListItem>
	</ul>
</main>

<style>
	h2 {
		margin: 1.75rem 0 1.25rem;
	}

	ul {
		padding-left: 0;
		margin-bottom: 0;
	}

	ul:last-child {
		margin-bottom: 3rem;
	}
</style>
