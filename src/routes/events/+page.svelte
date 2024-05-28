<script lang="ts">
	import { dev } from '$app/environment';
	import { enhance } from '$app/forms';
	import { confirmSubmit } from '$lib/actions/confirm-submit.js';
	import Paginator from '$lib/components/Paginator.svelte';
	import SearchField from '$lib/components/form-fields/SearchField.svelte';
	import TagsSelect from '$lib/components/form-fields/TagsSelect.svelte';
	import { SPLITTIMES_BASE_URL, SPLITTIMES_BASE_URL_DEV } from '$lib/constants.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { filterEventFormSchema } from './schema';

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

	<figure class="mt-4 overflow-auto">
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Start time</th>
					<th>Publish time</th>
					<th>Tags</th>
					<th />

					{#if data.user?.role === 'admin'}
						<th />
						<th />
					{/if}
				</tr>
			</thead>

			<tbody>
				{#each data.events as event (event.id)}
					{@const splittimesBaseUrl = dev ? SPLITTIMES_BASE_URL_DEV : SPLITTIMES_BASE_URL}

					<tr>
						<td>
							<a href="/events/{event.id}">{event.name}</a>
						</td>

						<td>{new Date(event.startTime).toLocaleString()}</td>

						<td>{new Date(event.publishTime).toLocaleString()}</td>

						<td>
							{#each event.tagIds as tagId}
								{@const tag = data.tags.find((t) => t.id === tagId)}

								{#if tag !== undefined}
									<span
										style:background-color={tag.color}
										class="mr-1 px-1 rounded text-white nowrap"
									>
										{tag.name}
									</span>
								{/if}
							{/each}
						</td>

						<td class="text-right">
							<a
								href="{splittimesBaseUrl}/{dev
									? 'routechoice-db-dev'
									: 'routechoice-db'}/{event.id}/classes/1/table"
								target="_blank"
								rel="noreferrer"
							>
								<i class="i-carbon-table-shortcut w-5 h-5 block" />
							</a>
						</td>

						{#if data.user?.role === 'admin'}
							<td class="text-right">
								<a href="/events/{event.id}/manager">
									<i class="i-carbon-settings-adjust w-5 h-5 block" />
								</a>
							</td>

							<td class="text-right">
								<form
									action="?/deleteEvent"
									method="post"
									use:confirmSubmit={'Are you sure to delete this event?'}
									use:enhance
									class="m-0 p-0"
								>
									<input type="hidden" name="eventId" value={event.id} />

									<button type="submit" class="btn-unset">
										<i class="i-carbon-trash-can w-5 h-5 block" />
									</button>
								</form>
							</td>
						{/if}
					</tr>
				{:else}
					<tr>
						<td colspan="7" class="text-center py-10"> No events for these filters. </td>
					</tr>
				{/each}
			</tbody>
		</table>
	</figure>

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
