#!/usr/bin/env node
import { downloadTemplate } from 'giget';

const REPO = 'judenns/starter-templates';
const TEMPLATES = {
	vanilla: 'vanilla-js',
	react: 'react-js',
};

const [template, projectName] = process.argv.slice(2);

// Show help
if (!template || !projectName || template === '--help' || template === '-h') {
	console.log(`
Usage: pnpm create @judenns/starter <template> <project-name>

Templates:
  vanilla    Vite + Vanilla JavaScript
  react      Vite + React 19

Example:
  pnpm create @judenns/starter react my-app
  pnpm create @judenns/starter vanilla my-app
`);
	process.exit(template === '--help' || template === '-h' ? 0 : 1);
}

// Validate template
const branch = TEMPLATES[template];
if (!branch) {
	console.error(`Error: Unknown template "${template}"`);
	console.error(`Available templates: ${Object.keys(TEMPLATES).join(', ')}`);
	process.exit(1);
}

// Download template
try {
	console.log(`Creating ${projectName} with ${template} template...`);

	await downloadTemplate(`github:${REPO}#${branch}`, {
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
