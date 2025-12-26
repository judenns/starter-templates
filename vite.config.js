import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	build: {
		target: 'baseline-widely-available',
		cssMinify: false,
		sourcemap: process.env.NODE_ENV === 'production' ? 'hidden' : true,
	},
});
