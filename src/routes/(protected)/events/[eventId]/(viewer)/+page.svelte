<script lang="ts">
	import { page } from '$app/stores';
	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';
	import ActionButtons from './components/ActionButtons.svelte';
	import GeoreferencedImage from './components/GeoreferencedImage.svelte';
	import OlMap from './components/OLMap.svelte';
	import RoutechoiceTrack from './components/RoutechoiceTrack.svelte';
	import RunnerRoute from './components/RunnerRoute.svelte';
	import SideBar from './components/SideBar.svelte';
	import type { RoutechoiceChangeEventDetails } from './components/SplitTimesTable/RoutecoiceTableCell.svelte';
	import VectorLayer from './components/VectorLayer.svelte';
	import './styles.css';
	import { computeFitBoxAndAngleFromLegNumber, getModeFromSearchParams } from './utils.js';
	import type { User } from 'lucia-auth';
	import type { Event } from './models/event.model.js';

	export let data;

	let angle: number;
	let fitBox: [number, number, number, number];
	let legNumber = 1;
	let selectedRunners: string[] = [];
	let showRoutechoices = true;
	let isAutoAnalysisMode = false;

	$: mode = getModeFromSearchParams($page.url.searchParams);
	$: legRoutechoices = data.event.legs[legNumber - 1].routechoices;

	$: {
		const [newFitBox, newAngle] = computeFitBoxAndAngleFromLegNumber(
			legNumber,
			data.event as Event
		);

		fitBox = newFitBox;
		angle = newAngle;
	}

	const user = writable<User | null>();
	$: user.set(data.user);
	setContext('user', user);

	async function handleRoutechoiceChange(
		event: CustomEvent<RoutechoiceChangeEventDetails>
	): Promise<void> {
		// courseData = await changeRunnerRoutechoice(
		// 	courseData,
		// 	event.detail.routechoiceID,
		// 	event.detail.runnerId,
		// 	legNumber,
		// 	db
		// );
	}

	// async function handleDrawEnd(e: CustomEvent<DrawEvent>): Promise<void> {
	// try {
	// 	const [name, color] = await getNewRoutechoiceNameAndColor();
	// 	const [track, length] = getStandardCordsAndLengthFromLineStringFlatCordinates(
	// 		(e.detail.feature.getGeometry() as LineString).getFlatCoordinates()
	// 	);
	// 	const newRoutechoice: Routechoice = {
	// 		id: crypto.randomUUID(),
	// 		color,
	// 		name,
	// 		length,
	// 		track
	// 	};
	// 	courseData.legs[legNumber - 1].routechoices = [
	// 		...courseData.legs[legNumber - 1].routechoices,
	// 		newRoutechoice
	// 	];
	// 	courseData.legs = createRoutechoiceStatistics(courseData.runners, courseData.legs);
	// 	try {
	// 		await updateDoc(doc(db, 'coursesData', courseData.id), {
	// 			legs: serializeNestedArraysInLegs(courseData.legs)
	// 		});
	// 	} catch (error) {
	// 		alert('An error occured while updating the course.');
	// 	}
	// 	if (courseData.runners.length !== 0) {
	// 		const runnersWithDetectedRoutechoices = detectRunnersRoutechoices(
	// 			courseData.legs,
	// 			courseData.runners
	// 		);
	// 		try {
	// 			updateRunnersRoutechoicesInFirestore(
	// 				courseData.runners,
	// 				runnersWithDetectedRoutechoices,
	// 				db,
	// 				courseData.id
	// 			);
	// 			courseData.runners = runnersWithDetectedRoutechoices;
	// 		} catch (error) {
	// 			alert('An error occured while updating the new runners to the database.');
	// 			console.error(error);
	// 		}
	// 	}
	// } catch (e) {
	//		console.error(e)
	// 	return;
	// }
	// }

	async function handleRunnerTimeOffsetChange(event: CustomEvent<string>): Promise<void> {
		// const runnerId = event.detail;
		// const previouslySelectedRunners = [...selectedRunners];
		// selectedRunners = [runnerId];
		// let newOffset: number, applyToAllRunners: boolean;
		// try {
		// 	[newOffset, applyToAllRunners] = await getNewRunnerOffset(runnerId);
		// } catch (e) {
		// 	return;
		// } finally {
		// 	selectedRunners = [...previouslySelectedRunners];
		// }
		// if (applyToAllRunners) {
		// 	courseData.runners.forEach((runner) => (runner.timeOffset = newOffset));
		// 	courseData.runners = detectRunnersRoutechoices(courseData.legs, courseData.runners);
		// 	const batch = writeBatch(db);
		// 	courseData.runners.forEach((runner) =>
		// 		batch.update(doc(db, 'coursesData', courseData.id, 'runners', runner.id), {
		// 			timeOffset: newOffset,
		// 			legs: runner.legs
		// 		})
		// 	);
		// 	batch.commit();
		// 	return;
		// }
		// const runner = courseData.runners.find((runner) => runner.id === runnerId)!;
		// const runnerWithNewOssetAndDetectedRoutechoice = detectSingleRunnerRoutechoices(
		// 	courseData.legs,
		// 	{
		// 		...runner,
		// 		timeOffset: newOffset
		// 	}
		// );
		// courseData.runners = courseData.runners.map((runner) =>
		// 	runner.id === runnerId ? runnerWithNewOssetAndDetectedRoutechoice : runner
		// );
		// updateDoc(doc(db, 'coursesData', courseData.id, 'runners', runnerId), {
		// 	...runnerWithNewOssetAndDetectedRoutechoice
		// });
	}
</script>

<!-- <ModeDropDown courseId={data.event.id} {mode} /> -->

<div class="wrapper">
	<!-- <AddRoutechoiceDialog {legRoutechoices} /> -->

	<!-- <RunnerOffsetEditor bind:courseData /> -->

	<SideBar
		bind:selectedRunners
		runners={data.event.runners}
		legs={data.event.legs}
		{legNumber}
		on:routechoiceChange={handleRoutechoiceChange}
		on:changeRunnerTimeOffset={handleRunnerTimeOffsetChange}
	/>

	<OlMap {mode} {angle} {fitBox} padding={[100, 0, 100, 0]}>
		<!-- {#if mode === ModesEnum.DRAW}
			<Draw type={'LineString'} on:drawEnd={handleDrawEnd} />
		{/if} -->

		<GeoreferencedImage eventMap={data.eventMap} />

		<!-- <VectorLayer>
			{#if showRoutechoices}
				{#each legRoutechoices as routechoice (routechoice.id)}
					<RoutechoiceTrack {routechoice} opacity={0.8} width={6} />
				{/each}
			{/if}
			
			{#if isAutoAnalysisMode}
				<AutoAnalysis {selectedRunners} {legNumber} runners={courseData.runners} />
			{:else}
			{/if}
			{#each courseData.runners as runner (runner.id)}
				{@const show = selectedRunners.includes(runner.id)}

				{#if show && runner.track !== null}
					<RunnerRoute {runner} {legNumber} />
				{/if}
			{/each}
		</VectorLayer> -->
	</OlMap>

	<ActionButtons
		bind:legNumber
		bind:showRoutechoices
		legs={data.event.legs}
		bind:isAutoAnalysisMode
	/>
</div>

<style>
	:root {
		--display-brand-name-small-devices: none;
	}

	.wrapper {
		position: relative;
		flex-shrink: 0;
		flex-grow: 1;
	}
</style>
