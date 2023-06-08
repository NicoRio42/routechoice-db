<script>
	export let data;
</script>

<main class="container">
	<h1>Split times</h1>

	<ul>
		<li>
			<a href="/events/{data.event.id}/manager/split-times/local-file">From local file</a>
		</li>

		<li>
			<a href="/events/{data.event.id}/manager/split-times/winsplits">From Winsplits</a>
		</li>

		<li>
			<a href="/events/{data.event.id}/manager/split-times/local-file">Runner attribution</a>
		</li>
	</ul>
</main>
