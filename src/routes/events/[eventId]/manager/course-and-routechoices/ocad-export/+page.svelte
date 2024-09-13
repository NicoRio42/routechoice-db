<script lang="ts">
	import { enhance } from '$app/forms';
	import SubmitButton from '$lib/components/form-fields/SubmitButton.svelte';

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

			const courseXmlDoc = parser.parseFromString(readXml.toString(), 'application/xml');

			classNames = Array.from(courseXmlDoc.querySelectorAll('Course Name')).map(
				(cl) => cl.innerHTML
			);

			if (classNames.length > 0) classIndex = 0;
		};

		reader.readAsText(xmlFile);
	}
</script>

<main class="sm:mx-auto px-4 sm:w-120 my-6 pb-12">
	<h1>Course and routechoices from OCAD</h1>

	<form method="post" enctype="multipart/form-data" use:enhance>
		<label>
			Course file (IOF XML 3.0)

			<input
				on:change={loadCourseFromOCAD}
				name="courseFile"
				type="file"
				accept="application/xml"
			/>

			{#if isCourseFileInvalid}
				<p class="error-message">Invalid file extension</p>
			{/if}
		</label>

		<label>
			Class

			<select bind:value={classIndex} name="classIndex" disabled={classNames.length === 0}>
				{#each classNames as clsName, index}
					<option value={index}>{clsName}</option>
				{/each}
			</select>
		</label>

		<label>
			Routechoices (GPX export)

			<input name="routechoicesFile" type="file" accept=".gpx" />

			{#if isRoutechoicesFileInvalid}
				<p class="error">Invalid file extension</p>
			{/if}
		</label>

		<SubmitButton aria-busy={loading}>
			<i class="i-carbon-upload block w-5 h-5"></i> Upload
		</SubmitButton>
	</form>
</main>
