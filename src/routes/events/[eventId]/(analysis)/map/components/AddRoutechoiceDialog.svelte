<script lang="ts">
	import type { LegWithRoutechoices } from '$lib/models/leg.model.js';
	import type { LineString } from 'ol/geom.js';
	import { names, routesColors } from 'orienteering-js/ocad';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';

	export let leg: LegWithRoutechoices;
	export let currentDrawnRoutechoice: LineString;

	let name: string;
	let color: string;
	let allowedNames: string[];

	const dispatchCancel = createEventDispatcher<{ cancel: void }>();

	$: {
		allowedNames = names.filter(
			(name) =>
				!leg.routechoices.some(
					(routechoice) => routechoice.name.toLowerCase() === name.toLowerCase()
				)
		);

		name = allowedNames[0];

		color = routesColors.filter(
			(color) =>
				!leg.routechoices.some(
					(routechoice) => routechoice.color.toLowerCase() === color.toLowerCase()
				)
		)[0];
	}
</script>

<dialog open transition:fade>
	<article>
		<form method="post" action="?/addRoutechoice" class="min-w-75">
			<input type="hidden" name="legId" value={leg.id} />

			<label for="name">
				Name

				<select bind:value={name} name="name" required>
					{#each allowedNames as value}
						<option {value}>{value}</option>
					{/each}
				</select>
			</label>

			<label for="color">
				Color

				<input bind:value={color} type="color" name="color" required />
			</label>

			<input
				type="hidden"
				name="track"
				value={JSON.stringify(currentDrawnRoutechoice.getCoordinates())}
			/>

			<button type="submit">Add Routechoice</button>

			<button type="button" class="outline" on:click={() => dispatchCancel('cancel')}>
				Cancel
			</button>
		</form>
	</article>
</dialog>
