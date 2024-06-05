<script lang="ts">
	import { Feature } from 'ol';
	import type { Coordinate } from 'ol/coordinate.js';
	import type { Geometry } from 'ol/geom.js';
	import { LineString } from 'ol/geom.js';
	import type VectorLayer from 'ol/layer/Vector.js';
	import type VectorSource from 'ol/source/Vector.js';
	import Fill from 'ol/style/Fill.js';
	import Stroke from 'ol/style/Stroke.js';
	import Style from 'ol/style/Style.js';
	import Text from 'ol/style/Text.js';
	import { getContext, onDestroy, onMount } from 'svelte';

	export let color: string;
	export let coords: Coordinate[];
	export let width: number;
	export let text: string | undefined = undefined;

	let vectorLayer: VectorLayer<VectorSource<Geometry>>, lineFeature: Feature;
	let line: LineString;
	let style: Style;
	let textStyle: Text;
	let stroke: Stroke;

	$: if (line !== undefined) line.setCoordinates(coords);

	$: if (stroke !== undefined) {
		stroke.setWidth(width);
		lineFeature.setStyle(style);
	}

	$: if (textStyle !== undefined && style !== undefined) {
		textStyle.setText(text);
		lineFeature.setStyle(style);
	}

	const getVectorLayer = getContext<() => VectorLayer<VectorSource<Geometry>>>('vectorLayer');

	onMount(() => {
		vectorLayer = getVectorLayer();
		const vectorSource = vectorLayer.getSource();

		line = new LineString(coords);
		const font = 'bold 1.25rem/1 Arial';

		textStyle = new Text({
			font,
			text,
			fill: new Fill({ color }),
			stroke: new Stroke({ color: '#ffffff', width: 3 }),
			textAlign: 'start',
			offsetX: 10
		});

		lineFeature = new Feature(line);
		stroke = new Stroke({ color, width });
		style = new Style({ stroke, text: textStyle });
		lineFeature.setStyle(style);

		vectorSource?.addFeature(lineFeature);
	});

	onDestroy(() => {
		if (lineFeature !== undefined) vectorLayer?.getSource()?.removeFeature(lineFeature);
	});
</script>
