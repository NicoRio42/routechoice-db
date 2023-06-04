<script>
	export let data;
</script>

<main class="container">
	<h1>Event manager: {data.event.name}</h1>

	<ol>
		<li>
			<a href="/events/{data.event.id}/manager/general-informations"> General informations </a>
		</li>

		<li>
			<a href="/events/{data.event.id}/manager/course-and-routechoices">
				Course and routechoices
			</a>
		</li>
		<li>Split times</li>
	</ol>
</main>
