<script lang="ts" context="module">
	type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
	import type { SuperForm } from 'sveltekit-superforms';

	export let form: SuperForm<T>;

	const { errors } = form;
</script>

{#each $errors._errors ?? [] as globalError}
	<p>
		<small class="error">{globalError}</small>
	</p>
{/each}
