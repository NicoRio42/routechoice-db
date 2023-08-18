<script lang="ts">
	import { page } from '$app/stores';
	import type { EventWithLiveEventsRunnersLegsAndControlPoints as Event } from '$lib/models/event.model.js';
	import type { User } from 'lucia';
	import { onDestroy, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import ActionButtons from './components/ActionButtons.svelte';
	import GeoreferencedImage from './components/GeoreferencedImage.svelte';
	import OlMap from './components/OLMap.svelte';
	import RoutechoiceTrack from './components/RoutechoiceTrack.svelte';
	import RunnerRoute from './components/RunnerRoute.svelte';
	import SideBar from './components/SideBar.svelte';
	import VectorLayer from './components/VectorLayer.svelte';
	import './styles.css';
	import {
	addSearchParamsToURL,
		computeFitBoxAndAngleFromLegNumber,
		deleteSearchParamsToURL,
		getLegNumberFromSearchParams,
		getModeFromSearchParams
	} from './utils.js';
	import ModeDropDown from './components/ModeDropDown.svelte';
	import { ModesEnum } from './models/modes.enum.js';
	import Draw from './components/Draw.svelte';
	import AddRoutechoiceDialog from './components/AddRoutechoiceDialog.svelte';
	import type { LineString } from 'ol/geom.js';
	import type { DrawEvent } from 'ol/interaction/Draw.js';
	import { RolesEnum } from '$lib/models/enums/roles.enum.js';
	import { eventName } from '../../_components/event-name-store.js';

	export let data;

	$eventName = data.event.name

	let angle: number;
	let fitBox: [number, number, number, number];
	let selectedRunners: string[] = [];
	let showRoutechoices = true;
	let isAutoAnalysisMode = false;
	let currentDrawnRoutechoice: null | LineString = null;
	let showAddRoutechoiceDialog = false;

	$: mode = getModeFromSearchParams($page.url.searchParams);
	$: legNumber = getLegNumberFromSearchParams($page.url.searchParams);
	$: legRoutechoices = data.event.legs[legNumber - 1]?.routechoices ?? [];

	$: {
		const [newFitBox, newAngle] = computeFitBoxAndAngleFromLegNumber(
			legNumber,
			data.event as Event,
			data.eventMap
		);

		fitBox = newFitBox;
		angle = newAngle;
	}

	const user = writable<User | null>();
	$: user.set(data.user);
	setContext('user', user);

	const event = writable<Event>();
	$: event.set(data.event);
	setContext('event', event);

	async function handleDrawEnd(e: CustomEvent<DrawEvent>): Promise<void> {
		currentDrawnRoutechoice = e.detail.feature.getGeometry() as LineString;
		showAddRoutechoiceDialog = true;
	}

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

	onDestroy(() => $eventName = null)
</script>

<div class="wrapper">
	{#if data.user?.role === RolesEnum.Enum.admin}
		<a
			href={mode === ModesEnum.ANALYSIS ? addSearchParamsToURL($page.url, 'mode', ModesEnum.DRAW) : deleteSearchParamsToURL($page.url, "mode")}
			role="button"
			class="btn-unset absolute top-25 right-2 z-1 bg-white text-black w-6 h-6 flex items-center justify-center"
		>
			{#if mode === ModesEnum.ANALYSIS }
				<i class="block i-carbon-edit"></i>
			{:else}
				<i class="block i-carbon-edit-off"></i>
			{/if}
		</a>
	{/if}

	{#if showAddRoutechoiceDialog && currentDrawnRoutechoice !== null}
		<AddRoutechoiceDialog
			leg={data.event.legs[legNumber - 1]}
			{currentDrawnRoutechoice}
			on:cancel={() => {
				showAddRoutechoiceDialog = false;
				currentDrawnRoutechoice = null;
			}}
		/>
	{/if}

	<!-- <RunnerOffsetEditor bind:courseData /> -->

	<SideBar
		bind:selectedRunners
		runners={data.event.runners}
		legs={data.event.legs}
		{legNumber}
		on:changeRunnerTimeOffset={handleRunnerTimeOffsetChange}
	/>

	<OlMap {mode} {angle} {fitBox} padding={[100, 0, 100, 0]}>
		{#if mode === ModesEnum.DRAW}
			<Draw type={'LineString'} on:drawEnd={handleDrawEnd} />
		{/if}

		<GeoreferencedImage eventMap={data.eventMap} />

		<VectorLayer>
			{#if showRoutechoices}
				{#each legRoutechoices as routechoice (routechoice.id)}
					<RoutechoiceTrack {routechoice} opacity={0.8} width={6} />
				{/each}
			{/if}

			<!-- 	{#if isAutoAnalysisMode}
				<AutoAnalysis {selectedRunners} {legNumber} runners={courseData.runners} />
			{:else} -->
			{#each data.event.runners as runner (runner.id)}
				{@const show = selectedRunners.includes(runner.id)}
				{@const runnerLeg = runner.legs.find(
					(leg) => data.event.legs[legNumber - 1].id === leg?.fkLeg
				)}

				{#if show && runner.track !== null && runnerLeg !== undefined && runnerLeg !== null}
					<RunnerRoute
						{runnerLeg}
						name={runner.lastName}
						track={runner.track}
						startTime={runner.startTime}
						timeOffset={runner.timeOffset}
					/>
				{/if}
			{/each}
		</VectorLayer>
	</OlMap>

	<ActionButtons {legNumber} bind:showRoutechoices legs={data.event.legs} bind:isAutoAnalysisMode />
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
