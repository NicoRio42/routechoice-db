<script lang="ts">
	import Tag from '$lib/components/TagsSelect/Tag.svelte';

	export let data;
	const { course } = data;
</script>

<main class="container">
	<h1>Course manager: {course.name}</h1>

	<div class="wrapper">
		<article>
			<header>
				<a href={`/courses/${course.id}/manager/general-informations`}> General informations </a>
			</header>

			<p>{data.course.name}</p>

			<p>{data.course.date}</p>

			<p>
				{#each data.course.tags as tag}
					<Tag {tag} />
				{/each}
			</p>
		</article>

		<article>
			<header>
				<a href={`/courses/${course.id}/manager/course-and-routechoices`}>
					Course and routechoices
				</a>
			</header>

			<p>{data.courseData.legs.length} Controls</p>
		</article>

		<article>
			<header>
				<a href={`/courses/${course.id}/manager/split-times`}> Split times </a>
			</header>

			<p>{data.courseData.runners.length} Runners</p>
		</article>
	</div>
</main>

<style>
	.container {
		margin-bottom: 3rem;
	}

	.wrapper {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	article {
		margin: 0;
		cursor: pointer;
	}
</style>
