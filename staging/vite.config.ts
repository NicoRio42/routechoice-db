import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import path from 'path';
import UnoCSS from 'unocss/vite';
import extractorSvelte from '@unocss/extractor-svelte';

export default defineConfig({
	resolve: {
		alias: {
			$environments: path.resolve(__dirname, './src/environments')
		}
	},
	plugins: [UnoCSS({ extractors: [extractorSvelte()] }), sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
