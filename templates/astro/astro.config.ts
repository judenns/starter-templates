import { defineConfig } from 'astro/config';

export default defineConfig({
	vite: {
		css: {
			// Nesting, prefixes and minification for Vite's default browser target
			transformer: 'lightningcss',
			lightningcss: { drafts: { customMedia: true } },
		},
	},
});
