<script lang="ts">
	import { browser } from '$app/environment';
	import NavBar from '$lib/components/NavBar.svelte';
	import { pushNotification } from '$lib/components/Notifications.svelte';
	import DateTimeField from '$lib/components/form-fields/DateTimeField.svelte';
	import GlobalFormErrors from '$lib/components/form-fields/GlobalFormErrors.svelte';
	import SubmitButton from '$lib/components/form-fields/SubmitButton.svelte';
	import TagsSelect from '$lib/components/form-fields/TagsSelect.svelte';
	import TextField from '$lib/components/form-fields/TextField.svelte';
	import UrlField from '$lib/components/form-fields/UrlField.svelte';
	import { extractLiveProviderAndEventIdFromUrl } from '$lib/helpers.js';
	import { onMount } from 'svelte';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { superForm } from 'sveltekit-superforms/client';
	import { addEventSchema } from './schema.js';

	export let data;

	const form = superForm(data.form, {
		validators: zodClient(addEventSchema)
	});

	const { delayed, enhance, form: formStore } = form;

	$: if (browser) fetchEvent($formStore.liveProviderUrl);

	let previousEventUrl: string;
	let recentEvents: { url: string; name: string }[] = [];
	let loggatorLoading = false;
	let loggatorLoadingTooFast = false;

	$: if (loggatorLoading) {
		loggatorLoadingTooFast = true;
		setTimeout(() => (loggatorLoadingTooFast = false), 250);
	}

	async function fetchEvent(eventUrl: string | undefined) {
		if (eventUrl === undefined || eventUrl === '' || eventUrl === previousEventUrl) return;
		previousEventUrl = eventUrl;
		const [provider, eventId] = extractLiveProviderAndEventIdFromUrl(eventUrl);
		if (provider !== 'loggator') return;
		const url = `/api/live-events/${provider}/${eventId}`;

		loggatorLoading = true;
		const response = await fetch(url);

		if (!response.ok) {
			pushNotification('Could not load event informations from Loggator.', { type: 'error' });
			loggatorLoading = false;
			return;
		}

		const rawEvent = await response.json();
		const name = rawEvent?.event?.name;
		const startDate = new Date(rawEvent?.event?.start_date);
		const publishDate = new Date(rawEvent?.event?.publish_date);
		const endDate = new Date(rawEvent?.event?.end_date);

		if (
			name === undefined ||
			!isValidDate(startDate) ||
			!isValidDate(publishDate) ||
			!isValidDate(endDate)
		) {
			pushNotification('Could not decode event informations from Loggator.', { type: 'error' });
			loggatorLoading = false;
			return;
		}

		if ($formStore.name === '' || $formStore.name === undefined || $formStore.name === null) {
			$formStore.name = cleanupLoggatorEventName(name);
		}

		$formStore.startTime = startDate;
		$formStore.publishTime = publishDate;
		$formStore.finishTime = endDate;
		loggatorLoading = false;
	}

	function isValidDate(date: Date): boolean {
		return !isNaN(date.valueOf());
	}

	function cleanupLoggatorEventName(name: string): string {
		return name.replace(/^\d+/, '').trim().replace(/^-/, '').trim();
	}

	onMount(async () => {
		$formStore.timeZoneOffset = new Date().getTimezoneOffset();
		recentEvents = await (await fetch('/api/live-events/loggator')).json();
	});
</script>

<NavBar user={data.user} backLinkHref="/events" />

<main class="sm:mx-auto px-4 sm:w-120 my-6 pb-12">
	<form method="POST" use:enhance novalidate>
		<h1>Create a new Event</h1>

		<input type="hidden" name="timeZoneOffset" bind:value={$formStore.timeZoneOffset} />

		<UrlField {form} field="liveProviderUrl" label="Live provider URL" list="recent-events" />

		<datalist id="recent-events">
			{#each recentEvents as { url, name }}
				<option value={url}>{name}</option>
			{/each}
		</datalist>

		<TextField
			{form}
			loading={loggatorLoading && !loggatorLoadingTooFast}
			field="name"
			label="Name"
		/>

		<TagsSelect allTags={data.tags} {form} field="tags" label="Tags" />

		<DateTimeField
			{form}
			loading={loggatorLoading && !loggatorLoadingTooFast}
			field="startTime"
			label="Start time"
		/>

		<DateTimeField
			{form}
			loading={loggatorLoading && !loggatorLoadingTooFast}
			field="publishTime"
			label="Publish time"
		/>

		<DateTimeField
			{form}
			loading={loggatorLoading && !loggatorLoadingTooFast}
			field="finishTime"
			label="Finish time"
		/>

		<SubmitButton aria-busy={$delayed}>Add new event</SubmitButton>

		<GlobalFormErrors {form} />
	</form>
</main>
