<script>
	export let data;
</script>

<h1>Course and routechoices</h1>

<p>
	&#62;
	<a href={`/events/${data.event.id}/manager`}>Event manager: {data.event.name}</a>

	&#62;
	<a href={`/events/${data.event.id}/manager/course-and-routechoices`}>Course and routechoices</a>
</p>

<ul>
	<li>
		<a href="/events/{data.event.id}/manager/course-and-routechoices/2d-rerun-export">
			From 2dRerun export
		</a>
	</li>

	<li>
		<a href="/events/{data.event.id}/manager/course-and-routechoices/ocad-export">
			From OCAD export
		</a>
	</li>

	{#if data.event.legs.length !== 0}
		<li>
			<a href="/events/{data.event.id}/manager/course-and-routechoices/manage-course">
				Manage course
			</a>
		</li>
	{/if}
</ul>
