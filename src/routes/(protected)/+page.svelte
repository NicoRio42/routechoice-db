<script lang="ts">
	import TagComponent from '$lib/components/TagsSelect/Tag.svelte';
	import { SPLITTIMES_BASE_URL } from '$lib/constants.js';
	import { RolesEnum } from '$lib/models/enums/roles.enum.js';

	export let data;

	let courseCurrentlyDeletedID: string | null = null;
	let isCourseDeletionLoading = false;
	// let tags: Tag[] = data.tags;

	// function handleTagsSelected(event: CustomEvent<Tag[]>) {
	// 	tags = event.detail;
	// 	let url = location.pathname;
	// 	if (tags.length !== 0) url += `?tags=${tags.map((t) => t.id).join(',')}`;
	// 	goto(url);
	// }
</script>

<svelte:head>
	<title>Routechoice DB</title>
</svelte:head>

<main class="container flex-shrink-0 flex-grow-1">
	<h1 class="mt-4 mb-6">Events</h1>

	<!-- <TagsSelect on:tagsSelect={handleTagsSelected} /> -->

	{#if data.user.role === RolesEnum.Enum.admin}
		<a href="events/add" role="button"> Add new event </a>
	{/if}

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
							<!-- {#each course.tags as tag}
								<TagComponent {tag} />
							{/each} -->
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
