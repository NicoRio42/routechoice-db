<script lang="ts">
	import { page } from '$app/stores';
	import { pushNotification } from '$lib/components/Notifications.svelte';
	import { getTracksFromLiveEvents } from '$lib/helpers';
	import type { EventWithLiveEventsRunnersLegsAndControlPoints as Event } from '$lib/models/event.model.js';
	import { mapIsLoading } from '$lib/stores/map-loading.store';
	import type { User } from 'lucia';
	import type { LineString } from 'ol/geom.js';
	import type { DrawEvent } from 'ol/interaction/Draw.js';
	import { onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import ActionButtons from './components/ActionButtons.svelte';
	import Draw from './components/Draw.svelte';
	import GeoreferencedImage from './components/GeoreferencedImage.svelte';
	import ManageRoutechoicesButton from './components/ManageRoutechoicesButton.svelte';
	import OlMap from './components/OLMap.svelte';
	import RoutechoiceTrack from './components/RoutechoiceTrack.svelte';
	import RunnerRoute from './components/RunnerRoute.svelte';
	import Settings from './components/Settings.svelte';
	import SettingsButton from './components/SettingsButton.svelte';
	import SideBar from './components/SideBar.svelte';
	import TracksLabels from './components/TracksLabels.svelte';
	import VectorLayer from './components/VectorLayer.svelte';
	import { settingsStore } from './settings-store';
	import './styles.css';
	import {
		computeFitBoxAndAngleFromLegNumber,
		getLegNumberFromSearchParams,
		getSelectedRunnersWithCurrentLegOnlyAndTracks
	} from './utils.js';

	export let data;

	$mapIsLoading = true;

	let angle: number;
	let fitBox: [number, number, number, number];
	let selectedRunnersIds: string[] = [];
	let currentDrawnRoutechoice: null | LineString = null;
	let showAddRoutechoiceDialog = false;
	let showManageRoutechoicesDialog = false;
	let isDrawingNewRoutechoice = false;
	let hoveredRunnerId: string | null = null;

	$: legNumber = getLegNumberFromSearchParams($page.url.searchParams);
	$: legRoutechoices = data.event.legs[legNumber - 1]?.routechoices ?? [];
	$: showRoutechoices = !$page.url.searchParams.has('hideRoutechoices');

	// TODO Optimize this if it causes perf issues
	$: selectedRunnersWithCurrentLegOnly = getSelectedRunnersWithCurrentLegOnlyAndTracks(
		data.event.runners,
		data.event.legs[legNumber - 1],
		selectedRunnersIds,
		$settingsStore.runnersTracksColors
	);

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

	onMount(() => {
		getTracksFromLiveEvents(data.event.liveEvents, { fetch, proxyRequests: true })
			.then((tracks) => {
				data.event.runners = data.event.runners.map((runner) => {
					const track = tracks.find(
						(t) =>
							t.trackingDeviceId === runner.trackingDeviceId && t.fkLiveEvent === runner.fkLiveEvent
					);

					return { ...runner, track: track === undefined ? null : track.track };
				});
			})
			.catch(() => {
				pushNotification('Could not load GPS', { type: 'error', delayInSeconds: 5 });
			});
	});

	async function handleDrawEnd(e: CustomEvent<DrawEvent>): Promise<void> {
		currentDrawnRoutechoice = e.detail.feature.getGeometry() as LineString;
		showAddRoutechoiceDialog = true;
	}
</script>

<svelte:head>
	<meta property="og:title" content="Routechoice DB | {data.event.name}" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content={data.eventMap.url} />
	<meta property="og:url" content={$page.url.href.split('?')[0]} />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

{#if showManageRoutechoicesDialog && data.event.legs.length !== 0}
	{#await import('./components/ManageRoutechoicesDialog.svelte') then { default: ManageRoutechoicesDialog }}
		<ManageRoutechoicesDialog
			leg={data.event.legs[legNumber - 1]}
			runners={data.event.runners}
			legIndex={legNumber - 1}
			bind:show={showManageRoutechoicesDialog}
			on:startDrawingNewRoutechoice={() => (isDrawingNewRoutechoice = true)}
			on:deleteRoutechoice={({ detail: { deletedRoutechoiceId, runnerLegsToUpdate } }) => {
				data.event.legs[legNumber - 1].routechoices = data.event.legs[
					legNumber - 1
				].routechoices.filter((rc) => rc.id !== deletedRoutechoiceId);

				for (const runner of data.event.runners) {
					const runnerLegToUpdate = runnerLegsToUpdate.find((rl) => rl.fkRunner === runner.id);
					if (runnerLegToUpdate === undefined) continue;
					const runnerLeg = runner.legs.find((rl) => rl?.id === runnerLegToUpdate.id);
					if (runnerLeg === undefined) continue;
					runnerLeg.fkDetectedRoutechoice = runnerLegToUpdate.fkDetectedRoutechoice;
				}
			}}
		/>
	{/await}
{/if}

{#if showAddRoutechoiceDialog && currentDrawnRoutechoice !== null}
	{#await import('./components/AddRoutechoiceDialog.svelte') then { default: AddRoutechoiceDialog }}
		<AddRoutechoiceDialog
			runners={data.event.runners}
			leg={data.event.legs[legNumber - 1]}
			legIndex={legNumber - 1}
			{currentDrawnRoutechoice}
			on:close={() => {
				showAddRoutechoiceDialog = false;
				currentDrawnRoutechoice = null;
			}}
			on:addRoutechoice={({ detail: { newRoutechoice, runnerLegsToUpdate } }) => {
				data.event.legs[legNumber - 1].routechoices = [
					...data.event.legs[legNumber - 1].routechoices,
					{ ...newRoutechoice, elevation: null }
				];

				for (const runner of data.event.runners) {
					const runnerLegToUpdate = runnerLegsToUpdate.find((rl) => rl.fkRunner === runner.id);
					if (runnerLegToUpdate === undefined) continue;
					const runnerLeg = runner.legs.find((rl) => rl?.id === runnerLegToUpdate.id);
					if (runnerLeg === undefined) continue;
					runnerLeg.fkDetectedRoutechoice = runnerLegToUpdate.fkDetectedRoutechoice;
				}

				data.event.runners = data.event.runners;
				showAddRoutechoiceDialog = false;
				currentDrawnRoutechoice = null;
				isDrawingNewRoutechoice = false;
			}}
		/>
	{/await}
{/if}

<div class="wrapper overflow-hidden">
	{#if $mapIsLoading}
		<article
			class="absolute z-1 bg-transparent top-40% left-50% -translate-x-50% -translate-y-50% backdrop-blur rounded-xl"
			aria-busy="true"
		>
			Map is loading
		</article>
	{/if}

	<SettingsButton />

	{#if data.event.legs.length !== 0 && data.user?.role === 'admin'}
		<ManageRoutechoicesButton
			{isDrawingNewRoutechoice}
			on:click={() => {
				if (isDrawingNewRoutechoice) {
					isDrawingNewRoutechoice = false;
					currentDrawnRoutechoice = null;
				} else showManageRoutechoicesDialog = true;
			}}
		/>
	{/if}

	<SideBar
		bind:selectedRunnersIds
		selectedRunners={selectedRunnersWithCurrentLegOnly}
		runners={data.event.runners}
		legs={data.event.legs}
		{legNumber}
	/>

	<Settings />

	<TracksLabels
		routechoices={data.event.legs[legNumber - 1]?.routechoices ?? []}
		{selectedRunnersWithCurrentLegOnly}
		bind:hoveredRunnerId
	/>

	<OlMap {isDrawingNewRoutechoice} {angle} {fitBox} padding={[100, 0, 100, 0]}>
		{#if isDrawingNewRoutechoice}
			<Draw type={'LineString'} on:drawEnd={handleDrawEnd} />
		{/if}

		<GeoreferencedImage eventMap={data.eventMap} />

		<VectorLayer>
			{#if showRoutechoices}
				{#each legRoutechoices as routechoice (routechoice.id)}
					<RoutechoiceTrack {routechoice} opacity={0.8} width={6} />
				{/each}
			{/if}

			{#if hoveredRunnerId !== null}
				{@const hoveredRunner =
					selectedRunnersWithCurrentLegOnly.find((r) => r.id === hoveredRunnerId) ??
					selectedRunnersWithCurrentLegOnly[0]}

				<RunnerRoute
					runnerLeg={hoveredRunner.legs[0]}
					name={hoveredRunner.lastName}
					track={hoveredRunner.track}
					startTime={hoveredRunner.startTime}
					timeOffset={hoveredRunner.timeOffset}
					isEmphasized={hoveredRunnerId === hoveredRunner.id}
					zIndex={selectedRunnersWithCurrentLegOnly.length}
				/>
			{/if}

			{#each selectedRunnersWithCurrentLegOnly.filter((r) => r.id !== hoveredRunnerId) as runner, runnerIndex (runner.id)}
				<RunnerRoute
					runnerLeg={runner.legs[0]}
					name={runner.lastName}
					track={runner.track}
					startTime={runner.startTime}
					timeOffset={runner.timeOffset}
					isEmphasized={hoveredRunnerId === runner.id}
					zIndex={selectedRunnersWithCurrentLegOnly.length - 1 - runnerIndex}
				/>
			{/each}
		</VectorLayer>
	</OlMap>

	<ActionButtons {legNumber} legs={data.event.legs} />
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
