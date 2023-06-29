<script lang="ts">
	import { page } from '$app/stores';
	import type { Leg } from '../models/leg.model.js';
	import { addSearchParamsToURL, deleteSearchParamsToURL } from '../utils.js';

	export let legNumber: number;
	export let legs: Leg[];
	export let showRoutechoices: boolean;
	export let isAutoAnalysisMode: boolean;

	const numberOfLegs = legs.length;
	let showMapButtons = false;

	const handlePreviousControl = () => {
		legNumber = legNumber !== 1 ? legNumber - 1 : legNumber;
	};

	const handleNextControl = () => {
		legNumber = legNumber !== numberOfLegs ? legNumber + 1 : legNumber;
	};
</script>

<div class="control-bar">
	<button
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

	<button class="large btn" on:click={() => (isAutoAnalysisMode = !isAutoAnalysisMode)}>AA</button>

	<button class="large btn" on:click={() => (showRoutechoices = !showRoutechoices)}>
		<i class="i-carbon-view" />
	</button>

	<button class="btn" on:click={handlePreviousControl}>
		<i class="i-carbon-chevron-left" />
	</button>

	<select bind:value={legNumber}>
		{#each [...Array(numberOfLegs).keys()] as leg}
			<option value={leg + 1}>{leg + 1}</option>
		{/each}
	</select>

	<button class="btn" on:click={handleNextControl}>
		<i class="i-carbon-chevron-right" />
	</button>

	<a
		role="button"
		class="btn"
		href={$page.url.searchParams.has('hideSideBar')
			? deleteSearchParamsToURL($page.url, 'hideSideBar')
			: addSearchParamsToURL($page.url, 'hideSideBar', '')}
	>
		<i class="i-carbon-chevron-chart-column" />
	</a>
</div>

<style>
	.control-bar {
		position: fixed;
		bottom: var(--form-element-spacing-vertical);
		left: 50%;
		transform: translate(-50%);
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		z-index: 1;
	}

	select {
		background-color: white;
		width: 5rem;
		border-radius: 0.5rem;
		margin-bottom: 0;
	}

	.btn {
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 0;
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
			transform: translate(calc(-50% - 1.75rem));
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
