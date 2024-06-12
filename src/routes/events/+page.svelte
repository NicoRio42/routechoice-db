<script lang="ts">
	import Paginator from '$lib/components/Paginator.svelte';
	import SearchField from '$lib/components/form-fields/SearchField.svelte';
	import TagsSelect from '$lib/components/form-fields/TagsSelect.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { filterEventFormSchema } from './schema';
	import EventCard from './EventCard.svelte';

	export let data;

	const form = superForm(data.form, {
		validators: zodClient(filterEventFormSchema)
	});
</script>

<svelte:head>
	<title>Routechoice DB</title>
</svelte:head>

<main class="container flex-shrink-0 flex-grow-1 px-4 pb4">
	<header class="max-w-150 mx-auto">
		<div class="flex items-center justify-between">
			<h1 class="mt-4 mb-6">Events</h1>

			{#if data.user?.role === 'admin'}
				<a href="events/add" role="button" class="!flex items-center gap-1 p2">
					<i class="i-carbon-add inline-block w6 h6"></i>

					New
				</a>
			{/if}
		</div>

		<form id="filter-form" method="get" class="m-0 p-0 mt-4 max-w-100% filter-form">
			<TagsSelect {form} allTags={data.tags} field="tags" label="Tags" />

			<SearchField
				{form}
				field="search"
				class="!mb0 !rounded-[var(--pico-border-radius)]"
				label="Search"
				placeholder="Search in names"
			/>
		</form>

		<button
			type="submit"
			form="filter-form"
			class="outline !w-fit flex items-center gap-1 p2 ml-auto my4"
		>
			<i class="i-carbon-filter inline-block w6 h6"></i>

			Filter
		</button>
	</header>

	<div class="mt-10 max-w-150 mx-auto">
		{#each data.events as event (event.id)}
			<EventCard {event} tags={data.tags} user={data.user} filesPromise={data.filesPromise} />
		{:else}
			<tr>
				<p class="text-center py-10">No events for these filters.</p>
			</tr>
		{/each}
	</div>

	<Paginator pageNumber={data.pageNumber} isLastPage={data.isLastPage}></Paginator>
</main>

<style>
	.filter-form :global(label) {
		margin-bottom: 0.5rem;
	}

	.filter-form :global(details) {
		margin-bottom: 0;
	}
</style>
