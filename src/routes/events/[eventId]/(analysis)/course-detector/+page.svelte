<script lang="ts">
	import type { EventWithLiveEventsRunnersLegsAndControlPoints as Event } from '$lib/models/event.model.js';
	import { mapIsLoading } from '$lib/stores/map-loading.store';
	import type { User } from 'lucia';
	import { onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';

	import { pushNotification } from '$lib/components/Notifications.svelte';
	import { getTracksFromLiveEvents } from '$lib/helpers';
	import GeoreferencedImage from '../map/components/GeoreferencedImage.svelte';
	import OlMap from '../map/components/OLMap.svelte';
	import { computeFitBoxAndAngleFromLegNumber } from '../map/utils';
	import '../map/styles.css';
	import VectorLayer from '../map/components/VectorLayer.svelte';
	import Marker from '../map/components/Marker.svelte';
	import { transform } from 'ol/proj';
	import type ImageLayer from 'ol/layer/Image';
	import type Static from 'ol/source/ImageStatic';

	export let data;

	$mapIsLoading = true;

	let angle: number;
	let fitBox: [number, number, number, number];
	let imageLayer: ImageLayer<Static>;

	let isDrawingNewRoutechoice = false;

	let detectedCourse: number[][] = [];

	$: {
		const [newFitBox, newAngle] = computeFitBoxAndAngleFromLegNumber(
			100,
			data.event as Event,
			data.eventMap
		);

		fitBox = newFitBox;
		angle = newAngle;
	}

	const user = writable<User | null>();
	$: user.set(data.user);
	setContext('user', user);

	onMount(() => {
		getTracksFromLiveEvents(data.event.liveEvents, fetch, true)
			.then((tracks) => {
				data.event.runners = data.event.runners.map((runner) => {
					const track = tracks.find(
						(t) =>
							t.trackingDeviceId === runner.trackingDeviceId && t.fkLiveEvent === runner.fkLiveEvent
					);

					return { ...runner, track: track === undefined ? null : track.track };
				});

				let startLatsSum = 0;
				let startLonsSum = 0;

				const okRunnersWithTracks = data.event.runners.filter(
					(r) => r.status === 'ok' && r.track !== null
				);

				okRunnersWithTracks.forEach((runner) => {
					const pointIndex = runner.track!.times.findIndex(
						(t) => t >= runner.startTime.getTime() / 1000
					)!;
					startLonsSum += runner.track!.lons[pointIndex];
					startLatsSum += runner.track!.lats[pointIndex];
				});

				detectedCourse = [
					transform(
						[startLonsSum / okRunnersWithTracks.length, startLatsSum / okRunnersWithTracks.length],
						'EPSG:4326',
						'EPSG:3857'
					),
					...data.event.legs.map((_, legIndex) => {
						let latsSum = 0;
						let lonsSum = 0;

						okRunnersWithTracks.forEach((runner) => {
							const { timeOverall } = runner.legs[legIndex]!;
							const absoluteTime = runner.startTime.getTime() / 1000 + timeOverall;
							const pointIndex = runner.track!.times.findIndex((t) => t >= absoluteTime)!;
							lonsSum += runner.track!.lons[pointIndex];
							latsSum += runner.track!.lats[pointIndex];
						});

						return transform(
							[lonsSum / okRunnersWithTracks.length, latsSum / okRunnersWithTracks.length],
							'EPSG:4326',
							'EPSG:3857'
						);
					})
				];

				const image = new Image();
				image.src = `/api/proxy/image?urlToProxy=${encodeURI(data.eventMap.url)}`;
				const can = document.createElement('canvas');
				const ctx = can.getContext('2d')!;

				image.onload = () => {
					ctx.drawImage(image, 0, 0, image.width, image.height);

					const data = ctx.getImageData(
						image.width / 2,
						image.height / 2,
						image.width / 2 + 15,
						image.height / 2 + 15
					);
					const length = data.data.length;
					for (let i = 0; i < length; i += 4) {
						const red = data.data[i];
						const green = data.data[i + 1];
						const blue = data.data[i + 2];
						const alpha = data.data[i + 3];

						console.log([red, green, blue, alpha]);
					}
				};
			})
			.catch(() => {
				pushNotification('Could not load GPS', 'error', 5);
			});
	});
</script>

<div class="wrapper">
	{#if $mapIsLoading}
		<article
			class="absolute z-1 bg-transparent top-40% left-50% -translate-x-50% -translate-y-50% backdrop-blur rounded-xl"
			aria-busy="true"
		>
			Map is loading
		</article>
	{/if}

	<OlMap {isDrawingNewRoutechoice} {angle} {fitBox} padding={[100, 0, 100, 0]}>
		<GeoreferencedImage bind:imageLayer eventMap={data.eventMap} />

		<VectorLayer>
			{#each detectedCourse as coords}
				<Marker {coords}></Marker>
			{/each}
		</VectorLayer>
	</OlMap>
</div>

<style>
	:root {
		--display-brand-name-small-devices: none;
	}

	.wrapper {
		position: relative;
		flex-shrink: 0;
		flex-grow: 1;
	}
</style>
