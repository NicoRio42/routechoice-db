<script lang="ts">
	export let data;

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

<h1>Course and routechoices from OCAD</h1>

<p>
	&#62;
	<a href={`/events/${data.event.id}/manager`}>Event manager: {data.event.name}</a>

	&#62;
	<a href={`/events/${data.event.id}/manager/course-and-routechoices`}>Course and routechoices</a>

	&#62;
	<a href={`/events/${data.event.id}/manager/course-and-routechoices/ocad-export`}>
		From OCAD exports
	</a>
</p>

<form method="post" enctype="multipart/form-data">
	<label>
		Course file (IOF XML 3.0)

		<input on:change={loadCourseFromOCAD} name="courseFile" type="file" accept="application/xml" />

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
			<p class="error-message">Invalid file extension</p>
		{/if}
	</label>
	
	<div class="flex justify-end">
		<button aria-busy={loading} disabled={loading} type="submit">Upload</button>
	</div>
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
		margin-top: calc(var(--pico-spacing) * -1);
	}
</style>
