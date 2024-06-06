<script lang="ts">
	import { page } from '$app/stores';
	import { deleteSearchParamsToURL } from '$lib/helpers';
	import type { RunnerWithNullableLegsAndTrack } from '$lib/models/runner.model';
	import { fade } from 'svelte/transition';
	import { selectedRunnerIdStore } from '../../selected-runner-store';

	export let runners: RunnerWithNullableLegsAndTrack[];

	let filter = '';
	let filteredRunner: RunnerWithNullableLegsAndTrack[];

	$: {
		const trimedLowerCaseFilter = filter.trim().toLowerCase();

		filteredRunner =
			trimedLowerCaseFilter === ''
				? runners
				: runners.filter(
						(r) =>
							r.firstName.toLowerCase().includes(trimedLowerCaseFilter) ||
							r.lastName.toLowerCase().includes(trimedLowerCaseFilter)
					);
	}

	$: closeUrl = deleteSearchParamsToURL($page.url, 'showRunnerSelect');
</script>

<dialog open transition:fade={{ duration: 125 }}>
	<article class="relative">
		<a
			href={closeUrl === '' ? $page.url.pathname : closeUrl}
			aria-label="Close"
			class="close absolute top-10 right-4 m-0"
			data-sveltekit-replacestate
		/>

		<label>
			Runner Name
			<input type="text" bind:value={filter} />
		</label>

		<ul>
			{#each filteredRunner as runner (runner.id)}
				<li>
					<a
						href={closeUrl}
						data-sveltekit-replacestate
						on:click={() => ($selectedRunnerIdStore = runner.id)}
					>
						{runner.firstName}
						{runner.lastName}
					</a>
				</li>
			{/each}
		</ul>
	</article>
</dialog>

<style>
	article {
		padding: 2rem;
		height: calc(90vh - var(--pico-spacing) * 2);
	}

	ul li {
		list-style: none;
	}
</style>
