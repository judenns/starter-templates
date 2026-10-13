import { defineConfig } from 'vite-plus';

// Only what differs from Vite+ defaults, so upgrades bring new defaults for free
export default defineConfig({
	fmt: {
		useTabs: true,
		singleQuote: true,
		sortPackageJson: false,
	},
	lint: {
		options: { typeAware: true, typeCheck: true },
	},
});
