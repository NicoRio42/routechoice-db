<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { createRunners } from '$lib/db/runners.js';
	import { parseIOFXML3SplitTimesFile } from '$lib/o-utils/split-times/parsers/iof-xml-3';
	import { timeZones } from '$lib/utils/time-zones';
	import { getFirestore } from 'firebase/firestore/lite';

	export let data;

	const db = getFirestore();

	let reader: FileReader;
	let parser: DOMParser;

	let xmlDoc: XMLDocument;
	let classNames: string[] = [];
	let className: string;
	let timeOffset = 0;
	let timeZone = timeZones[2];
	let loading = false;

	interface FormEventHandler<T> {
		currentTarget: T;
	}

	const onFileSelected = (event: FormEventHandler<HTMLInputElement>) => {
		const fileInputElement = event.currentTarget;

		if (fileInputElement === null || fileInputElement.files === null) return;

		let xmlFile = fileInputElement.files[0];
		if (xmlFile === undefined) return;
		if (reader === undefined) reader = new FileReader();

		reader.onload = function (e: ProgressEvent<FileReader>) {
			if (e.target === null) return;
			const readXml = e.target.result;
			if (readXml === null) return;
			if (parser === undefined) parser = new DOMParser();

			xmlDoc = parser.parseFromString(readXml.toString(), 'application/xml');

			if (xmlDoc === null) return;
			const resultListTag = xmlDoc.querySelector('ResultList');
			if (resultListTag === null) return;
			const IOFXMLVersion = resultListTag.getAttribute('iofVersion');

			if (IOFXMLVersion !== '3.0') {
				alert('Only IOF XML 3.0 split times files are supported yet.');
				return;
			}

			const classQuerySelector =
				IOFXMLVersion === '3.0' ? 'ClassResult Class Name' : 'ClassResult ClassShortName';

			classNames = Array.from(xmlDoc.querySelectorAll(classQuerySelector)).map(
				(cl) => cl.innerHTML
			);

			if (classNames.length > 0) className = classNames[0];

			const dateTag = xmlDoc.querySelector('Date');

			if (dateTag === null || dateTag.textContent === null) return;

			// Trying to guess the timezone
			try {
				const date = new Date(dateTag.textContent);
				const timeZoneOffset = date.getTimezoneOffset();

				const foundTimeZone = timeZones.find((tz) => tz.timezoneOffset === timeZoneOffset);

				if (foundTimeZone !== undefined) timeZone = foundTimeZone;
			} catch (error) {
				console.error(error);
			}
		};

		reader.readAsText(xmlFile);
	};

	async function handleSubmit() {
		const runners = parseIOFXML3SplitTimesFile(xmlDoc, className, timeZone.value, timeOffset);
		await createRunners(runners, data.course.id, db);
		// TODO invalidate instead
		data.courseData.runners = runners;
		goto(`/courses/${data.course.id}/manager/split-times/runners-attribution`);
	}
</script>

<h1>Load split times from local IOF XML 3.0 file</h1>

<p>
	&#62;
	<a href={`/courses/${data.course.id}/manager`}>{data.course.name}</a>

	&#62;
	<a href={`/courses/${data.course.id}/manager/split-times`}>Split times</a>
</p>

<form class="wrapper" on:submit|preventDefault={handleSubmit}>
	<label
		>Load IOF XML File

		<input name="iof-xml-file" on:change={onFileSelected} type="file" />
	</label>

	<label
		>Class

		<select name="class" bind:value={className} disabled={classNames.length === 0}>
			{#each classNames as className}
				<option value={className}>{className}</option>
			{/each}
		</select>
	</label>

	<label
		>Time zone

		<select bind:value={timeZone} name="time-zone"
			>timeZone

			{#each timeZones as timeZone}
				<option value={timeZone}>{timeZone.value}</option>
			{/each}
		</select>
	</label>

	<label
		>Time offset (seconds)

		<input bind:value={timeOffset} type="number" name="time-offset" />
	</label>

	<button
		type="submit"
		disabled={xmlDoc === undefined || className === undefined}
		aria-busy={loading}
	>
		Load splits
	</button>
</form>

<style>
	h1 {
		margin: 2rem auto 1rem;
	}

	.wrapper {
		margin: 1rem auto;
		max-width: 25rem;
	}
</style>
