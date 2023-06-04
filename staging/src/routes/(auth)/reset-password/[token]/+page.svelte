<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { resetPasswordSchema } from './schema.js';

	export let data;

	const { form, errors, delayed, tainted, enhance } = superForm(data.form, {
		validators: resetPasswordSchema
	});
</script>

<form method="post" use:enhance>
	<h1>Reset password</h1>

	<label>
		Password
		<input
			type="password"
			name="password"
			bind:value={$form.password}
			data-invalid={$errors.password}
			aria-invalid={$tainted?.password &&
				$errors.password !== undefined &&
				$errors.password.length !== 0}
		/>

		{#each $errors.password ?? [] as passwordError}
			<small class="error">{passwordError}</small>
		{/each}
	</label>

	<label>
		Confirm password
		<input
			type="password"
			name="passwordConfirmation"
			bind:value={$form.passwordConfirmation}
			data-invalid={$errors.passwordConfirmation}
			aria-invalid={$tainted?.passwordConfirmation &&
				$errors.passwordConfirmation !== undefined &&
				$errors.passwordConfirmation.length !== 0}
		/>

		{#each $errors.passwordConfirmation ?? [] as passwordConfirmationError}
			<small class="error">{passwordConfirmationError}</small>
		{/each}
	</label>

	<button type="submit" aria-busy={$delayed}>Sign up</button>

	{#each $errors._errors ?? [] as globalError}
		<p>
			<small class="error">{globalError}</small>
		</p>
	{/each}
</form>
