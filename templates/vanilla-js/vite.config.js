import { fileURLToPath } from 'node:url';
import { createBaseConfig } from '@starter/vite-config';
import { defineConfig, mergeConfig } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(mergeConfig(createBaseConfig(__dirname), {}));
