<script lang="ts">
	import { page } from '$app/stores';
	import type { RunnerWithLegsAndTracks } from '$lib/models/runner.model';
	import type { Routechoice, Runner } from '$lib/server/db/models';
	import { secondsToPrettyTime } from '$lib/utils/split-times';
	import { settingsStore } from '../settings-store';

	export let routechoices: Routechoice[];
	export let selectedRunnersWithCurrentLegOnly: RunnerWithLegsAndTracks[];
	export let hoveredRunnerId: string | null = null;

	let isCollapsed = false;

	$: isSettingsSidebarShown = $page.url.searchParams.has('showSettings');

	$: showRoutechoicesLabels =
		$settingsStore.routechoicesLabels === 'aside' &&
		!$page.url.searchParams.has('hideRoutechoices') &&
		routechoices.length !== 0;

	$: showRunnersTraksLabels =
		$settingsStore.runnersLabels === 'aside' && selectedRunnersWithCurrentLegOnly.length !== 0;
</script>

{#if showRoutechoicesLabels || showRunnersTraksLabels}
	<article
		class="z-1 absolute right-4 bottom-17 md:bottom-4 transition-transform transition-250 bg-background-color m-0 py-1 px-0
			max-h-100 flex flex-col rounded-none border-solid border-1 border-table-border-color"
		class:-translate-x-55={isSettingsSidebarShown && !isCollapsed}
		class:translate-x-full={isCollapsed && !isSettingsSidebarShown}
		class:translate-x-[calc(100%-13.75rem)]={isCollapsed && isSettingsSidebarShown}
	>
		{#if showRoutechoicesLabels}
			<ul class="py-0 m-0 shrink-0 pr-2 pl-4">
				{#each routechoices as routechoice (routechoice.id)}
					<li style:color={routechoice.color} class="list-none text-5 m-0 text-right">
						{routechoice.name}
						{Math.round(routechoice.length)}m
						{#if routechoice.elevation !== null}
							| {Math.round(routechoice.elevation)}m
						{/if}
					</li>
				{/each}
			</ul>
		{/if}

		{#if showRoutechoicesLabels && showRunnersTraksLabels}
			<hr class="my-2" />
		{/if}

		{#if showRunnersTraksLabels}
			<ul class="p-0 m-0 grow-1 overflow-y-auto">
				{#each selectedRunnersWithCurrentLegOnly as runner (runner.id)}
					<li
						style:color={runner.track.color}
						class="list-none text-5 m-0 pr-2 pl-4 text-right hover:bg-pico-dropdown-hover-background-color"
						on:mouseenter={() => (hoveredRunnerId = runner.id)}
						on:mouseleave={() => (hoveredRunnerId = null)}
					>
						{runner.lastName}
						{secondsToPrettyTime(runner.legs[0].time)}
					</li>
				{/each}
			</ul>
		{/if}

		<div
			class="absolute top-50% -translate-y-50% right-full translate-x-50% rounded-full bg-background-color"
		>
			<button
				type="button"
				class="rounded-full w-8 h-8 p-0 m-0 flex items-center justify-center outline"
				on:click={() => (isCollapsed = !isCollapsed)}
			>
				<i
					class="i-carbon-chevron-right block w-5 h-5 transition-transform transition-250"
					class:rotate-180={isCollapsed}
				></i>
			</button>
		</div>
	</article>
{/if}

<style>
</style>
