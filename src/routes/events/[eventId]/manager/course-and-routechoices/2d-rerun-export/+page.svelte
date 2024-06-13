<script>
	import { enhance } from '$app/forms';
	import SubmitButton from '$lib/components/form-fields/SubmitButton.svelte';

	export let data;
</script>

<main class="sm:mx-auto px-4 sm:w-150 my-6 pb-12">
	<form method="post" enctype="multipart/form-data" use:enhance>
		<h1>Load course and routechoices from 2D Rerun json export</h1>

		<p>There should be at least one routechoice drawn, or the upload will fail.</p>

		<label>
			Select 2DRerun export file (.json)

			<input type="file" name="twoDRerunExport" />
		</label>

		<SubmitButton>
			<i class="i-carbon-upload block w-5 h-5"></i> Upload
		</SubmitButton>

		{#if data.displayError}
			<p class="error">An error occured</p>
		{/if}
	</form>
</main>
