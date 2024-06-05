<script>
	import { page } from '$app/stores';
	import { deleteSearchParamsToURL } from '$lib/helpers';
	import { labelPositionEnum, settingsStore } from '../settings-store';

	$: showSidebar = $page.url.searchParams.has('showSettings');

	let routechoicesLabels = $settingsStore.routechoicesLabels;
	let runnersLabels = $settingsStore.runnersLabels;
</script>

<aside
	class="z-3 absolute top-0 right-0 bottom-0 w-full sm:w-50 border-l-solid border-l-1 border-l-table-border-color
        bg-background-color translate-x-full transition-transform transition-250 p-4"
	class:!translate-x-0={showSidebar}
>
	<h2 class="flex items-center justify-between gap-8">
		Settings

		<a
			href={deleteSearchParamsToURL($page.url, 'showSettings')}
			data-sveltekit-replacestate
			role="button"
			class="outline flex items-center justify-center p-2 float-right border-none focus:shadow-none"
		>
			<i class="block i-carbon-close-large w-5 h-5"></i>
		</a>
	</h2>

	<fieldset on:change={() => ($settingsStore.routechoicesLabels = routechoicesLabels)}>
		<legend>Routechoices labels</legend>

		<label>
			<input
				type="radio"
				name="routechoicesLabels"
				bind:group={routechoicesLabels}
				value={labelPositionEnum.Values.nextToTrack}
			/>
			Next to track
		</label>

		<label>
			<input
				type="radio"
				name="routechoicesLabels"
				bind:group={routechoicesLabels}
				value={labelPositionEnum.Values.aside}
			/>
			Aside
		</label>

		<label>
			<input
				type="radio"
				name="routechoicesLabels"
				bind:group={routechoicesLabels}
				value={labelPositionEnum.Values.none}
			/>
			None
		</label>
	</fieldset>

	<fieldset on:change={() => ($settingsStore.runnersLabels = runnersLabels)}>
		<legend>Runners labels</legend>

		<label>
			<input
				type="radio"
				name="runnersLabels"
				bind:group={runnersLabels}
				value={labelPositionEnum.Values.nextToTrack}
			/>
			Next to track
		</label>

		<label>
			<input
				type="radio"
				name="runnersLabels"
				bind:group={runnersLabels}
				value={labelPositionEnum.Values.aside}
			/>
			Aside
		</label>

		<label>
			<input
				type="radio"
				name="runnersLabels"
				bind:group={runnersLabels}
				value={labelPositionEnum.Values.none}
			/>
			None
		</label>
	</fieldset>
</aside>
