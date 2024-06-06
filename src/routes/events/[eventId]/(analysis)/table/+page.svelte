<script lang="ts">
	import { page } from '$app/stores';
	import { addSearchParamsToURL } from '$lib/helpers';
	import { secondsToPrettyTime } from '$lib/utils/split-times';
	import EnlargeToggle from '../components/EnlargeToggle.svelte';
	import { selectedRunnerIdStore } from '../selected-runner-store';
	import LegCell from './components/LegCell.svelte';
	import RunnerSelect from './components/RunnerSelect.svelte';
	import './tooltip.css';

	export let data;

	let compact = false;

	$: showRunnerSelect = $page.url.searchParams.get('showRunnerSelect') !== null;
	$: selectedRunner = data.event.runners.find((r) => r.id === $selectedRunnerIdStore) ?? null;
</script>

{#if showRunnerSelect}
	<RunnerSelect runners={data.event.runners} />
{/if}

<figure class="wrapper overflow-auto grow z-1">
	<table class="striped">
		<thead>
			<tr>
				<th class="sticky-top sticky-left compact-toggle name-th z-index-1">
					<EnlargeToggle bind:compact />
				</th>

				{#each data.event.legs as _, index}
					<th class="sticky-top center z-index-1">
						<a href="/events/{$page.params.eventId}/map?legNumber={index + 1}">
							{#if index === data.event.legs.length - 1}
								Finish
							{:else}
								{index + 1}
							{/if}
						</a>
					</th>
				{/each}
			</tr>
		</thead>

		<tbody>
			{#each data.event.runners as runner (runner.id)}
				<tr>
					<td class="sticky-left z-index-1 !px-1 md:!px-2">
						<div class="name-td-content">
							{#if runner.rank}
								{runner.rank}
							{/if}

							<div class="tooltip-container">
								{#if compact}
									{runner.firstName?.at(0)}{runner.lastName?.at(0)}
								{:else}
									{runner.firstName?.at(0)}.{runner.lastName}

									{#if runner.time}
										<div>
											{secondsToPrettyTime(runner.time)}
										</div>
									{/if}
								{/if}

								<div class="tooltip tooltip-right">
									<div class="nowrap">
										{runner.firstName}&nbsp;{runner.lastName}
									</div>

									{#if runner.timeBehind}
										+&nbsp;{secondsToPrettyTime(runner.timeBehind)}
									{/if}

									{#if runner.totalTimeLost}
										<div class="nowrap">
											Time lost:&nbsp;{secondsToPrettyTime(runner.totalTimeLost)}
										</div>
									{/if}
								</div>
							</div>
						</div>
					</td>

					{#each runner.legs as runnerLeg, index}
						<LegCell {runnerLeg} isLastSplit={index === runner.legs.length - 1} />
					{/each}
				</tr>
			{/each}

			<tr class="relative">
				<td class="sticky-left sticky-bottom selected-runner-td z-index-1 px-1">
					<a
						href={addSearchParamsToURL($page.url, 'showRunnerSelect', 'true')}
						role="button"
						class="outline !flex !w-full items-center justify-between py0 px1 text-3.5 min-h-10"
					>
						<div class=" grow text-left">
							{#if compact}
								<span class="my-2 nowrap">
									{#if selectedRunner !== null}
										{selectedRunner.firstName?.at(0)}{selectedRunner.lastName?.at(0)}
									{:else}
										SR
									{/if}
								</span>
							{:else if selectedRunner !== null}
								<div class="nowrap ml-1">
									{selectedRunner.firstName?.at(0)}.{selectedRunner.lastName}

									{#if selectedRunner.time}
										<div class="text-left">
											{secondsToPrettyTime(selectedRunner.time)}
										</div>
									{/if}
								</div>
							{:else}
								<span class="nowrap my2">Select runner</span>
							{/if}
						</div>

						<i class="i-carbon-chevron-down block h4 w4" />
					</a>
				</td>

				{#if selectedRunner !== null}
					{#each selectedRunner.legs as runnerLeg, index}
						<LegCell
							{runnerLeg}
							stickyBottom={true}
							isLastSplit={index === selectedRunner.legs.length - 1}
						/>
					{/each}
				{:else}
					{#each data.event.legs as _}
						<td class="sticky-bottom thick-border-top">--</td>
					{/each}
				{/if}
			</tr>
		</tbody>
	</table>
</figure>

<style>
	.wrapper {
		flex-basis: 0;
		flex-shrink: 0;
		flex-grow: 1;
		margin: 2.75rem 0 0;
		position: relative;
	}

	table {
		font-size: 0.875rem;
	}

	table :global(td) {
		padding: calc(var(--pico-spacing) / 2);
	}

	.center {
		text-align: center;
	}

	.name-th {
		z-index: 2;
	}

	.name-td-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		height: 100%;
	}

	.sticky-top,
	.sticky-left,
	.sticky-bottom {
		position: sticky;
		background-color: var(--pico-background-color);
	}

	.z-index-1 {
		z-index: 1;
	}

	.sticky-top {
		top: 0;
	}

	.sticky-left {
		left: 0;
		border-right: 0.1875rem solid var(--pico-table-border-color);
	}

	.sticky-bottom {
		bottom: 0;
	}

	.nowrap {
		white-space: nowrap;
	}

	.compact-toggle {
		z-index: 2;
	}

	table {
		margin: 0;
		border-collapse: initial;
	}

	.selected-runner-td {
		border-top: 0.1875rem solid var(--pico-table-border-color);
	}

	.thick-border-top {
		border-top: 0.1875rem solid var(--pico-table-border-color);
	}
</style>
