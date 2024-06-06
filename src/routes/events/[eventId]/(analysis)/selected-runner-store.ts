import { writable } from 'svelte/store';

export const selectedRunnerIdStore = writable<string | null>(null);
