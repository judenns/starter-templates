// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// HTML whitespace rules (Astro 7 defaults to JSX rules); matches astro.compressHTML in .oxfmtrc.json
	compressHTML: true,
	vite: {
		css: {
			// Nesting, prefixes and minification for Vite's default browser target
			transformer: 'lightningcss',
			lightningcss: { drafts: { customMedia: true } },
		},
	},
});
