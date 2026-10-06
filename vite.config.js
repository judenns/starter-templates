import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vite';

/**
 * Tạo base Vite config cho tất cả templates
 * @param {string} dirname - __dirname của template (dùng fileURLToPath)
 * @returns {import('vite').UserConfig}
 */
function createBaseConfig(dirname) {
	return {
		resolve: {
			alias: {
				'@': path.resolve(dirname, 'src'),
			},
		},
		build: {
			// Khớp với browserslist trong package.json ("baseline widely available on <date>").
			// Khi nâng major Vite, cập nhật ngày theo migration guide của Vite.
			target: 'baseline-widely-available',
			cssMinify: false,
		},
	};
}

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(mergeConfig(createBaseConfig(__dirname), {}));
