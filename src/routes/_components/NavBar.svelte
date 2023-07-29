<script lang="ts">
	import Logo from '$lib/components/Logo.svelte';
	import { RolesEnum } from '$lib/models/enums/roles.enum.js';
	import type { User } from 'lucia';
	import ThemeSwitch from './ThemeSwitch.svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	export let user: User | null;
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

			<li class="link-list-item large">
				<a href="/bug" class="flex gap-1 items-center">
					<i class="i-carbon-debug block h-5 w-5" /> Bug
				</a>
			</li>

			{#if user === null}
				<li class="py-0 large">
					<a href="/login?redirectTo={$page.url.toString()}">Login</a>
				</li>
			{:else}
				<li class="py-0 large">
					<details role="list" dir="rtl">
						<summary aria-haspopup="listbox"> {user.firstName} {user.lastName} </summary>
						<ul>
							<li class="option-item">
								<form action="/logout" method="post" use:enhance>
									<button type="submit">Logout</button>
								</form>
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
				{#if user !== null}
					<li class="option-item">
						<strong>
							{user.firstName}
							{user.lastName}
						</strong>
					</li>

					<li class="option-item">
						<form action="/logout" method="post" use:enhance>
							<button type="submit">Logout</button>
						</form>
					</li>

					<li class="option-item">
						<a href="/reset-password">Reset password</a>
					</li>
				{:else}
					<li>
						<a href="/login?redirectTo={$page.url.toString()}">Login</a>
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

				<li class="option-item">
					<a href="/bug" class="ltr important:flex gap-1 items-center">
						<i class="i-carbon-debug block h-5 w-5" /> Bug
					</a>
				</li>
			</ul>
		</details>
	</div>
</nav>

<style>
	.ltr {
		direction: ltr;
	}

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
