<script lang="ts">
	import { page } from '$app/stores';
	import { pushNotification } from '$lib/components/Notifications.svelte';
	import { parseRoutechoicesTracksInASingleLeg } from '$lib/helpers';
	import type { LegWithRoutechoices } from '$lib/models/leg.model.js';
	import type { RunnerWithNullableLegsAndTrack } from '$lib/models/runner.model';
	import { detectRunnersRoutechoicesForASingleLeg } from '$lib/routechoice-detector';
	import type { Routechoice } from '$lib/server/db/models';
	import { generateId } from 'lucia';
	import type { Coordinate } from 'ol/coordinate';
	import type { LineString } from 'ol/geom.js';
	import { transform } from 'ol/proj';
	import { names, routesColors } from 'orienteering-js/ocad';
	import { getLineStringLength } from 'orienteering-js/utils';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { NewRoutechoice } from '../addRoutechoice/new-routechoice-schema';

	export let leg: LegWithRoutechoices;
	export let currentDrawnRoutechoice: LineString;
	export let runners: RunnerWithNullableLegsAndTrack[];
	export let legIndex: number;

	let name: string;
	let color: string;
	let allowedNames: string[];
	let loading = false;
	let toofast = false;

	$: if (loading) {
		toofast = true;
		setTimeout(() => (toofast = false), 250);
	}

	type RunnerLegToUpdate = { id: string; fkRunner: string; fkDetectedRoutechoice: string | null };

	const dispatch = createEventDispatcher<{
		close: void;
		addRoutechoice: {
			newRoutechoice: Omit<Routechoice, 'elevation'>;
			runnerLegsToUpdate: RunnerLegToUpdate[];
		};
	}>();

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

	async function handleAddRoutechoice() {
		const mercatorCoordinates = currentDrawnRoutechoice.getCoordinates().map(webMercatorToLatLon);
		const latitudes = mercatorCoordinates.map((pt) => pt[1]).join(';');
		const longitudes = mercatorCoordinates.map((pt) => pt[0]).join(';');
		const length = getLineStringLength(mercatorCoordinates.map(([lat, lon]) => [lon, lat]));

		loading = true;

		const newRoutechoice = {
			id: generateId(15),
			color,
			length,
			name,
			fkLeg: leg.id,
			latitudes,
			longitudes
		};

		const legWithNewRotuechoice = {
			...leg,
			routechoices: [...leg.routechoices, { ...newRoutechoice, elevation: null }]
		};

		const runnersWithDetectedRoutechoices = detectRunnersRoutechoicesForASingleLeg(
			parseRoutechoicesTracksInASingleLeg(legWithNewRotuechoice),
			runners,
			legIndex
		);

		const runnerLegsToUpdate: RunnerLegToUpdate[] = [];

		for (const runner of runnersWithDetectedRoutechoices) {
			const runnerLeg = runner.legs[legIndex];
			if (runnerLeg === null) continue;

			runnerLegsToUpdate.push({
				id: runnerLeg.id,
				fkRunner: runner.id,
				fkDetectedRoutechoice: runnerLeg.fkDetectedRoutechoice
			});
		}

		const response = await fetch($page.url.pathname + '/addRoutechoice', {
			method: 'POST',
			body: JSON.stringify({
				...newRoutechoice,
				runnerLegsToUpdate
			} satisfies NewRoutechoice)
		});

		loading = false;

		if (!response.ok) {
			pushNotification('An error occured while adding new routechoice', { type: 'error' });
			return;
		}

		dispatch('addRoutechoice', {
			newRoutechoice,
			runnerLegsToUpdate
		});
	}

	const webMercatorToLatLon = (point: Coordinate) => transform(point, 'EPSG:3857', 'EPSG:4326');
</script>

<dialog open transition:fade={{ duration: 125 }}>
	<article>
		<form on:submit|preventDefault={handleAddRoutechoice}>
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

			<div class="flex justify-end gap-2">
				<button type="button" class="outline" on:click={() => dispatch('close')}> Cancel </button>

				<button type="submit" aria-busy={loading && !toofast}>Add Routechoice</button>
			</div>
		</form>
	</article>
</dialog>
