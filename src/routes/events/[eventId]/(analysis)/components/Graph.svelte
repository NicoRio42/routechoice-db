<script lang="ts">
	import { clickOutside } from '$lib/actions/click-outside.js';
	import { addAlpha } from '$lib/helpers';
	import type { RunnerWithNullableLegsAndTrack } from '$lib/models/runner.model';
	import { routesColors } from 'orienteering-js/ocad';
	import Polyline from '../components/Polyline.svelte';
	import EnlargeToggle from './EnlargeToggle.svelte';

	export let runners: RunnerWithNullableLegsAndTrack[];
	export let runnerLegKey: 'timeBehindSuperman' | 'timeBehindOverall';
	export let eventId: string;

	const supermanOrLeader = getSupermanOverallTimes(runners);

	let validRunners = runners.filter((r) => r.status === 'ok');
	let selectedRunners = validRunners.slice(0, 6);
	let hoveredLegIndex = 1;
	let compact = false;
	const maxX = supermanOrLeader.at(-1)!;
	let displayPanel = false;

	$: areAllRunnersSelected = selectedRunners.length === validRunners.length;
	$: maxY =
		selectedRunners.length === 0
			? 0
			: Math.max(
					...selectedRunners.flatMap((r) => r.legs.map((l) => (l === null ? 0 : l[runnerLegKey]!)))
				);

	function getCoordsFromRunner(runner: RunnerWithNullableLegsAndTrack) {
		return [[0, 0]].concat(
			runner.legs.map((leg, index) => {
				const value = leg === null ? 0 : leg[runnerLegKey]!;
				return [supermanOrLeader[index], value];
			})
		);
	}

	function getSupermanOverallTimes(runners: RunnerWithNullableLegsAndTrack[]): number[] {
		let previousTime = 0;

		const supermanOverall = runners[0].legs.map((leg, legIndex) => {
			let bestSplit = leg?.time ?? null;

			runners.forEach((runner) => {
				const runnerLeg = runner.legs[legIndex];
				if (runnerLeg === null) return;
				if (bestSplit === null || runnerLeg.time < bestSplit) bestSplit = runnerLeg.time;
			});

			if (bestSplit === null) throw new Error('Not enouth runners');

			const time = previousTime + bestSplit;
			previousTime = time;
			return time;
		});

		return supermanOverall;
	}
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === 'Escape') displayPanel = false;
	}}
/>

<figure class="overflow-auto pt-14">
	<form>
		<p class="header">
			<small>
				<input
					type="checkbox"
					checked={areAllRunnersSelected}
					on:change={(e) => (selectedRunners = e.currentTarget.checked ? validRunners : [])}
				/>
			</small>

			<EnlargeToggle bind:compact />
		</p>

		{#each validRunners as runner, runnerIndex (runner.id)}
			<label style:color={routesColors[runnerIndex] ?? 'black'}>
				<small>
					<input
						type="checkbox"
						value={runner}
						bind:group={selectedRunners}
						style:--pico-border-color={routesColors[runnerIndex]}
						style:--pico-primary-background={routesColors[runnerIndex]}
						style:--pico-form-element-focus-color={addAlpha(
							routesColors[runnerIndex] ?? '#FFFFFF',
							0.13
						)}
					/>
				</small>

				{#if compact}
					{runner.firstName.at(0)}.{runner.lastName.at(0)}
				{:else}
					{runner.firstName.at(0)}. {runner.lastName}
				{/if}
			</label>
		{/each}
	</form>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="svg-wrapper"
		on:click={(e) => {
			const x = (e.offsetX * maxX) / e.currentTarget.clientWidth;
			const newHoveredLegIndex = supermanOrLeader.findIndex((l) => x < l);

			if (displayPanel && newHoveredLegIndex === hoveredLegIndex) {
				displayPanel = false;
				return;
			}

			hoveredLegIndex = newHoveredLegIndex;
			displayPanel = true;
		}}
		use:clickOutside={() => (displayPanel = false)}
	>
		<svg height="100%" width="100%" preserveAspectRatio="none" viewBox="0 0 {maxX} {maxY}">
			{#each supermanOrLeader as leg, index (index)}
				<Polyline
					color="var(--pico-table-border-color)"
					points={[
						[leg, 0],
						[leg, maxY]
					]}
				/>
			{/each}

			{#each selectedRunners as runner (runner.id)}
				{@const selectedRunnerIndex = validRunners.findIndex((r) => r.id === runner.id)}

				<Polyline
					color={routesColors[selectedRunnerIndex] ?? 'black'}
					points={getCoordsFromRunner(runner)}
				/>
			{/each}
		</svg>

		{#each supermanOrLeader as leg, index (index)}
			{@const previousLeg = index === 0 ? 0 : supermanOrLeader[index - 1]}
			<a
				href="/events/{eventId}/map?legNumber={index + 1}"
				class="x-label"
				style:left={((leg + previousLeg) / (maxX * 2)) * 100 + '%'}
			>
				{index === supermanOrLeader.length - 1 ? 'F' : index + 1}
			</a>
		{/each}
	</div>
</figure>

<style>
	figure {
		flex-basis: 0;
		flex-shrink: 0;
		flex-grow: 1;
		margin: 0;
		position: relative;
		display: flex;
		padding-right: 0.5rem;
	}

	form {
		height: 100%;
		overflow-y: scroll;
		margin: 0;
		padding-left: 0.5rem;
		padding-right: 0.25rem;
		flex: none;
	}

	.header {
		display: flex;
		align-items: center;
		margin: 0.125rem 0;
		font-size: 1rem;
	}

	label {
		white-space: nowrap;
		font-size: 1rem;
	}

	.svg-wrapper {
		padding-bottom: 1.75rem;
		position: relative;
		flex-grow: 1;
	}

	.x-label {
		position: absolute;
		bottom: 0.25rem;
		margin: 0;
		transform: translateX(-50%);
		font-size: 0.75rem;
	}

	@media (max-width: 768px) {
		svg {
			width: 50rem;
		}
	}
</style>
