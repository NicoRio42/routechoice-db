<script>
	import { page } from '$app/stores';
	import { deleteSearchParamsToURL } from '$lib/helpers';
	import { labelPositionEnum, runnersTracksColorsEnum, settingsStore } from '../settings-store';

	$: showSidebar = $page.url.searchParams.has('showSettings');

	$: console.log($settingsStore.runnersTracksOpacity);

	let routechoicesLabels = $settingsStore.routechoicesLabels;
	let runnersLabels = $settingsStore.runnersLabels;
	let runnersTracksColors = $settingsStore.runnersTracksColors;
</script>

<aside
	class="z-3 absolute top-0 right-0 bottom-0 w-55 border-l-solid border-l-1 border-l-table-border-color
        bg-background-color translate-x-full transition-transform transition-250 p-4 overflow-y-auto"
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

		<div class="switch flex">
			<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
			<label
				role="button"
				class="grow shrink-1 basis-0 w-0"
				class:outline={routechoicesLabels !== labelPositionEnum.Values.nextToTrack}
			>
				<input
					type="radio"
					name="routechoicesLabels"
					bind:group={routechoicesLabels}
					value={labelPositionEnum.Values.nextToTrack}
				/>
				Track
			</label>

			<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
			<label
				role="button"
				class="grow shrink-1 basis-0 w-0"
				class:outline={routechoicesLabels !== labelPositionEnum.Values.aside}
			>
				<input
					type="radio"
					name="routechoicesLabels"
					bind:group={routechoicesLabels}
					value={labelPositionEnum.Values.aside}
				/>
				Aside
			</label>

			<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
			<label
				role="button"
				class="grow shrink-1 basis-0 w-0"
				class:outline={routechoicesLabels !== labelPositionEnum.Values.none}
			>
				<input
					type="radio"
					name="routechoicesLabels"
					bind:group={routechoicesLabels}
					value={labelPositionEnum.Values.none}
				/>
				None
			</label>
		</div>
	</fieldset>

	<fieldset on:change={() => ($settingsStore.runnersLabels = runnersLabels)}>
		<legend>Runners labels</legend>

		<div class="switch flex">
			<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
			<label
				role="button"
				class="grow shrink-1 basis-0 w-0"
				class:outline={runnersLabels !== labelPositionEnum.Values.nextToTrack}
			>
				<input
					type="radio"
					name="runnersLabels"
					bind:group={runnersLabels}
					value={labelPositionEnum.Values.nextToTrack}
				/>
				Track
			</label>

			<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
			<label
				role="button"
				class="grow shrink-1 basis-0 w-0"
				class:outline={runnersLabels !== labelPositionEnum.Values.aside}
			>
				<input
					type="radio"
					name="runnersLabels"
					bind:group={runnersLabels}
					value={labelPositionEnum.Values.aside}
				/>
				Aside
			</label>

			<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
			<label
				role="button"
				class="grow shrink-1 basis-0 w-0"
				class:outline={runnersLabels !== labelPositionEnum.Values.none}
			>
				<input
					type="radio"
					name="runnersLabels"
					bind:group={runnersLabels}
					value={labelPositionEnum.Values.none}
				/>
				None
			</label>
		</div>
	</fieldset>

	<fieldset on:change={() => ($settingsStore.runnersTracksColors = runnersTracksColors)}>
		<legend>Tracks colors</legend>

		<div class="switch flex">
			<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
			<label
				role="button"
				class="grow shrink-1 basis-0 w-0"
				class:outline={runnersTracksColors !== runnersTracksColorsEnum.Values.original}
			>
				<input
					type="radio"
					name="runnersTracksColors"
					bind:group={runnersTracksColors}
					value={runnersTracksColorsEnum.Values.original}
				/>
				Orig.
			</label>

			<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
			<label
				role="button"
				class="grow shrink-1 basis-0 w-0"
				class:outline={runnersTracksColors !== runnersTracksColorsEnum.Values.time}
			>
				<input
					type="radio"
					name="runnersTracksColors"
					bind:group={runnersTracksColors}
					value={runnersTracksColorsEnum.Values.time}
				/>
				Time
			</label>

			<!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
			<label
				role="button"
				class="grow shrink-1 basis-0 w-0"
				class:outline={runnersTracksColors !== runnersTracksColorsEnum.Values.routechoice}
			>
				<input
					type="radio"
					name="runnersTracksColors"
					bind:group={runnersTracksColors}
					value={runnersTracksColorsEnum.Values.routechoice}
				/>
				RC
			</label>
		</div>
	</fieldset>

	<fieldset>
		<label>
			Tracks opacity

			<input
				type="range"
				step="0.01"
				min="0.1"
				max="1"
				bind:value={$settingsStore.runnersTracksOpacity}
			/>
		</label>
	</fieldset>
</aside>

<style>
	.switch input {
		display: none;
	}

	.switch label {
		padding: 0.25rem 0.5rem;
		border-radius: 0;
	}

	.switch label:first-of-type {
		border-top-left-radius: 0.25rem;
		border-bottom-left-radius: 0.25rem;
	}

	.switch label:last-of-type {
		border-top-right-radius: 0.25rem;
		border-bottom-right-radius: 0.25rem;
	}

	.switch label:not(:last-of-type) {
		border-right: none;
	}
</style>
