<script lang="ts">
	import { page } from '$app/stores';
	import type { Leg } from '$lib/server/db/schema.js';
	import { addSearchParamsToURL, deleteSearchParamsToURL } from '../utils.js';

	export let legNumber: number;
	export let legs: Leg[];
	export let showRoutechoices: boolean;
	export let isAutoAnalysisMode: boolean;

	const numberOfLegs = legs.length;
	let showMapButtons = false;

	function getPreviousLegNumber() {
		return legNumber !== 1 ? legNumber - 1 : legNumber;
	}

	function getNextLegNumber() {
		return legNumber !== numberOfLegs ? legNumber + 1 : legNumber;
	}
</script>

<div class="control-bar">
	<!-- <button
		class="map-buttons-toggler mobile btn"
		on:click={() => (showMapButtons = !showMapButtons)}
	>
		<i class="i-carbon-overflow-menu-horizontal" />
	</button>

	<button
		class="map-button mobile btn"
		on:click={() => (isAutoAnalysisMode = !isAutoAnalysisMode)}
		style:transform={showMapButtons ? 'translateY(-230%)' : 'translateY(0)'}>AA</button
	>

	<button
		class="map-button mobile btn"
		on:click={() => (showRoutechoices = !showRoutechoices)}
		style:transform={showMapButtons ? 'translateY(-115%)' : 'translateY(0)'}
	>
		<i class="i-carbon-view" />
	</button>

	<button class="large btn" on:click={() => (isAutoAnalysisMode = !isAutoAnalysisMode)}>AA</button> -->

	<button class="rounded-full flex items-center justify-center w-12 h-12 m-0 p-0"
		on:click={() => (showRoutechoices = !showRoutechoices)}
	>
		<i class="i-carbon-view inline-block w-5 h-5" />
	</button>

	<a
		role="button"
		class="rounded-full !flex items-center justify-center w-12 h-12 m-0 p-0"
		href={addSearchParamsToURL($page.url, 'legNumber', getPreviousLegNumber().toString())}
		data-sveltekit-replacestate
	>
		<i class="i-carbon-chevron-left inline-block w-5 h-5" />
	</a>

	<form class="m-0" data-sveltekit-replacestate>
		<select
			name="legNumber"
			id="leg-select"
			bind:value={legNumber}
			on:change={(e) => e.currentTarget.form?.submit()}
		>
			{#each [...Array(numberOfLegs).keys()] as leg, legIndex}
				<option value={leg + 1}>
					{#if legIndex === numberOfLegs - 1}
						Finish
					{:else}
						{leg + 1}
					{/if}
				</option>
			{/each}
		</select>
	</form>

	<a
		role="button"
		class="rounded-full !flex items-center justify-center w-12 h-12 m-0  p-0"
		href={addSearchParamsToURL($page.url, 'legNumber', getNextLegNumber().toString())}
		data-sveltekit-replacestate
	>
		<i class="i-carbon-chevron-right inline-block w-5 h-5" />
	</a>

	<a
		role="button"
		class="rounded-full !flex items-center justify-center w-12 h-12 m-0  p-0"
		href={$page.url.searchParams.has('hideSideBar')
			? deleteSearchParamsToURL($page.url, 'hideSideBar')
			: addSearchParamsToURL($page.url, 'hideSideBar', '')}
		data-sveltekit-replacestate
	>
		<i class="i-carbon-chart-column inline-block w-5 h-5" />
	</a>
</div>

<style>
	.control-bar {
		position: fixed;
		bottom: var(--pico-form-element-spacing-vertical);
		left: 50%;
		transform: translate(-50%);
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		z-index: 1;
	}

	select {
		width: 5rem;
		border-radius: 0.5rem;
		margin-bottom: 0;
	}

	#leg-select {
		padding-right: var(--pico-form-element-spacing-horizontal);
		background-position: center right 0.375rem;
	}

	.map-buttons-toggler {
		z-index: 2;
	}

	.map-button {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 1;
		transform: translateY(0);
		transition: transform 0.25s;
	}

	.mobile {
		display: inherit;
	}

	.large {
		display: none;
	}

	@media screen and (min-width: 500px) {
		.control-bar {
			/* transform: translate(calc(-50% - 1.75rem)); */
			transform: translate(-50%);
		}

		.map-buttons-toggler {
			display: none;
		}

		.map-button {
			transform: translateX(calc(-1 * calc(100% + 0.5rem)));
		}

		.mobile {
			display: none;
		}

		.large {
			display: inherit;
		}
	}
</style>
