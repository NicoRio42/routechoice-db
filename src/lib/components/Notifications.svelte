<script context="module" lang="ts">
	import { flip } from 'svelte/animate';
	import { writable } from 'svelte/store';
	import { fade } from 'svelte/transition';

	type NotificationType = 'info' | 'warn' | 'error';

	type Notification = {
		id: string;
		message: string;
		type: NotificationType;
	};

	type NotificationOptions = {
		type?: NotificationType;
		delayInSeconds?: number | null;
	};

	const notifications = writable<Notification[]>([]);

	export function pushNotification(message: string, options?: NotificationOptions) {
		const delayInSeconds = options?.delayInSeconds ?? null;
		const type = options?.type ?? 'info';
		const id = crypto.randomUUID();
		notifications.update((notifs) => [...notifs, { id, message, type }]);

		if (delayInSeconds !== null) {
			setTimeout(
				() => notifications.update((notifs) => notifs.filter((n) => n.id !== id)),
				delayInSeconds * 1000
			);
		}
	}
</script>

{#if $notifications.length !== 0}
	<ul class="fixed top-4 right-4 flex flex-col gap-4 z4 max-w-100">
		{#each $notifications as notification (notification.id)}
			<li
				transition:fade|global={{ duration: 125 }}
				animate:flip={{ duration: 250 }}
				class="info flex gap-4 p-4 rounded text-white bg-green-600"
				class:bg-yellow-600={notification.type === 'warn'}
				class:bg-red-600={notification.type === 'error'}
			>
				{notification.message}

				<button
					type="button"
					class="btn-unset text-white"
					on:click={() => ($notifications = $notifications.filter((n) => n.id !== notification.id))}
				>
					<i class="i-carbon-close w-6 h-6 block"></i>
				</button>
			</li>
		{/each}
	</ul>
{/if}
