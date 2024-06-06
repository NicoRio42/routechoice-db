<script lang="ts">
	import { page } from '$app/stores';
	import { addSearchParamsToURL, deleteSearchParamsToURL } from '$lib/helpers';
	import type { Leg } from '$lib/server/db/models.js';

	export let legNumber: number;
	export let legs: Leg[];

	$: showRoutechoices = $page.url.searchParams.has('showRoutechoices');
	const numberOfLegs = legs.length;

	function getPreviousLegNumber() {
		return legNumber !== 1 ? legNumber - 1 : legNumber;
	}

	function getNextLegNumber() {
		return legNumber !== numberOfLegs ? legNumber + 1 : legNumber;
	}
</script>

<div class="control-bar">
	<a
		role="button"
		href={showRoutechoices
			? deleteSearchParamsToURL($page.url, 'showRoutechoices')
			: addSearchParamsToURL($page.url, 'showRoutechoices', '')}
		data-sveltekit-replacestate
		class="rounded-full !flex items-center justify-center w-12 h-12 m-0 p-0"
	>
		<i
			class:i-carbon-view={!showRoutechoices}
			class:i-carbon-view-off={showRoutechoices}
			class="inline-block w-5 h-5"
		/>
	</a>

	<a
		role="button"
		class="rounded-full !flex items-center justify-center w-12 h-12 m-0 p-0"
		href={addSearchParamsToURL($page.url, 'legNumber', getPreviousLegNumber().toString())}
		data-sveltekit-replacestate
	>
		<i class="i-carbon-chevron-left inline-block w-5 h-5" />
	</a>

	<form class="m-0" data-sveltekit-replacestate>
		{#if showRoutechoices}
			<input type="hidden" name="showRoutechoices" />
		{/if}

		{#if $page.url.searchParams.has('hideSideBar')}
			<input type="hidden" name="hideSideBar" />
		{/if}

		<select
			name="legNumber"
			id="leg-select"
			bind:value={legNumber}
			on:change={(e) => {
				// To avoid full page reload
				// @ts-ignore
				e.currentTarget.nextElementSibling?.click();
			}}
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

		<input type="submit" class="hidden" />
	</form>

	<a
		role="button"
		class="rounded-full !flex items-center justify-center w-12 h-12 m-0 p-0"
		href={addSearchParamsToURL($page.url, 'legNumber', getNextLegNumber().toString())}
		data-sveltekit-replacestate
	>
		<i class="i-carbon-chevron-right inline-block w-5 h-5" />
	</a>

	<a
		role="button"
		class="rounded-full !flex items-center justify-center w-12 h-12 m-0 p-0"
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
		z-index: 2;
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

	@media screen and (min-width: 500px) {
		.control-bar {
			/* transform: translate(calc(-50% - 1.75rem)); */
			transform: translate(-50%);
		}
	}
</style>
