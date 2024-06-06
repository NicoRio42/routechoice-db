<script lang="ts">
	import { browser } from '$app/environment';
	import DateTimeField from '$lib/components/form-fields/DateTimeField.svelte';
	import TagsSelect from '$lib/components/form-fields/TagsSelect.svelte';
	import TextField from '$lib/components/form-fields/TextField.svelte';
	import UrlField from '$lib/components/form-fields/UrlField.svelte';
	import { extractLiveProviderAndEventIdFromUrl } from '$lib/helpers.js';
	import { loggatorEventSchema } from 'orienteering-js/models';
	import { onMount } from 'svelte';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { superForm } from 'sveltekit-superforms/client';
	import { addEventSchema } from './schema.js';

	export let data;

	const form = superForm(data.form, {
		validators: zodClient(addEventSchema)
	});

	const { delayed, enhance, form: formStore, errors } = form;

	$: if (browser) fetchEvent($formStore.liveProviderUrl);

	let previousEventUrl: string;
	let recentEvents: { url: string; name: string }[] = [];

	async function fetchEvent(eventUrl: string | undefined) {
		if (eventUrl === undefined || eventUrl === '' || eventUrl === previousEventUrl) return;
		previousEventUrl = eventUrl;
		const [provider, eventId] = extractLiveProviderAndEventIdFromUrl(eventUrl);
		if (provider !== 'loggator') return;
		const url = `/api/live-events/${provider}/${eventId}`;
		const response = await fetch(url);

		if (!response.ok) return;

		const event = loggatorEventSchema.parse(await response.json());

		if ($formStore.name === '' || $formStore.name === undefined || $formStore.name === null) {
			$formStore.name = event.event.name;
		}

		$formStore.startTime = new Date(event.event.start_date);
		$formStore.publishTime = new Date(event.event.publish_date);
		$formStore.finishTime = new Date(event.event.end_date);
	}

	onMount(async () => {
		recentEvents = await (await fetch('/api/live-events/loggator')).json();
	});
</script>

<form method="POST" use:enhance novalidate class="pb-8 pt-4">
	<h1>Create a new Event</h1>

	<UrlField {form} field="liveProviderUrl" label="Live provider URL" list="recent-events" />

	<datalist id="recent-events">
		{#each recentEvents as { url, name }}
			<option value={url}>{name}</option>
		{/each}
	</datalist>

	<TextField {form} field="name" label="Name" />

	<TagsSelect allTags={data.tags} {form} field="tags" label="Tags" />

	<DateTimeField {form} field="startTime" label="Start time" />

	<DateTimeField {form} field="publishTime" label="Publish time" />

	<DateTimeField {form} field="finishTime" label="Finish time" />

	<div class="flex justify-end">
		<button type="submit" class="w-fit ml-auto" aria-busy={$delayed}>Add new event</button>
	</div>

	{#each $errors._errors ?? [] as globalError}
		<p>
			<small class="error">{globalError}</small>
		</p>
	{/each}
</form>
