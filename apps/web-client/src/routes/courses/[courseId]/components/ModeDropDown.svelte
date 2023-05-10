<script lang="ts">
	import { page } from '$app/stores';
	import ExternalLink from '$lib/components/icons/ExternalLink.svelte';
	import { SPLITTIMES_BASE_URL } from '$lib/constants.js';
	import { splittimesProviderKey } from '../../../../environments/environment.js';
	import { ModesEnum } from '../models/modes.enum.js';
	import { addSearchParamsToURL } from '../utils.js';

	export let mode: ModesEnum;
	export let courseId: string;

	let modeDropdown: HTMLDetailsElement;
</script>

<details bind:this={modeDropdown} role="list" class="mode-select">
	<summary aria-haspopup="listbox">
		{#if mode === ModesEnum.ANALYSIS}
			Analysis
		{:else}
			Draw
		{/if}
	</summary>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<ul role="listbox" on:click={() => modeDropdown.removeAttribute('open')}>
		<li><a href={addSearchParamsToURL($page.url, 'mode', ModesEnum.ANALYSIS)}>Analysis</a></li>

		<li><a href={addSearchParamsToURL($page.url, 'mode', ModesEnum.DRAW)}>Draw routechoices</a></li>

		<li>
			<a
				href="{SPLITTIMES_BASE_URL}/{splittimesProviderKey}/{courseId}/classes/1"
				target="_blank"
				rel="noreferrer"
			>
				Split times
				<ExternalLink --width="0.75rem" --height="0.75rem" />
			</a>
		</li>
	</ul>
</details>

<style>
	/* TODO better positioning and sizing  */
	.mode-select {
		position: absolute;
		top: 0.1875rem;
		left: 50%;
		width: 13rem;
		margin-left: -6.5rem;
		margin-bottom: 0;
		z-index: 2;
	}

	.mode-select summary {
		padding-top: 0.375rem;
		padding-bottom: 0.375rem;
		height: 2.625rem;
	}

	@media screen and (max-width: 768px) {
		.mode-select {
			top: 0.375rem;
			font-size: 0.75rem;
		}

		.mode-select summary {
			height: 2.3125rem;
		}
	}
</style>
