<script lang="ts">
	import Graph from '../components/Graph.svelte';

	export let data;
</script>

<Graph runners={data.event.runners} runnerLegKey={'timeBehindSuperman'} eventId={data.event.id} />
