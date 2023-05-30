<script lang="ts">
	import Eye from './icons/Eye.svelte';

	export let value: string;
	export let id: string;
	export let name: string;

	let type = 'password';

	function handleInput(
		event: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		value = event.currentTarget.value;
	}
</script>

<div class="input-wrapper">
	<input {value} on:input={handleInput} {type} {id} {name} maxlength="20" required />

	<span
		class="show-password"
		on:mouseenter={() => (type = 'text')}
		on:mouseleave={() => (type = 'password')}
	>
		<Eye />
	</span>
</div>

<style>
	.input-wrapper {
		position: relative;
	}

	.show-password {
		position: absolute;
		right: 0.5rem;
		top: var(--form-element-spacing-vertical);
		width: 1rem;
	}
</style>
