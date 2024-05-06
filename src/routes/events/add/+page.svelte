<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { addEventSchema } from './schema.js';
	import TextField from '$lib/components/form-fields/TextField.svelte';
	import UrlField from '$lib/components/form-fields/UrlField.svelte';
	import DateTimeField from '$lib/components/form-fields/DateTimeField.svelte';
	import { browser } from '$app/environment';
	import {
		extractLiveProviderAndEventIdFromUrl,
		formatDateTimeForDateTimeInput
	} from '$lib/helpers.js';
	import { loggatorEventSchema } from 'orienteering-js/models';
	import TagsSelect from '$lib/components/form-fields/TagsSelect.svelte';
	import { onMount } from 'svelte';

	export let data;

	const form = superForm(data.form, {
		taintedMessage: null
	});

	const { delayed, enhance, form: formStore, errors } = form;
	$formStore.timeZoneOffset = new Date().getTimezoneOffset();

	$: if (browser) fetchEvent($formStore.liveProviderUrl);

	let previousEventUrl: string;
	let recentEvents: {url: string, name: string}[] = [];

	async function fetchEvent(eventUrl: string) {
		if (eventUrl === '' || eventUrl === previousEventUrl) return;
		previousEventUrl = eventUrl;
		const [provider, eventId] = extractLiveProviderAndEventIdFromUrl(eventUrl);
		const url = `/api/live-events/${provider}/${eventId}`;
		const response = await fetch(url);

		if (!response.ok) return;

		const event = loggatorEventSchema.parse(await response.json());

		if ($formStore.name === "" || $formStore.name === undefined || $formStore.name === null) {
			$formStore.name = event.event.name;
		}

		// TODO: Fix this
		$formStore.startTime = formatDateTimeForDateTimeInput(new Date(event.event.start_date));
		$formStore.publishTime = formatDateTimeForDateTimeInput(new Date(event.event.publish_date));
		$formStore.finishTime = formatDateTimeForDateTimeInput(new Date(event.event.end_date));
	}

	onMount(async () => {
		recentEvents = await ((await fetch("/api/live-events/loggator")).json())
	})
</script>

<form method="POST" use:enhance novalidate class="pb-8 pt-4">
	<h1>Create a new Event</h1>

	<UrlField {form} field="liveProviderUrl" label="Live provider URL" list="recent-events" />

	<datalist id="recent-events">
		{#each recentEvents as {url, name} }
			<option value={url}>{name}</option>
		{/each}
	</datalist>

	<TextField {form} field="name" label="Name" />

	<input name="timeZoneOffset" type="hidden" bind:value={$formStore.timeZoneOffset} />

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
