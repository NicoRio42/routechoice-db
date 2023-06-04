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

	export let data;

	const form = superForm(data.form, {
		validators: addEventSchema,
		taintedMessage: null
	});

	const { delayed, enhance, form: formStore } = form;
	$formStore.timeZoneOffset = new Date().getTimezoneOffset();

	$: if (browser) fetchEvent($formStore.liveProviderUrl);

	let previousEventUrl: string;

	async function fetchEvent(eventUrl: string) {
		if (eventUrl === '' || eventUrl === previousEventUrl) return;
		previousEventUrl = eventUrl;
		const [provider, eventId] = extractLiveProviderAndEventIdFromUrl(eventUrl);
		const url = `/api/live-events/${provider}/${eventId}`;
		const response = await fetch(url);

		if (!response.ok) return;

		const event = loggatorEventSchema.parse(await response.json());

		$formStore.startTime = formatDateTimeForDateTimeInput(new Date(event.event.start_date));
		$formStore.publishTime = formatDateTimeForDateTimeInput(new Date(event.event.publish_date));
		$formStore.finishTime = formatDateTimeForDateTimeInput(new Date(event.event.end_date));
	}
</script>

<form method="POST" use:enhance novalidate>
	<h1>Create a new Event</h1>

	<TextField {form} field="name" label="Name" />

	<UrlField {form} field="liveProviderUrl" label="Live provider URL" />

	<input name="timeZoneOffset" type="hidden" bind:value={$formStore.timeZoneOffset} />

	<DateTimeField {form} field="startTime" label="Start time" />

	<DateTimeField {form} field="publishTime" label="Publish time" />

	<DateTimeField {form} field="finishTime" label="Finish time" />

	<button type="submit" aria-busy={$delayed}>Add new event</button>
</form>
