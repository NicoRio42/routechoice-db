<script lang="ts">
	import { goto } from '$app/navigation';
	import { CoordinatesConverter } from '$lib/o-utils/map/coords-converter';
	import { serializeNestedArraysInLegs } from '$lib/o-utils/models/leg';
	import { parseTwoDRerunCourseAndRoutechoicesExport } from '$lib/o-utils/two-d-rerun/course-mappers';
	import { doc, getFirestore, updateDoc } from 'firebase/firestore/lite';

	export let data;

	const db = getFirestore();
	let loadCourseAndRoutechoicesFromJsonInput: HTMLInputElement;

	interface FormEventHandler<T> {
		currentTarget: T;
	}

	function loadCourseAndRoutechoicesFromJson(event: FormEventHandler<HTMLInputElement>) {
		let reader = new FileReader();

		reader.onload = async function (e: ProgressEvent<FileReader>) {
			if (e.target === null) return;
			const d = e.target.result;
			if (typeof d !== 'string') return;

			const twoDRerunCourseAndRoutechoices = JSON.parse(d);

			if (data.courseData.map === null)
				throw new Error('No map callibration, event migth not have started yet.');

			const coordinatesConverter = new CoordinatesConverter(data.courseData.map.calibration);

			const [controls, legs] = parseTwoDRerunCourseAndRoutechoicesExport(
				twoDRerunCourseAndRoutechoices,
				coordinatesConverter
			);

			data.courseData.legs = legs;
			data.courseData.course = controls;

			await updateDoc(doc(db, 'coursesData', data.courseData.id), {
				legs: serializeNestedArraysInLegs(data.courseData.legs),
				course: data.courseData.course
			});

			goto(`/courses/${data.course.id}/manager/split-times`);
		};

		if (event.currentTarget.files === null) return;
		reader.readAsText(event.currentTarget.files[0]);
	}
</script>

<div class="options-wrapper container">
	<article
		class="upload-option"
		on:keydown
		on:click={() => loadCourseAndRoutechoicesFromJsonInput.click()}
	>
		<input
			bind:this={loadCourseAndRoutechoicesFromJsonInput}
			type="file"
			style="display: none;"
			on:change={loadCourseAndRoutechoicesFromJson}
		/>

		Upload from 2DRerun export
	</article>

	<article class="upload-option">
		<a href={`/courses/${data.course.id}/manager/course-and-routechoices/ocad`}
			>Upload from OCAD exports</a
		>
	</article>

	<article class="upload-option disabled">Draw on map (soon)</article>
</div>

<style>
	.upload-option {
		cursor: pointer;
		margin: 0;
	}

	.options-wrapper {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 1rem;
		padding-top: 3rem;
		font-weight: 500;
	}

	.disabled {
		color: lightgrey;
	}

	@media screen and (max-width: 700px) {
		.options-wrapper {
			grid-template-columns: 1fr;
		}
	}
</style>
