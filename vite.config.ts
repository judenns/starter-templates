import { defineConfig } from 'vite';

export default defineConfig({
	resolve: {
		// `@/…` imports come from "paths" in tsconfig.json
		tsconfigPaths: true,
	},
	css: {
		// Nesting, prefixes and minification for Vite's default browser target
		transformer: 'lightningcss',
		lightningcss: { drafts: { customMedia: true } },
	},
});
