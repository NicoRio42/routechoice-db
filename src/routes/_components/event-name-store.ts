import { writable } from 'svelte/store';

export const eventName = writable<string | null>(null);
