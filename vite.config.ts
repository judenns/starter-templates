import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite-plus';

export default defineConfig({
	fmt: {
		useTabs: true,
		singleQuote: true,
		sortPackageJson: false,
	},
	lint: {
		options: { typeAware: true, typeCheck: true },
	},
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
