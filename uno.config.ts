import { defineConfig, presetIcons, presetUno } from 'unocss';
import extractorSvelte from '@unocss/extractor-svelte';

export default defineConfig({
	presets: [presetIcons(), presetUno()],
	extractors: [extractorSvelte()],
	theme: {
		colors: {
			primary: 'var(--pico-primary)',
			tableBorderColor: 'var(--pico-table-border-color)',
			backgroundColor: 'var(--pico-background-color)',
			h1Color: 'var(--pico-h1-color)',
			'pico-dropdown-hover-background-color': 'var(--pico-dropdown-hover-background-color)',
			'del-color': 'var(--pico-del-color)'
		}
	}
});
