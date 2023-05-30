<script lang="ts">
	import { serializeNestedArraysInLegs } from 'orienteering-js/models';
	import { parseGPXRoutechoicesOCADExport } from 'orienteering-js/ocad';
	import { parseIOFXML3CourseOCADExport } from 'orienteering-js/ocad';
	import { doc, getFirestore, updateDoc } from 'firebase/firestore/lite';
	import { goto } from '$app/navigation';

	export let data;

	const db = getFirestore();

	let courseXmlDoc: XMLDocument | null = null;
	let routechoicesXmlDoc: XMLDocument | null = null;
	let classNames: string[] = [];
	let classIndex: number | null = null;
	let isCourseFileInvalid = false;
	let isRoutechoicesFileInvalid = false;
	let loading = false;

	function loadCourseFromOCAD(event: Event): void {
		const target = event.target as HTMLInputElement;

		if (target === null || target.files?.length !== 1) return;

		const xmlFile = target.files[0];

		if (xmlFile.type !== 'text/xml') {
			isCourseFileInvalid = true;
			return;
		}

		isCourseFileInvalid = false;

		const reader = new FileReader();

		reader.onload = (e: ProgressEvent<FileReader>) => {
			if (e.target === null) return;
			const readXml = e.target.result;
			if (readXml === null) return;
			const parser = new DOMParser();

			courseXmlDoc = parser.parseFromString(readXml.toString(), 'application/xml');

			classNames = Array.from(courseXmlDoc.querySelectorAll('Course Name')).map(
				(cl) => cl.innerHTML
			);

			if (classNames.length > 0) classIndex = 0;
		};

		reader.readAsText(xmlFile);
	}

	function loadRoutechoicesFromOcad(event: Event) {
		const target = event.target as HTMLInputElement;

		if (target === null || target.files?.length !== 1) return;

		const xmlFile = target.files[0];

		if (xmlFile.name.split('.').pop() !== 'gpx') {
			isRoutechoicesFileInvalid = true;
			return;
		}

		isRoutechoicesFileInvalid = false;
		const reader = new FileReader();

		reader.onload = (e: ProgressEvent<FileReader>) => {
			if (e.target === null) return;
			const readXml = e.target.result;
			if (readXml === null) return;
			const parser = new DOMParser();

			routechoicesXmlDoc = parser.parseFromString(readXml.toString(), 'application/xml');
		};

		reader.readAsText(xmlFile);
	}

	async function parseXmlFiles() {
		if (courseXmlDoc === null) {
			alert('You have to upload at least a course.');
			return;
		}

		if (classIndex === null) {
			alert('You have to choose a class.');
			return;
		}

		const [controls, legsWithoutRoutechoices] = parseIOFXML3CourseOCADExport(
			courseXmlDoc,
			classIndex
		);

		data.courseData.course = controls;

		if (routechoicesXmlDoc === null) {
			data.courseData.legs = legsWithoutRoutechoices;
		} else {
			const legs = parseGPXRoutechoicesOCADExport(routechoicesXmlDoc, legsWithoutRoutechoices);

			data.courseData.legs = legs;
		}

		loading = true;

		try {
			await updateDoc(doc(db, 'coursesData', data.courseData.id), {
				legs: serializeNestedArraysInLegs(data.courseData.legs),
				course: data.courseData.course
			});

			goto(`/courses/${data.course.id}/manager/split-times`);
		} catch (error) {
			alert('An error occured while saving the course.');
			console.error(error);
			loading = false;
		}
	}
</script>

<h1>Course and routechoices from OCAD</h1>

<p>
	&#62;
	<a href={`/courses/${data.course.id}/manager`}>{data.course.name}</a>

	&#62;
	<a href={`/courses/${data.course.id}/manager/course-and-routechoices`}>Course and routechoices</a>
</p>

<form on:submit|preventDefault={parseXmlFiles}>
	<label>
		Course file (IOF XML 3.0)

		<input
			on:change={loadCourseFromOCAD}
			name="course-file-input"
			type="file"
			accept="application/xml"
		/>

		{#if isCourseFileInvalid}
			<p class="error-message">Invalid file extension</p>
		{/if}
	</label>

	<label>
		Class

		<select bind:value={classIndex} name="class-select" disabled={classNames.length === 0}>
			{#each classNames as clsName, index}
				<option value={index}>{clsName}</option>
			{/each}
		</select>
	</label>

	<label>
		Routechoices (GPX export)

		<input
			on:change={loadRoutechoicesFromOcad}
			name="routechoices-file-input"
			type="file"
			accept=".gpx"
		/>

		{#if isRoutechoicesFileInvalid}
			<p class="error-message">Invalid file extension</p>
		{/if}
	</label>

	<button aria-busy={loading} disabled={loading} type="submit">Upload</button>
</form>

<style>
	h1 {
		margin: 2rem auto 1rem;
	}

	form {
		max-width: 25rem;
		margin: auto;
	}
	.error-message {
		color: rgba(198, 40, 40, 0.999);
		font-size: smaller;
		margin-top: calc(var(--spacing) * -1);
	}
</style>
