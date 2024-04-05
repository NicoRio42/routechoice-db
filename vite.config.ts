import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import extractorSvelte from '@unocss/extractor-svelte';
import { enhancedImages } from '@sveltejs/enhanced-img';

export default defineConfig({
	plugins: [UnoCSS({ extractors: [extractorSvelte()] }), enhancedImages(), sveltekit()],
	build: { target: 'es6' }
});
