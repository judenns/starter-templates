#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');

// Parse catalog versions từ pnpm-workspace.yaml
function parseCatalogVersions() {
	const content = fs.readFileSync(path.join(ROOT_DIR, 'pnpm-workspace.yaml'), 'utf-8');
	const versions = {};
	let inCatalog = false;

	for (const line of content.split('\n')) {
		if (line.startsWith('catalog:')) {
			inCatalog = true;
			continue;
		}
		if (inCatalog && line.match(/^\s{2}\S/)) {
			const match = line.match(/^\s{2}(.+?):\s*"?([^"]+)"?$/);
			if (match) {
				versions[match[1]] = match[2];
			}
		} else if (inCatalog && line.match(/^\S/)) {
			break; // Exit catalog section
		}
	}
	return versions;
}

// Đọc versions từ root package.json
function getRootPackageVersions() {
	const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8'));
	return pkg.devDependencies || {};
}

const CATALOG_VERSIONS = parseCatalogVersions();
const ROOT_VERSIONS = getRootPackageVersions();

const SKIP_FILES = ['node_modules', 'dist', '.git', 'package.json'];

function copyDir(src, dest, skipFiles = SKIP_FILES) {
	fs.mkdirSync(dest, { recursive: true });
	const entries = fs.readdirSync(src, { withFileTypes: true });

	for (const entry of entries) {
		// Skip certain files/directories
		if (skipFiles.includes(entry.name)) {
			continue;
		}

		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			copyDir(srcPath, destPath, skipFiles);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

function main() {
	const args = process.argv.slice(2);

	if (args.length < 2) {
		console.log('Usage: pnpm create-project <template> <project-name>');
		console.log('');
		console.log('Available templates:');
		const templates = fs.readdirSync(TEMPLATES_DIR);
		templates.forEach((t) => console.log(`  - ${t}`));
		process.exit(1);
	}

	const [templateName, projectName] = args;
	const templateDir = path.join(TEMPLATES_DIR, templateName);
	const outputDir = path.resolve(process.cwd(), projectName);

	// Check template exists
	if (!fs.existsSync(templateDir)) {
		console.error(`Template "${templateName}" not found.`);
		process.exit(1);
	}

	// Check output doesn't exist
	if (fs.existsSync(outputDir)) {
		console.error(`Directory "${projectName}" already exists.`);
		process.exit(1);
	}

	console.log(`Creating project "${projectName}" from template "${templateName}"...`);

	// 1. Copy template folder (keep package.json)
	const SKIP_TEMPLATE = ['node_modules', 'dist', '.git'];
	copyDir(templateDir, outputDir, SKIP_TEMPLATE);

	// 2. Copy shared CSS files (all files and folders, skip package.json)
	const sharedCssDir = path.join(PACKAGES_DIR, 'shared-css');
	const outputCssDir = path.join(outputDir, 'src', 'css');
	copyDir(sharedCssDir, outputCssDir);

	// 3. Update CSS imports (change from @starter/shared-css to local)
	const indexCssPath = path.join(outputCssDir, 'index.css');
	let indexCss = fs.readFileSync(indexCssPath, 'utf-8');
	indexCss = indexCss.replace(/@starter\/shared-css\//g, './');
	fs.writeFileSync(indexCssPath, indexCss);

	// 4. Copy root configs
	fs.copyFileSync(path.join(ROOT_DIR, 'postcss.config.js'), path.join(outputDir, 'postcss.config.js'));
	fs.copyFileSync(path.join(ROOT_DIR, '.prettierrc.json'), path.join(outputDir, '.prettierrc.json'));
	fs.copyFileSync(path.join(ROOT_DIR, '.gitignore'), path.join(outputDir, '.gitignore'));

	// 5. Inline biome.json (remove extends, copy full config)
	const rootBiomeConfig = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'biome.json'), 'utf-8'));
	fs.writeFileSync(path.join(outputDir, 'biome.json'), JSON.stringify(rootBiomeConfig, null, '\t') + '\n');

	// 6. Update package.json
	const pkgPath = path.join(outputDir, 'package.json');
	const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

	// Change name
	pkg.name = projectName;

	// Remove workspace dependencies
	delete pkg.devDependencies['@starter/shared-css'];
	delete pkg.devDependencies['@starter/vite-config'];

	// Replace catalog: with actual versions
	for (const [dep, version] of Object.entries(pkg.devDependencies)) {
		if (version === 'catalog:') {
			pkg.devDependencies[dep] = CATALOG_VERSIONS[dep] || version;
		}
	}

	// Add biome and prettier (from root package.json)
	pkg.devDependencies['@biomejs/biome'] = ROOT_VERSIONS['@biomejs/biome'] || '^2.0.0';
	pkg.devDependencies['prettier'] = ROOT_VERSIONS['prettier'] || '^3.0.0';

	// Add browserslist
	pkg.browserslist = ['defaults and fully supports es6-module', 'not dead'];

	fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '\t') + '\n');

	// 7. Inline vite.config.js
	const viteConfigPath = path.join(outputDir, 'vite.config.js');
	const baseConfigPath = path.join(PACKAGES_DIR, 'vite-config', 'base.js');
	const baseConfig = fs.readFileSync(baseConfigPath, 'utf-8');

	// Read template vite config to check for plugins
	let templateViteConfig = fs.readFileSync(viteConfigPath, 'utf-8');
	const hasReactPlugin = templateViteConfig.includes("import react from '@vitejs/plugin-react'");

	// Generate standalone vite config
	let standaloneViteConfig;
	if (hasReactPlugin) {
		standaloneViteConfig = `import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
		dedupe: ['react', 'react-dom'],
	},
	build: {
		target: 'baseline-widely-available',
		cssMinify: false,
		sourcemap: process.env.NODE_ENV === 'production' ? 'hidden' : true,
	},
});
`;
	} else {
		standaloneViteConfig = `import path from 'node:path';
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
`;
	}
	fs.writeFileSync(viteConfigPath, standaloneViteConfig);

	// 8. Init git
	try {
		execSync('git init', { cwd: outputDir, stdio: 'ignore' });
		execSync('git add .', { cwd: outputDir, stdio: 'ignore' });
		execSync('git commit -m "Initial commit"', { cwd: outputDir, stdio: 'ignore' });
	} catch {
		// Git might not be available, ignore
	}

	console.log('');
	console.log(`Done! Created ${projectName} at ${outputDir}`);
	console.log('');
	console.log('Next steps:');
	console.log(`  cd ${projectName}`);
	console.log('  pnpm install');
	console.log('  pnpm dev');
}

main();
