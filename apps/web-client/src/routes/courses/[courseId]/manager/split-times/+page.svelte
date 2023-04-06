<script lang="ts">
	export let data;
</script>

<main class="container">
	<h1>Split times</h1>

	<div class="options-wrapper">
		<article class="upload-option">
			<a href={`/courses/${data.course.id}/manager/split-times/upload-from-local-file`}
				>Upload from local IOF XML file</a
			>
		</article>

		<article class="upload-option">
			<a href={`/courses/${data.course.id}/manager/split-times/upload-from-winsplit`}
				>Upload from Winsplit online</a
			>
		</article>

		<article class="upload-option">
			<a href={`/courses/${data.course.id}/manager/split-times/runners-attribution`}
				>Attributes runners to tracks and users</a
			>
		</article>
	</div>
</main>

<style>
	.upload-option {
		cursor: pointer;
		margin: 0;
	}

	.options-wrapper {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 1rem;
		padding-top: 3rem;
		font-weight: 500;
	}

	@media screen and (max-width: 700px) {
		.options-wrapper {
			grid-template-columns: 1fr;
		}
	}
</style>
