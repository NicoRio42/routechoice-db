<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmSubmit } from '$lib/actions/confirm-submit';
	import { pushNotification } from '$lib/components/Notifications.svelte';
	import type { Event, File, Tag } from '$lib/server/db/models';
	import type { User } from 'lucia';

	export let tags: Tag[];
	export let event: Event & { tagIds: string[] };
	export let user: User | null;
	export let filesPromise: Promise<File[]>;

	let loadingImage = false;
	let tooFast = false;

	$: if (loadingImage) {
		tooFast = true;
		setTimeout(() => (tooFast = false), 250);
	}

	async function downloadRawImage(eventId: string) {
		loadingImage = true;

		const imageUrl = await fetch(`/api/events/${eventId}/map`)
			.then((r) => r.text())
			.catch(() => {
				pushNotification('An error occured while downloading the raw image', {
					type: 'error',
					delayInSeconds: 5
				});

				loadingImage = false;
			});

		if (imageUrl === undefined) return;

		const link = document.createElement('a');
		link.setAttribute('href', imageUrl);
		link.setAttribute('target', '_blank');
		link.click();
		loadingImage = false;
	}
</script>

<a href="/events/{event.id}/map" class="contents" style:--pico-color="var(--pico-h1-color)">
	<article class="shadow-xl hover:shadow-2xl py-0 md:pl-6 pr-0 flex gap-4 justify-between">
		<div class="py-6">
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
					{@const tag = tags.find((t) => t.id === tagId)}

					{#if tag !== undefined}
						<span style:background-color={tag.color} class="mr-1 px-1 rounded text-white nowrap">
							{tag.name}
						</span>
					{/if}
				{/each}
			</p>
		</div>

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="flex flex-col justify-between" on:click={(e) => e.stopPropagation()}>
			{#if user?.role === 'admin'}
				<details class="dropdown m-0">
					<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
					<summary
						role="button"
						class="btn-unset m-0 flex items-end justify-end !after:hidden p-4 pr-3"
					>
						<i class="i-carbon-overflow-menu-vertical w-6 h-6 block" />
					</summary>

					<ul dir="rtl">
						<li>
							<a href="/events/{event.id}/manager" class="!flex items-center gap-2">
								<i class="i-carbon-settings w-5 h-5 block" />

								Manage
							</a>
						</li>

						<li class="hover:bg-pico-dropdown-hover-background-color">
							<form
								action="?/deleteEvent"
								method="post"
								use:confirmSubmit={'Are you sure to delete this event?'}
								use:enhance
								class="m-0 p-0"
							>
								<input type="hidden" name="eventId" value={event.id} />

								<button type="submit" class="btn-unset flex items-center gap-2 text-del-color">
									<i class="i-carbon-trash-can w-5 h-5 block" />

									Delete
								</button>
							</form>
						</li>
					</ul>
				</details>
			{/if}

			<details class="dropdown m-0 pr-4 pb-4 mt-auto">
				<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
				<summary role="button" class="outline m-0 p-2 h-fit !after:hidden">
					<i class="i-carbon-document-pdf w-5 h-5 block" />
				</summary>

				<ul dir="rtl">
					<li class="hover:bg-pico-dropdown-hover-background-color">
						<button
							class="btn-unset text-dropdown-color"
							dir="ltr"
							type="button"
							aria-busy={loadingImage && !tooFast}
							on:click={(e) => (e.preventDefault(), downloadRawImage(event.id))}
						>
							Raw image
						</button>
					</li>

					{#await filesPromise}
						<li aria-busy="true">Loading</li>
					{:then files}
						{@const eventFiles = files.filter((f) => f.fkEvent === event.id)}

						{#each eventFiles as file (file.id)}
							<li>
								<a href={file.url} target="_blank" rel="noopener noreferrer">
									{file.name}
								</a>
							</li>
						{/each}
					{/await}
				</ul>
			</details>
		</div>
	</article>
</a>
