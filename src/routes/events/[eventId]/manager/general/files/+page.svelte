<script lang="ts">
	import TextField from '$lib/components/form-fields/TextField.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { uploadFileSchema } from './upload-file-schema.js';
	import FileField from '$lib/components/form-fields/FileField.svelte';
	import { enhance as sveltekitEnhance } from '$app/forms';
	import { confirmSubmit } from '$lib/actions/confirm-submit.js';
	import GlobalFormErrors from '$lib/components/form-fields/GlobalFormErrors.svelte';
	import SubmitButton from '$lib/components/form-fields/SubmitButton.svelte';

	export let data;

	const form = superForm(data.form, { validators: zodClient(uploadFileSchema) });

	const { delayed, enhance } = form;
</script>

<main class="max-w-200 my-8 mx-auto px-4">
	<h1>Upload files</h1>

	<form use:enhance action="?/upload" method="post" enctype="multipart/form-data" class="p-0">
		<TextField {form} field="name" label="File name" />

		<FileField {form} field="file" label="File" />

		<SubmitButton aria-busy={$delayed}>
			<i class="i-carbon-upload block w-5 h-5"></i> Upload
		</SubmitButton>

		<GlobalFormErrors {form} />
	</form>

	<h2>Files</h2>

	<ul>
		{#each data.files as file (file.id)}
			<li>
				<a href={file.url} target="_blank">{file.name}</a>

				<form
					action="?/delete"
					method="post"
					use:confirmSubmit={'Are you sure to delete this file?'}
					use:sveltekitEnhance
					class="contents"
				>
					<input type="hidden" name="fileId" value={file.id} />

					<button
						type="submit"
						class="outline inline-block align-middle !w-fit text-del-color border-del-color focus:!shadow-del-color p-1.5 ml-4 mb-0"
					>
						<i class="i-carbon-trash-can block w-5 h-5 text-del-color"></i>
					</button>
				</form>
			</li>
		{:else}
			<li>No files for this event</li>
		{/each}
	</ul>
</main>
