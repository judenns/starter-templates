#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { downloadTemplate } from 'giget';
import prompts from 'prompts';

const REPO = 'judenns/starter-templates';
// Template list lives in the repo, so new templates don't need a CLI release
const MANIFEST_URL = `https://raw.githubusercontent.com/${REPO}/main/templates.json`;

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		toolchain: { type: 'string', short: 't' },
		help: { type: 'boolean', short: 'h' },
	},
});
let [template, projectName] = positionals;
let toolchain = values.toolchain;

let manifest;
try {
	const response = await fetch(MANIFEST_URL);
	if (!response.ok) throw new Error(`HTTP ${response.status}`);
	manifest = await response.json();
} catch (error) {
	console.error(`Error: could not load the template list (${error.message})`);
	process.exit(1);
}

const list = (entries) =>
	Object.entries(entries)
		.map(([name, { description }]) => `  ${name.padEnd(12)}${description}`)
		.join('\n');

// Show help
if (values.help) {
	console.log(`
Usage: pnpm create @judenns/starter [template] [project-name] [--toolchain <name>]

Templates:
${list(manifest.templates)}

Toolchains (--toolchain, -t):
${list(manifest.toolchains)}

Example:
  pnpm create @judenns/starter react my-app --toolchain biome
  pnpm create @judenns/starter astro my-site -t vite-plus
`);
	process.exit(0);
}

const choices = (entries) =>
	Object.entries(entries).map(([name, { description }]) => ({
		title: `${name} - ${description}`,
		value: name,
	}));

// Interactive prompts if missing arguments
if (!template) {
	const response = await prompts({
		type: 'select',
		name: 'template',
		message: 'Select template:',
		choices: choices(manifest.templates),
	});
	template = response.template;
	if (!template) process.exit(1);
}

if (!toolchain) {
	const response = await prompts({
		type: 'select',
		name: 'toolchain',
		message: 'Select lint/format toolchain:',
		choices: choices(manifest.toolchains),
	});
	toolchain = response.toolchain;
	if (!toolchain) process.exit(1);
}

if (!projectName) {
	const response = await prompts({
		type: 'text',
		name: 'projectName',
		message: 'Project name:',
		initial: 'my-app',
	});
	projectName = response.projectName;
	if (!projectName) process.exit(1);
}

// Validate choices
for (const [kind, name] of [
	['templates', template],
	['toolchains', toolchain],
]) {
	if (!manifest[kind][name]) {
		console.error(`Error: Unknown ${kind.slice(0, -1)} "${name}"`);
		console.error(`Available ${kind}: ${Object.keys(manifest[kind]).join(', ')}`);
		process.exit(1);
	}
}

// Download template (one branch per template + toolchain)
try {
	console.log(`Creating ${projectName} with ${template} + ${toolchain}...`);

	await downloadTemplate(`github:${REPO}#${template}-${toolchain}`, {
		dir: projectName,
	});

	console.log(`
Done! Now run:

  cd ${projectName}
  pnpm install
  pnpm dev
`);
} catch (error) {
	console.error('Error:', error.message);
	process.exit(1);
}
