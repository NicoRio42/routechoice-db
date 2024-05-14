import { writable } from 'svelte/store';

export const eventStore = writable<{ name: string; id: string } | null>(null);
