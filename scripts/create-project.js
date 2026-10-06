#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
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

const ROOT_PKG = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8'));
const CATALOG_VERSIONS = parseCatalogVersions();
const ROOT_VERSIONS = ROOT_PKG.devDependencies || {};

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

// Tách các dòng import (single-line) khỏi phần còn lại của file
function splitImports(source) {
	const imports = [];
	const body = [];
	for (const line of source.split('\n')) {
		(line.startsWith('import ') ? imports : body).push(line);
	}
	return { imports, body: body.join('\n').trim() };
}

// Inline createBaseConfig() từ @starter/vite-config vào vite.config.js của template,
// để base.js là nguồn duy nhất cho config Vite
function buildStandaloneViteConfig(templateSource, baseSource) {
	const base = splitImports(baseSource);
	const template = splitImports(templateSource);
	const templateImports = template.imports.filter((line) => !line.includes('@starter/vite-config'));

	// Sắp xếp giống Biome organizeImports: node: builtins trước, sau đó theo tên module
	const sourceOf = (line) => line.match(/from '([^']+)'/)[1];
	const imports = [...new Set([...base.imports, ...templateImports])].sort((a, b) => {
		const [sa, sb] = [sourceOf(a), sourceOf(b)];
		const [na, nb] = [sa.startsWith('node:'), sb.startsWith('node:')];
		if (na !== nb) return na ? -1 : 1;
		return sa < sb ? -1 : sa > sb ? 1 : 0;
	});

	const baseBody = base.body.replace(/^export function /m, 'function ');
	return `${imports.join('\n')}\n\n${baseBody}\n\n${template.body}\n`;
}

function main() {
	const args = process.argv.slice(2);

	if (args.length < 2) {
		console.log('Usage: pnpm create-project <template> <project-name>');
		console.log('');
		console.log('Available templates:');
		const templates = fs
			.readdirSync(TEMPLATES_DIR, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name);
		for (const t of templates) console.log(`  - ${t}`);
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
	fs.copyFileSync(
		path.join(ROOT_DIR, 'postcss.config.js'),
		path.join(outputDir, 'postcss.config.js'),
	);
	fs.copyFileSync(
		path.join(ROOT_DIR, '.prettierrc.json'),
		path.join(outputDir, '.prettierrc.json'),
	);
	fs.copyFileSync(path.join(ROOT_DIR, '.gitignore'), path.join(outputDir, '.gitignore'));

	// 5. Copy root biome.json as-is (replaces the template's nested config)
	fs.copyFileSync(path.join(ROOT_DIR, 'biome.json'), path.join(outputDir, 'biome.json'));

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
	if (!ROOT_VERSIONS['@biomejs/biome'] || !ROOT_VERSIONS.prettier) {
		console.error('Error: Missing @biomejs/biome or prettier in root package.json');
		process.exit(1);
	}
	pkg.devDependencies['@biomejs/biome'] = ROOT_VERSIONS['@biomejs/biome'];
	pkg.devDependencies.prettier = ROOT_VERSIONS.prettier;

	// Add browserslist (single source: root package.json, matches Vite's build.target)
	pkg.browserslist = ROOT_PKG.browserslist;

	fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, '\t')}\n`);

	// 7. Inline vite.config.js (base config from @starter/vite-config + template config)
	const viteConfigPath = path.join(outputDir, 'vite.config.js');
	const baseConfigPath = path.join(PACKAGES_DIR, 'vite-config', 'base.js');
	fs.writeFileSync(
		viteConfigPath,
		buildStandaloneViteConfig(
			fs.readFileSync(viteConfigPath, 'utf-8'),
			fs.readFileSync(baseConfigPath, 'utf-8'),
		),
	);

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
