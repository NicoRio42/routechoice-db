<script>
	export let data
</script>

<form method="post" enctype="multipart/form-data">
	<label>
		Select 2DRerun export file (.json)

		<input type="file" name="twoDRerunExport" />
	</label>

	<button type="submit">Import course and routechoices</button>

	{#if data.displayError}		
		<p class="error">An error occured</p>
	{/if}
</form>
