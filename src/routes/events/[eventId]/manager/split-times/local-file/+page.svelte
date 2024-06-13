<script lang="ts">
	import FileField from '$lib/components/form-fields/FileField.svelte';
	import GlobalFormErrors from '$lib/components/form-fields/GlobalFormErrors.svelte';
	import SelectField from '$lib/components/form-fields/SelectField.svelte';
	import SubmitButton from '$lib/components/form-fields/SubmitButton.svelte';
	import { timezones } from '$lib/components/form-fields/timezones.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { splitTimesFromLocalFile } from './schema.js';

	export let data;

	const form = superForm(data.form, {
		validators: zodClient(splitTimesFromLocalFile)
	});

	const { delayed, enhance, form: formStore, errors } = form;

	let reader: FileReader;
	let parser: DOMParser;

	let classNames: string[] = [];

	$formStore.timezone = (timezones.find((tz) => tz.offset === '+01:00') ?? timezones[0]).offset;

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

<main class="container max-w-100 mt-6">
	<h1>Load split times from local IOF XML 3.0 file</h1>

	<p class="font-normal text-6 mb-0">(IOF XML 2 support is experimental)</p>

	<form class="mt-8" method="post" enctype="multipart/form-data" use:enhance>
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

		<SelectField {form} field="timezone" label="Time zone offset (With daylight saving time)">
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
