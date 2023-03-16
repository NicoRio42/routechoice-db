<script lang="ts">
	import Logo from '$lib/components/icons/Logo.svelte';
	import { courseValidator, type Course } from '$lib/models/course';
	import { buildRunnersTracksFromLoggatorData } from '$lib/o-utils/loggator/points';
	import type CourseData from '$lib/o-utils/models/course-data';
	import { courseDataWithoutRunnersValidator } from '$lib/o-utils/models/course-data';
	import { parseNestedArraysInLegs } from '$lib/o-utils/models/leg';
	import type { LoggatorPoints } from '$lib/o-utils/models/loggator-api/loggator-points';
	import type Runner from '$lib/o-utils/models/runner';
	import { runnerValidator } from '$lib/o-utils/models/runner';
	import CourseViewer from './CourseViewer.svelte';

	export let data;
	let courseData: CourseData | null = null;
	let course: Course;

	let areRunnersLoading = true;
	let isCourseDataLoading = true;
	let isMapLoading = true;
	let areTracksLoading = true;

	const allPromises = Promise.all([
		data.promises.coursePRomise,
		data.promises.courseDataPromise.then((d) => {
			isCourseDataLoading = false;
			return d;
		}),
		data.promises.runnersPromise.then((d) => {
			areRunnersLoading = false;
			return d;
		}),
		data.promises.loggatorEventMapCallibrationPromise.then((d) => {
			isMapLoading = false;
			return d;
		}),
		data.promises.loggatorPointsPromise.then((d) => {
			areTracksLoading = false;
			return d;
		})
	]);

	function isLoggatorPoints(
		data: LoggatorPoints | { message: string; error: unknown }
	): data is LoggatorPoints {
		return 'data' in data;
	}

	async function getCourseData() {
		const [
			courseDocument,
			courseDataDocument,
			runnersCollection,
			[loggatorEvent, callibration],
			loggatorPointsResponse
		] = await allPromises;

		if (!isLoggatorPoints(loggatorPointsResponse.data))
			throw new Error('Could not get loggator points');

		const loggatorPoints = loggatorPointsResponse.data.data;

		course = courseValidator.parse({
			...courseDocument.data(),
			id: courseDocument.id
		});

		const courseDataObject = {
			...courseDataWithoutRunnersValidator.parse({
				...courseDataDocument.data(),
				legs: parseNestedArraysInLegs(courseDataDocument.data()?.legs)
			}),
			runners: []
		};

		if (courseDataObject.legs.length === 0) {
			courseData = courseDataObject;
			return;
		}

		const courseDataWithoutRunners = courseDataWithoutRunnersValidator.parse({
			...courseDataDocument.data(),
			legs: parseNestedArraysInLegs(courseDataDocument.data()?.legs)
		});

		const runners: Runner[] = [];

		runnersCollection.forEach((doc) => {
			try {
				runners.push(runnerValidator.parse({ ...doc.data(), id: doc.id }));
			} catch (error) {
				console.error(error);
			}
		});

		const runnersWithTracks = buildRunnersTracksFromLoggatorData(
			runners,
			loggatorPoints,
			loggatorEvent
		);

		if (!('url' in loggatorEvent.map)) throw new Error("Event isn't started yet");

		const map = {
			calibration: callibration,
			url: loggatorEvent.map.url
		};

		courseData = {
			...courseDataWithoutRunners,
			runners: runnersWithTracks,
			map
		};
	}

	getCourseData();
</script>

<svelte:head>
	{#if course !== undefined}
		<title>Routechoice DB | {course.name}</title>
	{:else}
		<title>Routechoice DB</title>
	{/if}
</svelte:head>

{#await allPromises}
	<div class="loading-wrapper">
		<Logo --bg-color="white" --width="10rem" --height="10rem" --logo-color="var(--primary)" />

		<p aria-busy={areRunnersLoading}>Split times</p>
		<p aria-busy={isCourseDataLoading}>Course and routechoices</p>
		<p aria-busy={isMapLoading}>Map</p>
		<p aria-busy={areTracksLoading}>Tracks</p>
	</div>
{:then}
	{#if courseData !== null}
		<CourseViewer {courseData} />
	{/if}
{:catch error}
	An error occured
{/await}

<style>
	.loading-wrapper {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
	}

	.loading-wrapper p {
		color: var(--primary);
		font-weight: 500;
	}

	p {
		margin: 0;
	}
</style>
