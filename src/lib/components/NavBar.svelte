<script lang="ts">
	import { RolesEnum } from '$lib/models/enums/roles.enum.js';
	import type { User } from 'lucia';
	import ThemeSwitch from './ThemeSwitch.svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { eventStore } from '$lib/stores/event-store.js';
	import { dev } from '$app/environment';
	import { SPLITTIMES_BASE_URL, SPLITTIMES_BASE_URL_DEV } from '$lib/constants.js';
	import { pushNotification } from './Notifications.svelte';

	export let user: User | null;

	async function handleShare() {
		if ($eventStore === null) return;

		const urlToShare = $page.url.href.split('?')[0];

		if (!('share' in navigator)) {
			if (!('clipboard' in navigator)) {
				pushNotification("Your browser do not allow direct url sharing. Please copy the url manually.", "warn", 5)
				return;
			}

			window.navigator.clipboard.writeText(urlToShare);
			pushNotification("Link copied to clipboard", "info", 5)
			return;
		}

		await window.navigator.share({
			title: "Routechoice DB",
			text: $eventStore.name,
			url: urlToShare
		})
	}
</script>

<nav class="container-fluid border-b-2 border-b-solid border-b-table-border-color">
	<ul class="logo-list min-w-0 grow !mr0">
		<li class="link-list-item">
			<a
				class="flex items-center gap-2 sm:gap-4 p-0 text-5 text-primary whitespace-nowrap decoration-none"
				href={$page.url.pathname ==="/events" ? "/" : "/events" }
			>
				<div class="bg-primary w-12 h-12 flex justify-center items-center">
					<i class="i-carbon-3d-curve-auto-colon block w-8 h-8 text-white"></i>
				</div>

				<span class="hidden sm:inline">Routechoice DB</span>

				{#if $eventStore === null}
					<div class="sm:hidden flex flex-col items-center leading-none">
						<span class="text-[0.625rem]">Routechoice</span>

						<span class="text-8">DB</span>
					</div>
				{/if}
			</a>
		</li>

		{#if $eventStore !== null}
			{@const splittimesBaseUrl = dev ? SPLITTIMES_BASE_URL_DEV : SPLITTIMES_BASE_URL}

			<li class="m-0 sm:ml-4 sm:pl-4 pl-2 py-1 sm:border-l-1 sm:border-l-solid sm:border-l-table-border-color whitespace-nowrap text-ellipsis overflow-hidden min-w-0">
				{$eventStore.name}
			</li>

			<li class="p-0 flex items-center gap2 sm:mr2">
				<a
					href="{splittimesBaseUrl}/{dev ? 'routechoice-db-dev' : 'routechoice-db'}/{$eventStore.id}/classes/1/table"
					target="_blank"
					rel="noreferrer"
					class="text-h1-color"
				>
					<i class="i-carbon-table-shortcut w-5 h-5 inline-block mt1" />
				</a>

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
						rel="noreferrer"
					>Help</a>
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
					<details  role="list" class="dropdown" >
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

		<details  role="list" class="hamburger-menu dropdown">
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
		padding: calc(var(--pico-nav-element-spacing-vertical) / 2) var(--pico-nav-element-spacing-horizontal);
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
