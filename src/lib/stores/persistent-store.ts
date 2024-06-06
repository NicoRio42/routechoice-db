import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';
import type { z } from 'zod';

export function createPersistentStore<S extends z.ZodTypeAny>(
	key: string,
	schema: S,
	defaultValue?: z.infer<S>
): Writable<z.infer<S>> {
	type T = z.infer<S>;

	const store = writable<T>(defaultValue);
	if (!browser) return store;

	const { subscribe, set } = store;
	const rawValueFromLocalStorage = localStorage.getItem(key);
	let currentValue: T;

	if (rawValueFromLocalStorage === null) {
		set(defaultValue);
	} else {
		const userCourse = schema.safeParse(JSON.parse(rawValueFromLocalStorage));

		if (!userCourse.success) {
			set(defaultValue);
		} else {
			set(userCourse.data);
			localStorage.setItem(key, JSON.stringify(userCourse.data));
			currentValue = userCourse.data;
		}
	}

	return {
		subscribe,
		set: (newValue: T) => {
			localStorage.setItem(key, JSON.stringify(newValue));
			set(newValue);
			currentValue = newValue;
		},
		update: (updater) => {
			const newValue = updater(currentValue);
			currentValue = newValue;
			localStorage.setItem(key, JSON.stringify(newValue));
			set(newValue);
		}
	};
}
