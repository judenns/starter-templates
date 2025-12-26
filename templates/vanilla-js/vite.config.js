import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vite';
import { createBaseConfig } from '@starter/vite-config';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(mergeConfig(createBaseConfig(__dirname), {}));
