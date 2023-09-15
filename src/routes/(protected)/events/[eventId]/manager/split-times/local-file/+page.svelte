<script lang="ts">
	import { timezones } from '$lib/components/form-fields/timezones.js';
	import { superForm } from 'sveltekit-superforms/client';
	import { splitTimesFromLocalFile } from './schema.js';
	import FileField from '$lib/components/form-fields/FileField.svelte';
	import SelectField from '$lib/components/form-fields/SelectField.svelte';

	export let data;

	const form = superForm(data.form, {
		validators: splitTimesFromLocalFile,
		taintedMessage: null
	});

	const { delayed, enhance, form: formStore, errors } = form;

	let reader: FileReader;
	let parser: DOMParser;

	let classNames: string[] = [];

	$formStore.timezone = (
		timezones.find((tz) => tz.name === 'Europe/Brussels') ?? timezones[0]
	).offset;

	function extractClassesAndGuessTimeZoneFromXmlFile(event: CustomEvent<FileList | null>) {
		if (event.detail === null) return;

		let xmlFile = event.detail[0];
		if (xmlFile === undefined) return;
		if (reader === undefined) reader = new FileReader();

		reader.onload = function (e: ProgressEvent<FileReader>) {
			if (e.target === null) return;
			const readXml = e.target.result;
			if (readXml === null) return;
			if (parser === undefined) parser = new DOMParser();

			const xmlDoc = parser.parseFromString(readXml.toString(), 'application/xml');

			if (xmlDoc === null) return;
			const resultListTag = xmlDoc.querySelector('ResultList');
			if (resultListTag === null) return;
			const IOFXMLVersion = resultListTag.getAttribute('iofVersion');

			classNames = Array.from(xmlDoc.querySelectorAll('ClassResult Class Name')).map(
				(cl) => cl.textContent?.trim() ?? ''
			);

			if (classNames.length === 0) {
				classNames = Array.from(xmlDoc.querySelectorAll('ClassResult ClassShortName')).map(
				(cl) => cl.textContent?.trim() ?? ''
			);
			}

			if (classNames.length > 0) $formStore.className = classNames[0];

			// Trying to guess the timezone
			try {
				const timeZoneOffset = data.event.startTime.getTimezoneOffset();

				const foundTimeZone = timezones.find(
					(tz) => tz.offsetInSeconds === -timeZoneOffset
				)?.offset;

				if (foundTimeZone !== undefined) $formStore.timezone = foundTimeZone;
			} catch (error) {
				console.error(error);
			}
		};

		reader.readAsText(xmlFile);
	}
</script>

<main class="container max-w-2xl">
	<h1 class="mt-4 md:mt-15 mb-2" >Load split times from local IOF XML 3.0 file</h1>

	<h3 class="font-normal">(IOF XML 2 support is experimental)</h3>

	<p>
		&#62;
		<a href="/events/{data.event.id}/manager">Event manager: {data.event.name}</a>

		&#62;
		<a href="/events/{data.event.id}/manager/split-times">Split times</a>

		&#62;
		<a href="/events/{data.event.id}/manager/split-times/local-file">From local file</a>
	</p>

	<form class="mt-15" method="post" enctype="multipart/form-data" use:enhance>
		<FileField
			{form}
			field="file"
			label="Load IOF XML File"
			on:filesChange={extractClassesAndGuessTimeZoneFromXmlFile}
		/>

		<SelectField {form} field="className" label="Class">
			{#each classNames as className}
				<option value={className}>{className}</option>
			{/each}
		</SelectField>

		<SelectField {form} field="timezone" label="Time zone">
			{#each timezones as timezone}
				<option value={timezone.offset}>{timezone.name} {timezone.offset}</option>
			{/each}
		</SelectField>

		<button type="submit" aria-busy={$delayed}> Load splits </button>

		{#if $errors._errors !== undefined && $errors._errors.length !== 0}
			<ul class="list-none">
				{#each $errors._errors as error}
					<li class="error">{error}</li>
				{/each}
			</ul>
		{/if}
	</form>
</main>
