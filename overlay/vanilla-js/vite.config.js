import { defineConfig } from 'vite';

// Plain Vite (vanilla js): copied as-is. Same CSS setup as the Vite+ overlay
export default defineConfig({
	css: {
		transformer: 'lightningcss',
		lightningcss: { drafts: { customMedia: true } },
	},
});
