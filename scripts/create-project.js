#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');
const TOOLCHAINS_DIR = path.join(ROOT_DIR, 'toolchains');
const SHARED_CSS_DIR = path.join(ROOT_DIR, 'packages', 'shared-css');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'));
const writeJson = (file, data) => fs.writeFileSync(file, `${JSON.stringify(data, null, '\t')}\n`);

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
			const match = line.match(/^\s{2}"?([^"]+?)"?:\s*"?([^"]+)"?$/);
			if (match) {
				versions[match[1]] = match[2];
			}
		} else if (inCatalog && line.match(/^\S/)) {
			break; // Exit catalog section
		}
	}
	return versions;
}

const MANIFEST = readJson(path.join(ROOT_DIR, 'templates.json'));
const CATALOG_VERSIONS = parseCatalogVersions();

const SKIP_FILES = ['node_modules', 'dist', '.astro', '.git'];

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

// Gộp sâu patch vào target (patch thắng); mảng và giá trị đơn bị ghi đè
function deepMerge(target, patch) {
	const result = { ...target };
	for (const [key, value] of Object.entries(patch)) {
		const isObject = value && typeof value === 'object' && !Array.isArray(value);
		result[key] = isObject ? deepMerge(result[key] ?? {}, value) : value;
	}
	return result;
}

// Một lớp toolchain: copy files/ vào project, gộp package.patch.json vào package.json
function applyLayer(layerDir, outputDir, pkg) {
	if (!fs.existsSync(layerDir)) return pkg;

	const filesDir = path.join(layerDir, 'files');
	if (fs.existsSync(filesDir)) copyDir(filesDir, outputDir, []);

	const patchPath = path.join(layerDir, 'package.patch.json');
	return fs.existsSync(patchPath) ? deepMerge(pkg, readJson(patchPath)) : pkg;
}

// Vite+: chạy lệnh vite qua `vp`, nhúng cấu hình fmt/lint vào vite.config.ts của template
// (template không có vite.config.ts, như Astro, thì dùng file của toolchain cho riêng lint/fmt)
function applyVitePlus(outputDir, pkg) {
	// `vite build` → `vp build`, `vite` (dev server) → `vp dev`
	for (const [name, script] of Object.entries(pkg.scripts)) {
		pkg.scripts[name] = script
			.replace(/(^|&& )vite(?= (build|preview|dev|optimize)\b)/g, '$1vp')
			.replace(/(^|&& )vite\b/g, '$1vp dev');
	}

	const toolchainConfig = fs.readFileSync(
		path.join(TOOLCHAINS_DIR, 'vite-plus', 'vite.config.ts'),
		'utf-8',
	);
	const configPath = path.join(outputDir, 'vite.config.ts');
	if (!fs.existsSync(configPath)) {
		fs.writeFileSync(configPath, toolchainConfig);
		return;
	}

	const OPEN = 'export default defineConfig({\n';
	const IMPORT = "from 'vite';";
	const config = fs.readFileSync(configPath, 'utf-8');
	for (const anchor of [OPEN, IMPORT]) {
		if (config.split(anchor).length !== 2) {
			throw new Error(`vite.config.ts must contain exactly one \`${anchor.trim()}\``);
		}
	}

	const body = toolchainConfig.slice(
		toolchainConfig.indexOf(OPEN) + OPEN.length,
		toolchainConfig.lastIndexOf('});'),
	);
	fs.writeFileSync(
		configPath,
		config.replace(IMPORT, "from 'vite-plus';").replace(OPEN, `${OPEN}${body}`),
	);
}

// Thay catalog: bằng version thật từ pnpm-workspace.yaml
function resolveCatalogVersions(deps = {}) {
	for (const [dep, version] of Object.entries(deps)) {
		if (version !== 'catalog:') continue;
		if (!CATALOG_VERSIONS[dep]) {
			console.error(`Error: "${dep}" uses catalog: but is missing from pnpm-workspace.yaml`);
			process.exit(1);
		}
		deps[dep] = CATALOG_VERSIONS[dep];
	}
}

function main() {
	const args = process.argv.slice(2);

	if (args.length < 3) {
		console.log('Usage: pnpm create-project <template> <toolchain> <project-name>');
		console.log('');
		console.log(`Templates:  ${Object.keys(MANIFEST.templates).join(', ')}`);
		console.log(`Toolchains: ${Object.keys(MANIFEST.toolchains).join(', ')}`);
		process.exit(1);
	}

	const [templateName, toolchainName, projectName] = args;
	const template = MANIFEST.templates[templateName];
	const templateDir = path.join(TEMPLATES_DIR, templateName);
	const outputDir = path.resolve(process.cwd(), projectName);

	if (!template) {
		console.error(`Template "${templateName}" not found.`);
		process.exit(1);
	}
	if (!MANIFEST.toolchains[toolchainName]) {
		console.error(`Toolchain "${toolchainName}" not found.`);
		process.exit(1);
	}

	// Check output doesn't exist
	if (fs.existsSync(outputDir)) {
		console.error(`Directory "${projectName}" already exists.`);
		process.exit(1);
	}

	console.log(`Creating "${projectName}" from "${templateName}" with "${toolchainName}"...`);

	// 1. Copy template folder (keep package.json)
	copyDir(templateDir, outputDir);

	// 2. Copy shared CSS vào thư mục CSS của template, đổi import @starter/shared-css thành local
	const outputCssDir = path.join(outputDir, template.cssDir);
	copyDir(SHARED_CSS_DIR, outputCssDir, [...SKIP_FILES, 'package.json']);
	const indexCssPath = path.join(outputCssDir, 'index.css');
	const indexCss = fs.readFileSync(indexCssPath, 'utf-8');
	fs.writeFileSync(indexCssPath, indexCss.replace(/@starter\/shared-css\//g, './'));

	// 3. Copy root .gitignore
	fs.copyFileSync(path.join(ROOT_DIR, '.gitignore'), path.join(outputDir, '.gitignore'));

	// 4. package.json: bỏ workspace deps, áp toolchain (chung, rồi riêng cho template)
	const pkgPath = path.join(outputDir, 'package.json');
	let pkg = readJson(pkgPath);
	pkg.name = path.basename(outputDir);
	delete pkg.devDependencies['@starter/shared-css'];

	const toolchainDir = path.join(TOOLCHAINS_DIR, toolchainName);
	pkg = applyLayer(toolchainDir, outputDir, pkg);
	pkg = applyLayer(path.join(toolchainDir, templateName), outputDir, pkg);
	if (toolchainName === 'vite-plus') applyVitePlus(outputDir, pkg);

	resolveCatalogVersions(pkg.dependencies);
	resolveCatalogVersions(pkg.devDependencies);

	writeJson(pkgPath, pkg);

	// 5. Init git
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
