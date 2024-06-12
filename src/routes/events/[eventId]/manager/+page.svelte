<script>
	export let data;
</script>

<main class="container max-w-2xl">
	<h1>Event manager: {data.event.name}</h1>

	<ul>
		<li>
			<a href="/events/{data.event.id}/manager/general-informations"> General informations </a>
		</li>

		<li>
			<a href="/events/{data.event.id}/manager/course-and-routechoices">
				Course and routechoices
			</a>
		</li>

		<li>
			<a href="/events/{data.event.id}/manager/split-times"> Split times </a>
		</li>

		<li>
			<a href="/events/{data.event.id}/manager/files"> Files </a>
		</li>
	</ul>
</main>
