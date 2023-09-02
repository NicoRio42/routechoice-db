<script>
	export let data;
</script>

<main class="container max-w-2xl">
	<h1>Split times</h1>

	<p>
		&#62;
		<a href={`/events/${data.event.id}/manager`}>Event manager: {data.event.name}</a>

		&#62;
		<a href={`/events/${data.event.id}/manager/split-times`}>Split times</a>
	</p>

	<ul>
		<li>
			<a href="/events/{data.event.id}/manager/split-times/local-file">From local file</a>
		</li>

		<li>
			<a href="/events/{data.event.id}/manager/split-times/winsplits">From Winsplits</a>
			<!-- <em>From Winsplits (back soon)</em> -->
		</li>

		<li>
			<a href="/events/{data.event.id}/manager/split-times/runners-attribution"
				>Runner attribution</a
			>
		</li>
	</ul>
</main>
