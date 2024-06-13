<script lang="ts">
	import DateField from '$lib/components/form-fields/DateField.svelte';
	import SelectField from '$lib/components/form-fields/SelectField.svelte';
	import { timezones } from '$lib/components/form-fields/timezones.js';
	import { onMount } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { splitTimesFromWinsplitsSchema } from './schema.js';
	import GlobalFormErrors from '$lib/components/form-fields/GlobalFormErrors.svelte';
	import SubmitButton from '$lib/components/form-fields/SubmitButton.svelte';

	export let data;

	const form = superForm(data.form, {
		validators: zodClient(splitTimesFromWinsplitsSchema)
	});

	const { delayed, enhance, form: formStore, errors } = form;

	type WinsplitObject = { id: string; description: string };
	let events: WinsplitObject[] = [];
	let classes: WinsplitObject[] = [];
	let eventsAreLoading = false;
	let classesAreLoading = false;

	$formStore.date = data.event.startTime.toISOString().split('T')[0];

	$formStore.timezone = (timezones.find((tz) => tz.offset === '+01:00') ?? timezones[0]).offset;

	async function handleDateChange() {
		eventsAreLoading = true;

		try {
			events = await (await fetch(`/api/winsplits/events?date=${$formStore.date}`)).json();
			eventsAreLoading = false;

			const date = new Date($formStore.date);
			const timeZoneOffset = date.getTimezoneOffset();

			const foundTimeZone = timezones.find((tz) => tz.offsetInSeconds === -timeZoneOffset)?.offset;

			if (foundTimeZone !== undefined) $formStore.timezone = foundTimeZone;
		} catch (e) {
			console.error(e);
			eventsAreLoading = false;
		}
	}

	onMount(handleDateChange);

	async function handleEventChange() {
		classesAreLoading = true;

		try {
			classes = await (await fetch(`/api/winsplits/events/${$formStore.eventId}/classes`)).json();
			classesAreLoading = false;
		} catch (e) {
			console.error(e);
			classesAreLoading = false;
		}
	}
</script>

<main class="sm:mx-auto px-4 sm:w-120 my-6 pb-12">
	<h1>Load split times from Winsplits</h1>

	<form method="post" use:enhance>
		<DateField {form} field="date" label="Date" on:change={handleDateChange}></DateField>

		<SelectField
			{form}
			field="eventId"
			label="Event"
			loading={eventsAreLoading}
			on:change={handleEventChange}
		>
			{#each events as { id, description } (id)}
				<option value={id}>{description}</option>
			{/each}
		</SelectField>

		<SelectField {form} field="classId" label="Class" loading={classesAreLoading}>
			{#each classes as { id, description } (id)}
				<option value={id}>{description}</option>
			{/each}
		</SelectField>

		<SelectField {form} field="timezone" label="Time zone">
			{#each timezones as timezone}
				<option value={timezone.offset}>{timezone.offset}</option>
			{/each}
		</SelectField>

		<SubmitButton aria-busy={$delayed}>
			<i class="i-carbon-upload block w-5 h-5"></i> Load splits
		</SubmitButton>

		<GlobalFormErrors {form} />
	</form>
</main>
