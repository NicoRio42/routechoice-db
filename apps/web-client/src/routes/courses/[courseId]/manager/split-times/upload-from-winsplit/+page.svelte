<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { createRunners } from '$lib/db/runners.js';
	import { parseIOFXML3SplitTimesFile } from '$lib/o-utils/split-times/parsers/iof-xml-3.js';
	import { formatDateForDateInput } from '$lib/utils/date.js';
	import { timeZones } from '$lib/utils/time-zones.js';
	import { getFirestore } from 'firebase/firestore/lite';
	import { functionsBaseURL } from '../../../../../../environments/environment.js';

	export let data;
	const db = getFirestore();

	interface WinsplitObject {
		id: string;
		name: string;
	}

	let loading = false;
	const url = `${functionsBaseURL}/getWinsplitData`;

	const parser = new DOMParser();

	let date: string | null = null;
	let eventId: number | null = null;
	let classInfo: WinsplitObject | null = null;
	let timeZone = timeZones[2];
	let timeOffset = 0;

	let eventsAreLoading = false;
	let classesAreLoading = false;

	let events: WinsplitObject[] = [];
	let classes: WinsplitObject[] = [];

	const eventDate = new Date(data.course.date);
	date = formatDateForDateInput(eventDate);
	handleDateChange();

	async function handleDateChange() {
		eventsAreLoading = true;
		events = [];
		eventId = null;
		classes = [];
		classInfo = null;

		// Trying to guess the timezone
		const dateObject = new Date(date!);
		const timeZoneOffset = dateObject.getTimezoneOffset();

		const foundTimeZone = timeZones.find((tz) => tz.timezoneOffset === timeZoneOffset);

		if (foundTimeZone !== undefined) timeZone = foundTimeZone;

		const response = await fetch(`${url}?date=${date}`);
		eventsAreLoading = false;

		const text = await response.text();

		const xmlDoc = parser.parseFromString(text.toString(), 'application/xml');
		const eventTags = xmlDoc.querySelectorAll('Event');

		events = Array.from(eventTags).map((eventTag) => {
			const idTag = eventTag.querySelector('Id');
			const nameTag = eventTag.querySelector('Name');

			if (idTag === null || nameTag === null) throw new Error('Problem with file format');

			const id = idTag.textContent;
			const name = nameTag.textContent;

			if (id === null || name === null) throw new Error('Problem with file format');

			return {
				id,
				name
			};
		});
	}

	async function handleEventChange() {
		classesAreLoading = true;
		classes = [];
		classInfo = null;
		const response = await fetch(`${url}?id=${eventId}`);
		classesAreLoading = false;

		const text = await response.text();

		const xmlDoc = parser.parseFromString(text.toString(), 'application/xml');
		const eventTags = xmlDoc.querySelectorAll('Class');

		classes = Array.from(eventTags).map((eventTag) => {
			const idTag = eventTag.querySelector('Id');
			const nameTag = eventTag.querySelector('Name');

			if (idTag === null || nameTag === null) throw new Error('Problem with file format');

			const id = idTag.textContent;
			const name = nameTag.textContent;

			if (id === null || name === null) throw new Error('Problem with file format');

			return {
				id,
				name
			};
		});
	}

	async function handleSubmit() {
		if (date === null || eventId === null || classInfo === null) return;

		const response = await fetch(`${url}?id=${eventId}&classid=${classInfo.id}`);
		const text = await response.text();

		const xmlDoc = parser.parseFromString(text.toString(), 'application/xml');

		const runners = parseIOFXML3SplitTimesFile(xmlDoc, classInfo.name, timeZone.value, timeOffset);
		await createRunners(runners, data.course.id, db);
		// TODO Properly invalidate runners
		data.courseData.runners = runners;
		goto(`/courses/${data.course.id}/manager/split-times/runners-attribution`);
	}
</script>

<h1>Upload split times from Winsplit online</h1>

<p>
	&#62;
	<a href={`/courses/${data.course.id}/manager`}>{data.course.name}</a>

	&#62;
	<a href={`/courses/${data.course.id}/manager/split-times`}>Split times</a>
</p>

<form on:submit|preventDefault={handleSubmit} class="wrapper">
	<label>
		Date

		<input name="dateInput" type="date" bind:value={date} on:change={handleDateChange} />
	</label>

	<label aria-busy={eventsAreLoading}>
		Event

		<select name="eventSelect" bind:value={eventId} on:change={handleEventChange}>
			{#each events as e}
				<option value={e.id}>{e.name}</option>
			{/each}
		</select>
	</label>

	<label aria-busy={classesAreLoading}>
		Class

		<select name="classSelect" bind:value={classInfo}>
			{#each classes as cl}
				<option value={cl}>{cl.name}</option>
			{/each}
		</select>
	</label>

	<label>
		Time zone

		<select bind:value={timeZone} name="timeZoneInput">
			timeZone

			{#each timeZones as timeZone}
				<option value={timeZone}>{timeZone.value}</option>
			{/each}
		</select>
	</label>

	<label for="timeOffsetInput">
		Time offset (seconds)

		<input bind:value={timeOffset} type="number" name="timeOffsetInput" id="time-offset" />
	</label>

	<footer class="footer">
		<a href={`/courses/${data.course.id}/manager/split-times`} role="button" class="outline btn">
			Cancel
		</a>

		<button type="submit" disabled={loading} aria-busy={loading} class="btn"> Load splits </button>
	</footer>
</form>

<style>
	h1 {
		margin: 2rem auto 1rem;
	}

	.wrapper {
		margin: 1rem auto;
		max-width: 30rem;
	}

	.footer {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.btn {
		width: fit-content;
	}
</style>
