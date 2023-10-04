<script lang="ts">
    import {Map} from "maplibre-gl"
	import { onMount } from "svelte";
    import "maplibre-gl/dist/maplibre-gl.css"
	import { resizeImageIfNedded } from "./utils.js";

    onMount(async () => {
        const url = await resizeImageIfNedded('test-maplibre.jpg');

        const style = {
            "version": 8,
                "sources": {
                    "osm": {
                        "type": "raster",
                        "tiles": ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
                        "tileSize": 256,
                        "attribution": "&copy; OpenStreetMap Contributors",
                        "maxzoom": 19
                    },
                    "image": {
                        'type': 'image',
                        url,
                        'coordinates': [
                            [5.356827445744547, 46.01014858538691,],
                            [5.3676488516148355, 46.00992606432991,],
                            [5.367287125255454, 46.00143925761309,],
                            [5.356465719385166, 46.00166177867009,]
                        ]
                    }
            },
            "layers": [
                {
                    "id": "osm",
                    "type": "raster",
                    "source": "osm" // This must match the source key above
                },
                {
                    id: 'image-layer',
                    'type': 'raster',
                    'source': 'image',
                    'paint': {
                    'raster-fade-duration': 0
                    }
                }
            ]
        };

        const map = new Map({
            container: 'map', // container id
            style, // style URL
            center: [(5.367287125255454 + 5.356465719385166) / 2, (46.00992606432991 + 46.00143925761309) / 2], // starting position [lng, lat]
            zoom: 15 // starting zoom
        })
    })
</script>

<div id="map" class="wrapper"></div>

<style>
	.wrapper {
		position: relative;
		flex-shrink: 0;
		flex-grow: 1;
	}
</style>