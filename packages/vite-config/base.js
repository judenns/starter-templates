import path from 'node:path';

/**
 * Tạo base Vite config cho tất cả templates
 * @param {string} dirname - __dirname của template (dùng fileURLToPath)
 * @returns {import('vite').UserConfig}
 */
export function createBaseConfig(dirname) {
	return {
		resolve: {
			alias: {
				'@': path.resolve(dirname, 'src'),
			},
			dedupe: ['react', 'react-dom'],
		},
		build: {
			target: 'baseline-widely-available',
			cssMinify: false,
			sourcemap: process.env.NODE_ENV === 'production' ? 'hidden' : true,
		},
	};
}
