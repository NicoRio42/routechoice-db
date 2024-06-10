<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmSubmit } from '$lib/actions/confirm-submit.js';
	import Paginator from '$lib/components/Paginator.svelte';
	import SearchField from '$lib/components/form-fields/SearchField.svelte';
	import TagsSelect from '$lib/components/form-fields/TagsSelect.svelte';
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

	<div class="mt-4 max-w-150 mx-auto">
		{#each data.events as event (event.id)}
			<a href="/events/{event.id}/map" class="contents" style:--pico-color="var(--pico-h1-color)">
				<article class="shadow-xl hover:shadow-2xl py-6 md:px-6">
					<div class="flex gap-4 justify-between">
						<div>
							<h2 class="text-5 font-500">{event.name}</h2>

							{#if new Date(event.startTime).getTime() === new Date(event.publishTime).getTime()}
								<p class="flex items-center gap-2">
									<i class="i-carbon-calendar block w-6 h-6 text-gray"></i>

									{new Date(event.startTime).toLocaleString()}
								</p>
							{:else if new Date(event.startTime).toLocaleDateString() === new Date(event.publishTime).toLocaleDateString()}
								<p class="flex items-center gap-2">
									<i class="i-carbon-calendar block w-6 h-6 text-gray"></i>

									{new Date(event.startTime).toLocaleDateString()}
								</p>

								<div class="flex gap-4">
									<p>
										<small class="text-gray">Start</small>
										{new Date(event.startTime).toLocaleTimeString()}
									</p>

									<p>
										<small class="text-gray">Publish</small>
										{new Date(event.publishTime).toLocaleTimeString()}
									</p>
								</div>
							{:else}
								<p>{new Date(event.startTime).toLocaleString()}</p>

								<p>{new Date(event.publishTime).toLocaleString()}</p>
							{/if}

							<p class="mb-0">
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
							</p>
						</div>

						{#if data.user?.role === 'admin'}
							<div class="flex flex-col justify-between">
								<p class="m-0">
									<a role="button" class="outline m-0 p-2" href="/events/{event.id}/manager">
										<i class="i-carbon-settings w-5 h-5 block" />
									</a>
								</p>

								<!-- svelte-ignore a11y-no-static-element-interactions -->
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<div on:click={(e) => e.stopPropagation()}>
									<form
										action="?/deleteEvent"
										method="post"
										use:confirmSubmit={'Are you sure to delete this event?'}
										use:enhance
										class="m-0 p-0"
									>
										<input type="hidden" name="eventId" value={event.id} />

										<button type="submit" class="btn-unset p-2">
											<i class="i-carbon-trash-can w-5 h-5 block" />
										</button>
									</form>
								</div>
							</div>
						{/if}
					</div>
				</article>
			</a>
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
