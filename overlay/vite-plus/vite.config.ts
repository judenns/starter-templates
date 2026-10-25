import { defineConfig } from 'vite-plus';

// Blocks to merge into the scaffold's config: keep everything it already has.
// Only what differs from Vite+ defaults, so upgrades bring new defaults for free
export default defineConfig({
	fmt: {
		useTabs: true,
		singleQuote: true,
		sortPackageJson: false,
	},
	resolve: {
		// `@/…` imports come from "paths" in tsconfig
		tsconfigPaths: true,
	},
	css: {
		// Nesting, prefixes and minification for Vite's default browser target
		transformer: 'lightningcss',
		lightningcss: { drafts: { customMedia: true } },
	},
});
