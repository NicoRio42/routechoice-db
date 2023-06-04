<script lang="ts">
	import { goto } from '$app/navigation';
	import { CoordinatesConverter } from 'orienteering-js/map';
	import type { MapCalibration } from 'orienteering-js/models';
	import { serializeNestedArraysInLegs } from 'orienteering-js/models';
	import type { LoggatorEvent } from 'orienteering-js/models';
	import { parseTwoDRerunCourseAndRoutechoicesExport } from 'orienteering-js/two-d-rerun';
	import { getLoggatorEventAndMapCallibration } from '$lib/utils/functions.js';
	import { doc, getFirestore, updateDoc } from 'firebase/firestore/lite';
	import { getFunctions, httpsCallable } from 'firebase/functions';

	export let data;

	const db = getFirestore();
	const functions = getFunctions(undefined, 'europe-west1');
	let loadCourseAndRoutechoicesFromJsonInput: HTMLInputElement;
	let loading = false;

	const getLoggatorEvent = httpsCallable<
		string,
		LoggatorEvent | { message: string; error: unknown }
	>(functions, 'getLoggatorEvent');

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
			const loggatorEventID = data.course.id.split('-')[1];
			const loggatorEventPromise = getLoggatorEvent(loggatorEventID);

			let mapCallibration: MapCalibration;
			loading = true;

			try {
				mapCallibration = (await getLoggatorEventAndMapCallibration(loggatorEventPromise))[1];
			} catch (e) {
				console.error(e);
				alert(e);
				loading = false;
				return;
			}

			const coordinatesConverter = new CoordinatesConverter(mapCallibration);

			const [controls, legs] = parseTwoDRerunCourseAndRoutechoicesExport(
				twoDRerunCourseAndRoutechoices,
				coordinatesConverter
			);

			data.courseData.legs = legs;
			data.courseData.course = controls;

			try {
				await updateDoc(doc(db, 'coursesData', data.courseData.id), {
					legs: serializeNestedArraysInLegs(data.courseData.legs),
					course: data.courseData.course
				});

				goto(`/courses/${data.course.id}/manager/split-times`);
			} catch (e) {
				console.error(e);
				alert('An error occured while saving the course.');
				loading = false;
				return;
			}
		};

		if (event.currentTarget.files === null) return;
		reader.readAsText(event.currentTarget.files[0]);
	}
</script>

<h1>Course and routechoices</h1>

<p>
	&#62;
	<a href={`/courses/${data.course.id}/manager`}>{data.course.name}</a>
</p>

<div class="options-wrapper container">
	<article
		class="upload-option"
		on:keydown
		on:click={() => loadCourseAndRoutechoicesFromJsonInput.click()}
		aria-busy={loading}
	>
		<input
			bind:this={loadCourseAndRoutechoicesFromJsonInput}
			type="file"
			style="display: none;"
			on:change={loadCourseAndRoutechoicesFromJson}
		/>

		Upload from 2DRerun export
	</article>

	<a href={`/courses/${data.course.id}/manager/course-and-routechoices/ocad`}>
		<article class="upload-option">Upload from OCAD exports</article>
	</a>

	<article class="upload-option disabled">Draw on map (soon)</article>
</div>

<style>
	h1 {
		margin: 2rem auto 1rem;
	}

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
