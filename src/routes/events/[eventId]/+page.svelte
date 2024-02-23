<script lang="ts">
	import { page } from '$app/stores';
	import { RolesEnum } from '$lib/models/enums/roles.enum.js';
	import type { EventWithLiveEventsRunnersLegsAndControlPoints as Event } from '$lib/models/event.model.js';
	import type { User } from 'lucia';
	import type { LineString } from 'ol/geom.js';
	import type { DrawEvent } from 'ol/interaction/Draw.js';
	import { onDestroy, onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { eventStore } from '$lib/stores/event-store.js';
	import ActionButtons from './components/ActionButtons.svelte';
	import AddRoutechoiceDialog from './components/AddRoutechoiceDialog.svelte';
	import Draw from './components/Draw.svelte';
	import GeoreferencedImage from './components/GeoreferencedImage.svelte';
	import ManageRoutechoicesDialog from './components/ManageRoutechoicesDialog.svelte';
	import OlMap from './components/OLMap.svelte';
	import RoutechoiceTrack from './components/RoutechoiceTrack.svelte';
	import RunnerRoute from './components/RunnerRoute.svelte';
	import SideBar from './components/SideBar.svelte';
	import VectorLayer from './components/VectorLayer.svelte';
	import './styles.css';
	import {
		computeFitBoxAndAngleFromLegNumber,
		getLegNumberFromSearchParams
	} from './utils.js';
	import { mapIsLoading } from "./stores/map-loading.store.js"
	import { pushNotification } from '$lib/components/Notifications.svelte';

	export let data;

	$eventStore = {name: data.event.name, id: data.event.id}
	$mapIsLoading = true;

	let angle: number;
	let fitBox: [number, number, number, number];
	let selectedRunners: string[] = [];
	let showRoutechoices = true;
	let isAutoAnalysisMode = false;
	let currentDrawnRoutechoice: null | LineString = null;
	let showAddRoutechoiceDialog = false;
	let showManageRoutechoicesDialog = false;
	let isDrawingNewRoutechoice = false;

	// $: mode = getModeFromSearchParams($page.url.searchParams);
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
	
	onMount(() => {
		data.promises.tracks.then(tracks => {
			data.event.runners = data.event.runners.map((runner) => {
				const track = tracks.find((t) =>
					t.trackingDeviceId === runner.trackingDeviceId && t.fkLiveEvent === runner.fkLiveEvent
				);
					
				return { ...runner, track: track === undefined ? null : track.track };
			})
		}).catch(() => {
			pushNotification("Could not load GPS tracks from Loggator.", "error", 5)
		})	
	})

	async function handleDrawEnd(e: CustomEvent<DrawEvent>): Promise<void> {
		currentDrawnRoutechoice = e.detail.feature.getGeometry() as LineString;
		showAddRoutechoiceDialog = true;
	}

	async function handleRunnerTimeOffsetChange(event: CustomEvent<string>): Promise<void> {}

	onDestroy(() => $eventStore = null)
</script>

<svelte:head>
	<meta property="og:title" content="Routechoice DB | {data.event.name}">
	<meta property="og:type" content="website" />
	<meta property="og:image" content={data.eventMap.url}>
	<meta property="og:url" content={$page.url.href.split('?')[0]}>
	<meta name="twitter:card" content="summary_large_image">
</svelte:head>

{#if data.event.legs.length !== 0}
	<ManageRoutechoicesDialog
		routechoices={data.event.legs[legNumber - 1].routechoices}
		eventId={data.event.id}
		bind:show={showManageRoutechoicesDialog}
		on:startDrawingNewRoutechoice={() => isDrawingNewRoutechoice = true}
	/>
{/if}
	
<div class="wrapper">
	{#if $mapIsLoading}
		<article class="absolute z-1 bg-transparent top-40% left-50% -translate-x-50% -translate-y-50% backdrop-blur rounded-xl" aria-busy="true">
			Map is loading
		</article>
	{/if}

	{#if data.event.legs.length !== 0 && data.user?.role === RolesEnum.Enum.admin}
		<button
			on:click={() => showManageRoutechoicesDialog = !showManageRoutechoicesDialog}
			class="hidden btn-unset absolute top-25 right-2 z-1 bg-white text-black w-6 h-6 sm:flex items-center justify-center"
		>
			{#if showManageRoutechoicesDialog }
				<i class="block i-carbon-edit-off"></i>
			{:else}
				<i class="block i-carbon-edit"></i>
			{/if}
		</button>
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
