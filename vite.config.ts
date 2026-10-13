import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [react()],
	resolve: {
		// `@/…` imports come from "paths" in tsconfig.json
		tsconfigPaths: true,
		dedupe: ['react', 'react-dom'],
	},
	css: {
		// Nesting, prefixes and minification for Vite's default browser target
		transformer: 'lightningcss',
		lightningcss: { drafts: { customMedia: true } },
	},
});
