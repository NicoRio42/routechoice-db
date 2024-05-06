<script lang="ts">
	import SelectField from '$lib/components/form-fields/SelectField.svelte';
	import DateField from '$lib/components/form-fields/DateField.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { splitTimesFromWinsplitsSchema } from './schema.js';
	import { timezones } from '$lib/components/form-fields/timezones.js';
	import { onMount } from 'svelte';

    export let data;

	const form = superForm(data.form, {
		validators: splitTimesFromWinsplitsSchema,
		taintedMessage: null
	});

	const { delayed, enhance, form: formStore, errors } = form;

	type WinsplitObject = {id: string, description: string}
	let events: WinsplitObject[] = []
	let classes: WinsplitObject[] = []
	let eventsAreLoading = false;
	let classesAreLoading = false;

	$formStore.date = data.event.startTime.toISOString().split('T')[0]

	$formStore.timezone = (
		timezones.find((tz) => tz.name === 'Europe/Brussels') ?? timezones[0]
	).offset;

	async function handleDateChange() {
		eventsAreLoading = true;

		try {
			events = await (await fetch(`/api/winsplits/events?date=${$formStore.date}`) ).json()
			eventsAreLoading = false;

			const date = new Date($formStore.date);
			const timeZoneOffset = date.getTimezoneOffset();

			const foundTimeZone = timezones.find(
				(tz) => tz.offsetInSeconds === -timeZoneOffset
			)?.offset;

			if (foundTimeZone !== undefined) $formStore.timezone = foundTimeZone;
		} catch(e) {
			console.error(e);
			eventsAreLoading = false;
		}
	}

	onMount(handleDateChange);

	async function handleEventChange() {
		classesAreLoading = true;

		try {
			classes = await (await fetch(`/api/winsplits/events/${$formStore.eventId}/classes`) ).json()
			classesAreLoading = false;
		} catch(e) {
			console.error(e);
			classesAreLoading = false;
		}
	}
</script>

<main class="container max-w-2xl">
	<h1 class="mt-4 md:mt-15">Load split times from Winsplits</h1>

	<p>
		&#62;
		<a href="/events/{data.event.id}/manager">Event manager: {data.event.name}</a>

		&#62;
		<a href="/events/{data.event.id}/manager/split-times">Split times</a>

		&#62;
		<a href="/events/{data.event.id}/manager/split-times/winsplits">From Winsplits</a>
	</p>

	<form class="mt-15" method="post" use:enhance>
		<DateField {form} field="date" label="Date" on:change={handleDateChange}></DateField>

		<SelectField {form} field="eventId" label="Event" loading={eventsAreLoading} on:change={handleEventChange}>
			{#each events as {id, description} (id)}
				<option value={id}>{description}</option>
			{/each}
		</SelectField>

		<SelectField {form} field="classId" label="Class" loading={classesAreLoading}>
			{#each classes as {id, description} (id)}
				<option value={id}>{description}</option>
			{/each}
		</SelectField>

		<SelectField {form} field="timezone" label="Time zone">
			{#each timezones as timezone}
				<option value={timezone.offset}>{timezone.name} {timezone.offset}</option>
			{/each}
		</SelectField>

		<div class="flex justify-end">
			<button type="submit" aria-busy={$delayed}> Load splits </button>
		</div>

		{#if $errors._errors !== undefined && $errors._errors.length !== 0}
			<ul class="list-none">
				{#each $errors._errors as error}
					<li class="error">{error}</li>
				{/each}
			</ul>
		{/if}
	</form>
</main>
