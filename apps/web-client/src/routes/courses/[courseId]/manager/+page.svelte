<script lang="ts">
	import Tag from '$lib/components/TagsSelect/Tag.svelte';

	export let data;
	const { course } = data;
</script>

<main class="container">
	<h1>Course manager: {course.name}</h1>

	<div class="wrapper">
		<a href={`/courses/${course.id}/manager/general-informations`} class="card-link">
			<article>
				<header>General informations</header>

				<p>{data.course.name}</p>

				<p>{new Date(data.course.date).toLocaleDateString()}</p>

				<p>
					{#each data.course.tags as tag}
						<Tag {tag} />
					{/each}
				</p>
			</article>
		</a>

		<a href={`/courses/${course.id}/manager/course-and-routechoices`} class="card-link">
			<article>
				<header>Course and routechoices</header>

				<p>{data.courseData.legs.length} Controls</p>
			</article>
		</a>

		<a href={`/courses/${course.id}/manager/split-times`} class="card-link">
			<article>
				<header>Split times</header>

				<p>{data.courseData.runners.length} Runners</p>
			</article>
		</a>
	</div>
</main>

<style>
	.container {
		margin: 2rem auto 3rem;
	}

	.wrapper {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	article {
		margin: 0;
		cursor: pointer;
		color: var(--h1-color);
	}

	.card-link {
		--color: var(--h1-color);
	}

	.card-link:hover {
		text-decoration: none;
	}

	.card-link:hover header {
		text-decoration: underline;
	}
</style>
