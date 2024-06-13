<script>
	import ManagerListItem from './ManagerListItem.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import { enhance } from '$app/forms';
	import { confirmSubmit } from '$lib/actions/confirm-submit';

	export let data;
</script>

<NavBar user={data.user} eventName={data.event.name} backLinkHref="/events" />

<main class="sm:mx-auto px-4 sm:w-120 my-6 pb-12">
	<h1 class="mb-8">Manage event</h1>

	<h2 class="text-5.5 font-500">Général</h2>

	<ul>
		<ManagerListItem href="/events/{data.event.id}/manager/general/event-informations">
			Event informations
		</ManagerListItem>

		<ManagerListItem href="/events/{data.event.id}/manager/general/files">Files</ManagerListItem>
	</ul>

	<h2 class="text-5.5 font-500">Course and routechoices</h2>

	<ul>
		<ManagerListItem
			href="/events/{data.event.id}/manager/course-and-routechoices/2d-rerun-export"
			disabled={data.event.legs.length !== 0}
			disabledMessage="Already uploaded"
		>
			From 2dRerun export
		</ManagerListItem>

		<ManagerListItem
			href="/events/{data.event.id}/manager/course-and-routechoices/ocad-export"
			disabled={data.event.legs.length !== 0}
			disabledMessage="Already uploaded"
		>
			From OCAD export
		</ManagerListItem>

		<ManagerListItem
			href="/events/{data.event.id}/manager/course-and-routechoices/manage-course"
			disabled={data.event.legs.length === 0}
			disabledMessage="No course"
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

	<form
		action="?/deleteEvent"
		method="post"
		use:confirmSubmit={'Are you sure to delete this event?'}
		use:enhance
		class="mx-0 mt-8 mb-12 p-0"
	>
		<input type="hidden" name="eventId" value={data.event.id} />

		<button type="submit" class="btn-unset flex items-center gap-2 text-del-color">
			<i class="i-carbon-trash-can w-5 h-5 block" />

			Delete
		</button>
	</form>
</main>

<style>
	h2 {
		margin: 1.75rem 0 1.25rem;
	}

	ul {
		padding-left: 0;
		margin-bottom: 0;
	}
</style>
