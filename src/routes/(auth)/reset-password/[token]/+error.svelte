<script lang="ts">
	import { page } from '$app/stores';
</script>

<main class="max-w-180 m-x-auto my-4 pb-12">
	<h1>Reset password error</h1>

	{#if $page.error !== null}
		<p>{$page.error.message}</p>
	{/if}

	<p><a href="/reset-password">Send again</a></p>
</main>
