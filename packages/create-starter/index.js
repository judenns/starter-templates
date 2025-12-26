#!/usr/bin/env node
import { downloadTemplate } from 'giget';
import prompts from 'prompts';

const REPO = 'judenns/starter-templates';
const TEMPLATES = {
	vanilla: { branch: 'vanilla-js', description: 'Vite + Vanilla JavaScript' },
	react: { branch: 'react-js', description: 'Vite + React 19' },
};

let [template, projectName] = process.argv.slice(2);

// Show help
if (template === '--help' || template === '-h') {
	console.log(`
Usage: pnpm create @judenns/starter [template] [project-name]

Templates:
  vanilla    Vite + Vanilla JavaScript
  react      Vite + React 19

Example:
  pnpm create @judenns/starter react my-app
  pnpm create @judenns/starter vanilla my-app
`);
	process.exit(0);
}

// Interactive prompts if missing arguments
if (!template) {
	const response = await prompts({
		type: 'select',
		name: 'template',
		message: 'Select template:',
		choices: Object.entries(TEMPLATES).map(([name, { description }]) => ({
			title: `${name} - ${description}`,
			value: name,
		})),
	});
	template = response.template;
	if (!template) process.exit(1);
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

// Validate template
const templateConfig = TEMPLATES[template];
if (!templateConfig) {
	console.error(`Error: Unknown template "${template}"`);
	console.error(`Available templates: ${Object.keys(TEMPLATES).join(', ')}`);
	process.exit(1);
}

// Download template
try {
	console.log(`Creating ${projectName} with ${template} template...`);

	await downloadTemplate(`github:${REPO}#${templateConfig.branch}`, {
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
