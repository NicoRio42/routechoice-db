<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { RolesEnum } from '$lib/models/enums/roles.enum.js';
	import type { User } from 'lucia';
	import { pushNotification } from './Notifications.svelte';
	import ThemeSwitch from './ThemeSwitch.svelte';

	export let user: User | null;
	export let logoLinkHref = '/events';
	export let eventName: string | undefined = undefined;

	async function handleShare() {
		if (eventName === undefined) return;

		const urlToShare = $page.url.href.split('?')[0];

		if (!('share' in navigator)) {
			if (!('clipboard' in navigator)) {
				pushNotification(
					'Your browser do not allow direct url sharing. Please copy the url manually.',
					{ type: 'warn', delayInSeconds: 5 }
				);
				return;
			}

			window.navigator.clipboard.writeText(urlToShare);
			pushNotification('Link copied to clipboard', { type: 'info', delayInSeconds: 5 });
			return;
		}

		await window.navigator.share({
			title: 'Routechoice DB',
			text: eventName,
			url: urlToShare
		});
	}
</script>

<nav
	class="container-fluid border-b-2 border-b-solid border-b-table-border-color z-3 [view-transition-name:top-nav]"
>
	<ul class="logo-list min-w-0 grow !mr0">
		<li class="link-list-item">
			<a
				class="flex items-center gap-2 md:gap-4 p-0 text-5 text-primary whitespace-nowrap decoration-none"
				href={logoLinkHref}
			>
				<div class="bg-primary w-12 h-12 flex justify-center items-center">
					<i class="i-carbon-3d-curve-auto-colon block w-8 h-8 text-white"></i>
				</div>

				<span class="hidden md:inline">Routechoice DB</span>

				{#if eventName === undefined}
					<div class="md:hidden flex flex-col items-center leading-none">
						<span class="text-[0.625rem]">Routechoice</span>

						<span class="text-8">DB</span>
					</div>
				{/if}
			</a>
		</li>

		{#if eventName !== undefined}
			<li
				class="m-0 md:ml-4 md:pl-4 pl-2 py-1 md:border-l-1 md:border-l-solid md:border-l-table-border-color whitespace-nowrap text-ellipsis overflow-hidden min-w-0"
			>
				{eventName}
			</li>

			<li class="p-0 flex items-center gap2 md:mr2">
				<button class="btn-unset" type="button" on:click={handleShare}>
					<i class="i-carbon-share w-5 h-5 inline-block mt1"></i>
				</button>
			</li>
		{/if}
	</ul>

	<div class="flex gap-2">
		<ul class="!ml0">
			{#if user?.role === RolesEnum.enum.admin}
				<li class="link-list-item large">
					<a href="/users">Users</a>
				</li>

				<li class="link-list-item large">
					<a
						href="https://docs.google.com/document/d/1bL9xlAb3Aw2Ga-Dk5r925952SeWGsHUR/edit?usp=sharing&ouid=108799233450859256284&rtpof=true&sd=true"
						target="_blank"
						rel="noreferrer">Help</a
					>
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
					<details role="list" class="dropdown">
						<summary aria-haspopup="listbox"> {user.firstName} {user.lastName} </summary>

						<ul dir="rtl">
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

			<li class="py-0 large">
				<ThemeSwitch />
			</li>
		</ul>

		<details role="list" class="hamburger-menu dropdown">
			<summary aria-haspopup="listbox" class="!bg-transparent mt-0.5">
				<i class="i-carbon-menu block w-8 h-8" />
			</summary>

			<ul dir="rtl">
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

				<li class="py-0 ltr">
					<ThemeSwitch />
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
		margin-left: calc(var(--pico-nav-element-spacing-horizontal) * -2);
	}

	.link-list-item {
		padding: calc(var(--pico-nav-element-spacing-vertical) / 2)
			var(--pico-nav-element-spacing-horizontal);
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
