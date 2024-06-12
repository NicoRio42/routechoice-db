<script>
	import { enhance } from '$app/forms';

	export let data;
</script>

<main class="mx-auto max-w-150 px-4 pb-8 pt-4">
	<form method="post" enctype="multipart/form-data" use:enhance>
		<h1>Load course and routechoices from 2D Rerun json export</h1>

		<p>There should be at least one routechoice drawn, or the upload will fail.</p>

		<label>
			Select 2DRerun export file (.json)

			<input type="file" name="twoDRerunExport" />
		</label>

		<div class="flex justify-end">
			<button type="submit" class="sm:!w-fit">Import course and routechoices</button>
		</div>

		{#if data.displayError}
			<p class="error">An error occured</p>
		{/if}
	</form>
</main>
