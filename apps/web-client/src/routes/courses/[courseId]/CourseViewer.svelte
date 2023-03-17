<script lang="ts">
	import { portal } from '$lib/actions/portal';
	import { changeRunnerRoutechoice } from '$lib/db/routechoice';
	import { updateRunnersRoutechoicesInFirestore } from '$lib/db/runners';
	import type CourseData from '$lib/o-utils/models/course-data';
	import { serializeNestedArraysInLegs } from '$lib/o-utils/models/leg';
	import type Routechoice from '$lib/o-utils/models/routechoice';
	import {
		detectRunnersRoutechoices,
		detectSingleRunnerRoutechoices
	} from '$lib/o-utils/routechoice-detector/routechoice-detector';
	import { createRoutechoiceStatistics } from '$lib/o-utils/statistics/routechoices-statistics';
	import { doc, getFirestore, updateDoc, writeBatch } from 'firebase/firestore/lite';
	import type { LineString } from 'ol/geom';
	import type { DrawEvent } from 'ol/interaction/Draw';
	import ActionButtons from './components/ActionButtons.svelte';
	import AddRoutechoiceDialog, {
		getNewRoutechoiceNameAndColor
	} from './components/AddRoutechoiceDialog.svelte';
	import AutoAnalysis from './components/AutoAnalysis.svelte';
	import Draw from './components/Draw.svelte';
	import GeoreferencedImage from './components/GeoreferencedImage.svelte';
	import OlMap from './components/OLMap.svelte';
	import RoutechoiceTrack from './components/RoutechoiceTrack.svelte';
	import RunnerOffsetEditor, { getNewRunnerOffset } from './components/RunnerOffsetEditor.svelte';
	import RunnerRoute from './components/RunnerRoute.svelte';
	import SideBar from './components/SideBar.svelte';
	import type { RoutechoiceChangeEventDetails } from './components/SplitTimesTable/RoutecoiceTableCell.svelte';
	import { getStandardCordsAndLengthFromLineStringFlatCordinates } from './components/utils';
	import VectorLayer from './components/VectorLayer.svelte';
	import { ModesEnum } from './models/modes.enum';
	import './styles.css';
	import { computeFitBoxAndAngleFromLegNumber } from './utils';

	export let courseData: CourseData;

	const db = getFirestore();

	let angle: number;
	let fitBox: [number, number, number, number];
	let legNumber = 1;
	let selectedRunners: string[] = [];
	let showRoutechoices = true;
	let showSideBar = true;
	let isAutoAnalysisMode = false;
	let mode: ModesEnum = ModesEnum.ANALYSIS;

	$: {
		const [newFitBox, newAngle] = computeFitBoxAndAngleFromLegNumber(legNumber, courseData);

		fitBox = newFitBox;
		angle = newAngle;
	}

	$: legRoutechoices = courseData.legs[legNumber - 1].routechoices;

	async function handleRoutechoiceChange(
		event: CustomEvent<RoutechoiceChangeEventDetails>
	): Promise<void> {
		courseData = await changeRunnerRoutechoice(
			courseData,
			event.detail.routechoiceID,
			event.detail.runnerId,
			legNumber,
			db
		);
	}

	async function handleDrawEnd(e: CustomEvent<DrawEvent>): Promise<void> {
		try {
			const [name, color] = await getNewRoutechoiceNameAndColor();

			const [track, length] = getStandardCordsAndLengthFromLineStringFlatCordinates(
				(e.detail.feature.getGeometry() as LineString).getFlatCoordinates()
			);

			const newRoutechoice: Routechoice = {
				id: crypto.randomUUID(),
				color,
				name,
				length,
				track
			};

			courseData.legs[legNumber - 1].routechoices = [
				...courseData.legs[legNumber - 1].routechoices,
				newRoutechoice
			];

			courseData.legs = createRoutechoiceStatistics(courseData.runners, courseData.legs);

			try {
				await updateDoc(doc(db, 'coursesData', courseData.id), {
					legs: serializeNestedArraysInLegs(courseData.legs)
				});
			} catch (error) {
				alert('An error occured while updating the course.');
			}

			if (courseData.runners.length !== 0) {
				const runnersWithDetectedRoutechoices = detectRunnersRoutechoices(
					courseData.legs,
					courseData.runners
				);

				try {
					updateRunnersRoutechoicesInFirestore(
						courseData.runners,
						runnersWithDetectedRoutechoices,
						db,
						courseData.id
					);

					courseData.runners = runnersWithDetectedRoutechoices;
				} catch (error) {
					alert('An error occured while updating the new runners to the database.');
					console.error(error);
				}
			}
		} catch (e) {
			return;
		}
	}

	async function handleRunnerTimeOffsetChange(event: CustomEvent<string>): Promise<void> {
		const runnerId = event.detail;
		const previouslySelectedRunners = [...selectedRunners];
		selectedRunners = [runnerId];
		let newOffset: number, applyToAllRunners: boolean;

		try {
			[newOffset, applyToAllRunners] = await getNewRunnerOffset(runnerId);
		} catch (e) {
			return;
		} finally {
			selectedRunners = [...previouslySelectedRunners];
		}

		if (applyToAllRunners) {
			courseData.runners.forEach((runner) => (runner.timeOffset = newOffset));

			courseData.runners = detectRunnersRoutechoices(courseData.legs, courseData.runners);

			const batch = writeBatch(db);

			courseData.runners.forEach((runner) =>
				batch.update(doc(db, 'coursesData', courseData.id, 'runners', runner.id), {
					timeOffset: newOffset,
					legs: runner.legs
				})
			);

			batch.commit();
			return;
		}

		const runner = courseData.runners.find((runner) => runner.id === runnerId)!;
		const runnerWithNewOssetAndDetectedRoutechoice = detectSingleRunnerRoutechoices(
			courseData.legs,
			{
				...runner,
				timeOffset: newOffset
			}
		);

		courseData.runners = courseData.runners.map((runner) =>
			runner.id === runnerId ? runnerWithNewOssetAndDetectedRoutechoice : runner
		);

		updateDoc(doc(db, 'coursesData', courseData.id, 'runners', runnerId), {
			...runnerWithNewOssetAndDetectedRoutechoice
		});
	}
</script>

<li use:portal={'navbarButtons'} class="mode-select-wrapper">
	<select name="mode" id="mode-select" bind:value={mode} class="mode-select">
		<option value={ModesEnum.ANALYSIS}>Analysis</option>
		<option value={ModesEnum.DRAW}>Draw routechoices</option>
	</select>
</li>

<div class="wrapper">
	<AddRoutechoiceDialog {legRoutechoices} />

	<RunnerOffsetEditor bind:courseData />

	<SideBar
		bind:selectedRunners
		{courseData}
		{legNumber}
		{showSideBar}
		on:routechoiceChange={handleRoutechoiceChange}
		on:changeRunnerTimeOffset={handleRunnerTimeOffsetChange}
	/>

	<OlMap {mode} {angle} {fitBox} padding={[100, 0, 100, 0]}>
		{#if mode === ModesEnum.DRAW}
			<Draw type={'LineString'} on:drawEnd={handleDrawEnd} />
		{/if}

		{#if courseData.map !== null}
			<GeoreferencedImage url={courseData.map.url} mapCalibration={courseData.map.calibration} />
		{/if}

		<VectorLayer>
			{#if showRoutechoices}
				{#each legRoutechoices as routechoice (routechoice.id)}
					<RoutechoiceTrack {routechoice} opacity={0.8} width={6} />
				{/each}
			{/if}

			{#if isAutoAnalysisMode}
				<AutoAnalysis {selectedRunners} {legNumber} runners={courseData.runners} />
			{:else}
				{#each courseData.runners as runner (runner.id)}
					{@const show = selectedRunners.includes(runner.id)}

					{#if show && runner.track !== null}
						<RunnerRoute {runner} {legNumber} />
					{/if}
				{/each}
			{/if}
		</VectorLayer>
	</OlMap>

	<ActionButtons
		bind:legNumber
		bind:showRoutechoices
		bind:showSideBar
		legs={courseData.legs}
		bind:isAutoAnalysisMode
	/>
</div>

<style>
	.wrapper {
		position: relative;
		flex-shrink: 0;
		flex-grow: 1;
	}

	.mode-select-wrapper {
		padding: 0;
		margin-left: 1rem;
	}

	.mode-select {
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
	}

	@media screen and (max-width: 768px) {
		.mode-select-wrapper {
			margin-left: 0.5rem;
		}

		.mode-select {
			font-size: 0.75rem;
		}
	}
</style>
