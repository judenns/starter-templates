import { fileURLToPath } from 'node:url';
import { createBaseConfig } from '@starter/vite-config';
import react from '@vitejs/plugin-react';
import { defineConfig, mergeConfig } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(
	mergeConfig(createBaseConfig(__dirname), {
		plugins: [react()],
		resolve: {
			dedupe: ['react', 'react-dom'],
		},
	}),
);
