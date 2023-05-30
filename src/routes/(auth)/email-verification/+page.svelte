<script lang="ts">
	export let data;
</script>

<form method="POST">
	<button>Re-send verification email</button>

	{#if data.sent}
		<p>Email has been sent, check your emails</p>
	{/if}
</form>
