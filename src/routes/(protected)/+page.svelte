<script lang="ts">
	import { page } from '$app/stores';
	import TagsSelect from '$lib/components/form-fields/TagsSelect.svelte';
	import { SPLITTIMES_BASE_URL } from '$lib/constants.js';
	import { RolesEnum } from '$lib/models/enums/roles.enum.js';
	import { superForm } from 'sveltekit-superforms/client';

	export let data;

	let formElement: HTMLFormElement;

	const form = superForm(data.form, {
		taintedMessage: null
	});

	function handleTagsToggle(e: CustomEvent<string>) {
		const selectedTags = e.detail.split(',');
		const currentTags = $page.url.searchParams.get('tags')?.split(',') ?? [];

		const tagsDidNotChange =
			currentTags.every((currentTag) => selectedTags.includes(currentTag)) &&
			selectedTags.every((selectedTag) => currentTags.includes(selectedTag));

		if (tagsDidNotChange) return;

		formElement.submit();
	}
</script>

<svelte:head>
	<title>Routechoice DB</title>
</svelte:head>

<main class="container flex-shrink-0 flex-grow-1 px-4">
	<h1 class="mt-4 mb-6">Events</h1>

	{#if data.user.role === RolesEnum.Enum.admin}
		<a href="events/add" role="button"> Add new event </a>
	{/if}

	<form method="get" class="m-0 p-0 mt-4 max-w-100% md:max-w-100" bind:this={formElement}>
		<TagsSelect
			{form}
			allTags={data.tags}
			field="tags"
			label="Tags"
			on:toggle={handleTagsToggle}
			initialTagsIds={$page.url.searchParams.get('tags')?.split(',') ?? []}
		/>
	</form>

	<figure class="mt-4">
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Start time</th>
					<th>Publish time</th>
					<th>Tags</th>
					<th />

					{#if data.user.role === RolesEnum.Enum.admin}
						<th />
						<th />
					{/if}
				</tr>
			</thead>

			<tbody>
				{#each data.events as event (event.id)}
					<tr>
						<td>
							<a href="/events/{event.id}">{event.name}</a>
						</td>

						<td>{new Date(event.startTime).toLocaleString()}</td>

						<td>{new Date(event.publishTime).toLocaleString()}</td>

						<td>
							{#each event.tags as { fkTag: tagId }}
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
								href="{SPLITTIMES_BASE_URL}/routechoice-db-dev/{event.id}/classes/1"
								target="_blank"
								rel="noreferrer"
							>
								<i class="i-carbon-table-shortcut w-5 h-5 block" />
							</a>
						</td>

						{#if data.user.role === RolesEnum.Enum.admin}
							<td class="text-right">
								<a href="/events/{event.id}/manager">
									<i class="i-carbon-settings-adjust w-5 h-5 block" />
								</a>
							</td>

							<td class="text-right">
								<form action="/events/{event.id}/delete" method="post" class="m-0 p-0">
									<button type="submit" class="btn-unset">
										<i class="i-carbon-trash-can w-5 h-5 block" />
									</button>
								</form>
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</figure>
</main>
