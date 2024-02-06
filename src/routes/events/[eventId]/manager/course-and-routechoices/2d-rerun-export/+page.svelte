<script>
	import { enhance } from '$app/forms';

	export let data
</script>

<form method="post" enctype="multipart/form-data" use:enhance class="mt-4">
	<h1>Load course and routechoices from 2D Rerun json export</h1>

	<p>There should be at least one routechoice drawn, or the upload will fail.</p>

	<label>
		Select 2DRerun export file (.json)

		<input type="file" name="twoDRerunExport" />
	</label>

	<button type="submit">Import course and routechoices</button>

	{#if data.displayError}		
		<p class="error">An error occured</p>
	{/if}
</form>
