export default {
	plugins: {
		'postcss-preset-env': {
			stage: 2,
			features: {
				'nesting-rules': true,
				'custom-media-queries': true,
			},
		},
		...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
	},
};
