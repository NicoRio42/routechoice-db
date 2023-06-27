<script lang="ts">
	export let data;

	console.log(data);
</script>

<!-- <script lang="ts">
	import Logo from '$lib/components/Logo.svelte';
	import { buildRunnersTracksFromLoggatorData } from 'orienteering-js/loggator';
	import type { CourseData, LoggatorPoints, Runner } from 'orienteering-js/models';
	import {
		courseDataWithoutRunnersValidator,
		parseNestedArraysInLegs,
		runnerValidator
	} from 'orienteering-js/models';
	import CourseViewer from './CourseViewer.svelte';

	export let data;
	let courseData: CourseData | null = null;
	let name = '';

	let areRunnersLoading = true;
	let isCourseDataLoading = true;
	let isMapLoading = true;
	let areTracksLoading = true;

	const allPromises = Promise.all([
		data.promises.coursePRomise.then((d) => {
			if (d.data() !== undefined) name = d.data()?.name as string;
			return d;
		}),
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
			[loggatorEvent, calibration],
			loggatorPointsResponse
		] = await allPromises;

		if (!isLoggatorPoints(loggatorPointsResponse.data))
			throw new Error('Could not get loggator points');

		const loggatorPoints = loggatorPointsResponse.data.data;

		const courseDataWithoutRunners = {
			...courseDataWithoutRunnersValidator.parse({
				...courseDataDocument.data(),
				legs: parseNestedArraysInLegs(courseDataDocument.data()?.legs)
			}),
			runners: []
		};

		if (courseDataWithoutRunners.legs.length === 0) {
			courseData = courseDataWithoutRunners;
			return;
		}

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
			calibration,
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
	{#if name !== ''}
		<title>Routechoice DB | {name}</title>
	{:else}
		<title>Routechoice DB</title>
	{/if}
</svelte:head>

{#await allPromises}
	<div class="loading-wrapper">
		<h1>{name}</h1>
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
{:catch}
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
		padding: 0 1rem;
	}

	.loading-wrapper p {
		color: var(--primary);
		font-weight: 500;
		margin: 0;
	}

	.loading-wrapper h1 {
		color: var(--primary);
		font-size: 1.5rem;
		text-align: center;
		margin-bottom: 1rem;
	}
</style> -->

<h1>TOTO</h1>
