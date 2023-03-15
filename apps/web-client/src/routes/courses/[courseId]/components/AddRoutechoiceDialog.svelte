<script lang="ts" context="module">
	import { writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import type Routechoice from '$lib/o-utils/models/routechoice';

	const showDialog = writable(false);
	let submit: Function;
	let cancel: Function;

	export function getNewRoutechoiceNameAndColor(): Promise<[string, string]> {
		showDialog.set(true);

		return new Promise<[string, string]>((resolve, reject) => {
			submit = resolve;
			cancel = reject;
		});
	}
</script>

<script lang="ts">
	import { names, routesColors } from '$lib/o-utils/ocad/utils/routechoices-names-colors';

	export let legRoutechoices: Routechoice[];

	let name: string;
	let color: string;
	let allowedNames: string[];

	$: {
		allowedNames = names.filter(
			(name) =>
				!legRoutechoices.some(
					(routechoice) => routechoice.name.toLowerCase() === name.toLowerCase()
				)
		);

		name = allowedNames[0];

		color = routesColors.filter(
			(color) =>
				!legRoutechoices.some(
					(routechoice) => routechoice.color.toLowerCase() === color.toLowerCase()
				)
		)[0];
	}

	function handleCancel() {
		cancel();
		$showDialog = false;
	}

	function handleSubmit() {
		submit([name, color]);
		$showDialog = false;
	}
</script>

{#if $showDialog}
	<dialog open transition:fade>
		<article>
			<form on:submit|preventDefault={handleSubmit}>
				<label for="name">
					Name

					<select bind:value={name} name="name" required>
						{#each allowedNames as value}
							<option {value}>{value}</option>
						{/each}
					</select>
				</label>

				<label for="color">
					Color

					<input bind:value={color} type="color" name="color" required />
				</label>

				<footer>
					<button type="button" class="outline" on:click={handleCancel}>Cancel</button>

					<button type="submit">Add Routechoice</button>
				</footer>
			</form>
		</article>
	</dialog>
{/if}

<style>
	footer {
		display: flex;
		gap: 1rem;
	}

	footer button {
		width: fit-content;
	}
</style>
