<script lang="ts">
	import Logo from '$lib/components/Logo.svelte';
	import { RolesEnum } from '$lib/models/enums/roles.enum.js';
	import type { User } from 'lucia-auth';
	import ThemeSwitch from './ThemeSwitch.svelte';

	export let user: User | undefined;
</script>

<nav class="container-fluid border-b-2 border-b-solid border-b-[var(--table-border-color)]">
	<ul class="logo-list">
		<li class="link-list-item">
			<a
				class="flex items-center gap-2 sm:gap-4 p-0 text-5 text-[var(--primary)] whitespace-nowrap"
				href="/"
			>
				<Logo --bg-color="var(--primary)" --width="3rem" --height="3rem" --logo-color="white" />

				<span class="hidden sm:inline">Routechoice DB</span>

				<div class="sm:hidden flex flex-col items-center leading-none">
					<span class="text-[0.625rem]">Routechoice</span>

					<span class="text-8">DB</span>
				</div>
			</a>
		</li>
	</ul>

	<div class="flex gap-2">
		<ul>
			{#if user?.role === RolesEnum.enum.admin}
				<li class="link-list-item large">
					<a href="/users">Users</a>
				</li>

				<li class="link-list-item large">
					<a href="/help">Help</a>
				</li>
			{/if}

			{#if user === undefined}
				<li class="py-0 large">
					<a href="/login">Login</a>
				</li>

				<li class="py-0 large">
					<a href="/signup">Sign up</a>
				</li>
			{:else}
				<li class="py-0 large">
					<details role="list" dir="rtl">
						<summary aria-haspopup="listbox"> {user.name} </summary>
						<ul>
							<li class="option-item">
								<button on:click={console.log}>Logout</button>
							</li>

							<li class="option-item">
								<a href="/reset-password">Reset password</a>
							</li>
						</ul>
					</details>
				</li>
			{/if}

			<li class="py-0">
				<ThemeSwitch />
			</li>
		</ul>

		<details role="list" dir="rtl" class="hamburger-menu">
			<summary aria-haspopup="listbox"> <i class="i-carbon-menu w-8 h-8" /> </summary>
			<ul>
				{#if user !== undefined}
					<li class="option-item">
						<strong>
							{user.name}
						</strong>
					</li>

					<li class="option-item">
						<button on:click={console.log}>Logout</button>
					</li>

					<li class="option-item">
						<a href="/reset-password">Reset password</a>
					</li>
				{:else}
					<li>
						<a href="/login">Login</a>
					</li>
				{/if}

				{#if user?.role === RolesEnum.enum.admin}
					<li class="option-item">
						<a href="/users">Users</a>
					</li>

					<li class="option-item">
						<a href="/help">Help</a>
					</li>
				{/if}
			</ul>
		</details>
	</div>
</nav>

<style>
	.logo-list {
		margin-left: calc(var(--nav-element-spacing-horizontal) * -2);
	}
	.link-list-item {
		padding: calc(var(--nav-element-spacing-vertical) / 2) var(--nav-element-spacing-horizontal);
	}

	.hamburger-menu {
		display: none;
		padding: 0;
		margin: 0;
		text-align: left;
	}

	.hamburger-menu summary,
	.hamburger-menu summary:active {
		border: none;
	}

	.hamburger-menu summary:focus {
		box-shadow: none;
	}

	.hamburger-menu summary::after {
		display: none;
	}

	@media screen and (max-width: 768px) {
		.hamburger-menu {
			display: block;
		}

		.large {
			display: none;
		}

		nav {
			padding-right: 0.5rem;
		}
	}
</style>
