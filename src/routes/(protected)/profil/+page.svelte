<script lang="ts">
	import { enhance } from '$app/forms';

	export let data;
</script>

<form method="POST" use:enhance>
	<h1>{data.user.name}</h1>

	<input type="submit" value="Delete account" />
</form>
