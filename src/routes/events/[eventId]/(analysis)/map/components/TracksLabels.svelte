<script lang="ts">
	import { page } from '$app/stores';
	import type { RunnerWithLegsAndTracks } from '$lib/models/runner.model';
	import type { Routechoice, Runner } from '$lib/server/db/models';
	import { secondsToPrettyTime } from '$lib/utils/split-times';
	import { settingsStore } from '../settings-store';

	export let routechoices: Routechoice[];
	export let selectedRunnersWithCurrentLegOnly: RunnerWithLegsAndTracks[];
	export let hoveredRunnerId: string | null = null;

	$: isSettingsSidebarShown = $page.url.searchParams.has('showSettings');
</script>

{#if $settingsStore.routechoicesLabels === 'aside' || ($settingsStore.runnersLabels === 'aside' && selectedRunnersWithCurrentLegOnly.length !== 0)}
	<article
		class="z-1 absolute right-4 bottom-17 md:bottom-4 transition-transform transition-250 bg-background-color m-0 p-y-1 p-x-0
			max-h-100 flex flex-col"
		class:-sm:translate-x-50={isSettingsSidebarShown}
	>
		{#if $settingsStore.routechoicesLabels === 'aside'}
			<ul class="p-0 m-0 shrink-0 px-2">
				{#each routechoices as routechoice (routechoice.id)}
					<li style:color={routechoice.color} class="list-none text-5 font-900 m-0 text-right">
						{routechoice.name}
						{Math.round(routechoice.length)}m
						{#if routechoice.elevation !== null}
							| {Math.round(routechoice.elevation)}m
						{/if}
					</li>
				{/each}
			</ul>
		{/if}

		{#if $settingsStore.runnersLabels === 'aside' && selectedRunnersWithCurrentLegOnly.length !== 0}
			<hr class="my-2" />

			<ul class="p-0 m-0 grow-1 overflow-y-auto">
				{#each selectedRunnersWithCurrentLegOnly as runner (runner.id)}
					<li
						style:color={runner.track.color}
						class="list-none text-5 font-900 m-0 px-2 text-right hover:bg-pico-dropdown-hover-background-color"
						on:mouseenter={() => (hoveredRunnerId = runner.id)}
						on:mouseleave={() => (hoveredRunnerId = null)}
					>
						{runner.lastName}
						{secondsToPrettyTime(runner.legs[0].time)}
					</li>
				{/each}
			</ul>
		{/if}
	</article>
{/if}

<style>
</style>
