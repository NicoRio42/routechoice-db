<script>
	import { enhance } from '$app/forms';

	export let data;
	export let form;
</script>

<main class="sm:mx-auto px-4 sm:w-150 mt-6 pb-12">
	<h1>Confirmation de l'adresse email</h1>

	<p>Un code de confirmation a été envoyé à l'adresse email : {data.email}</p>

	<form action="?/verifyCode" method="post" use:enhance>
		<!-- svelte-ignore a11y-no-redundant-roles -->
		<fieldset role="group">
			<input
				type="text"
				name="code"
				aria-invalid={form?.wrongCode || form?.codeExpired ? 'true' : undefined}
			/>

			<input type="submit" value="Vérifier" />
		</fieldset>

		{#if form?.wrongCode}
			<small>Code de confirmation incorrect</small>
		{/if}

		{#if form?.codeExpired}
			<small>Code de confirmation expiré</small>
		{/if}
	</form>

	{#if form?.wrongCode || form?.codeExpired || form?.codeResent}
		<form action="?/sendNewVerificationCode" method="post" use:enhance>
			<button type="submit" class="outline !w-fit">
				Renvoyer un code

				{#if form?.codeResent}
					<i class="i-carbon-check h-4 w-4"></i>
				{/if}
			</button>
		</form>
	{/if}
</main>
