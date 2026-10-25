---
name: starter
description: Scaffold a new frontend project (vanilla, React or Astro, in JavaScript or TypeScript) with the official create command, then apply a lint/format config, CSS reset, `@/` alias and Lightning CSS on top. Use when asked to start, create, scaffold or set up a new web project, app or site.
license: MIT
compatibility: Needs a shell, Node.js 22.23.4+ or 24.11+, pnpm and network access.
argument-hint: '[vanilla|react|astro] [js|ts] [project-name]'
allowed-tools: Bash(pnpm:*) Bash(mkdir:*) Bash(cp:*)
---

Scaffold with the official create command, then apply `overlay/` on top. Scaffold supplies all project files; overlay adds config only. SKILL_DIR = absolute path of this file's folder; `overlay/...` paths are relative to it.

## 1. Inputs
- template: vanilla | react | astro. Required.
- lang: ts | js. Default ts. Astro ignores it.
- name: project dir, relative to cwd. Required.
Parse from request (e.g. `react my-app`, `vanilla js playground`). Missing template or name: ask, don't guess. Dir exists: stop.
Check `node -v` (22.23.4+ or 24.11+) and `pnpm -v`.

## 2. Scaffold
Run the variant's command, then `cd <name>`. All variants use Vite+ (Oxlint + Oxfmt via `vp`, deps auto-installed) except vanilla js: plain Vite, run `pnpm install` after cd.
```sh
# vanilla ts
pnpm create vite-plus vite --no-interactive --no-agent --no-editor --no-hooks --no-git -- <name> --template vanilla-ts
# react ts
pnpm create vite-plus vite --no-interactive --no-agent --no-editor --no-hooks --no-git -- <name> --template react-ts
# react js
pnpm create vite-plus vite --no-interactive --no-agent --no-editor --no-hooks --no-git -- <name> --template react
# astro
pnpm create vite-plus create-astro --no-interactive --no-agent --no-editor --no-hooks --no-git -- <name> --template minimal --no-install --no-git --yes --no-ai --skip-houston
# vanilla js
pnpm create vite <name> --template vanilla --no-interactive --no-immediate
```
Other frameworks from `pnpm create vite-plus --list`: scaffold the same way, apply overlay where it fits.

## 3. Overlay
Edit scaffold files in place. Never replace a file wholesale; leave demo content alone.

variant | vite config | `@/` paths in | css dir | import index.css in
--- | --- | --- | --- | ---
vanilla ts | vite.config.ts | tsconfig.json | src/css | src/main.ts, first line
vanilla js | copy (3a) | - | src/css | src/main.js, first line
react ts | vite.config.ts | tsconfig.app.json | src/css | src/main.tsx, above `import './index.css';`
react js | vite.config.js | - | src/css | src/main.jsx, above `import './index.css';`
astro | vite.config.ts + astro.config.mjs | tsconfig.json | src/styles | src/pages/index.astro, frontmatter

3a. Vite config
- Vite+ variants: merge keys from `overlay/vite.config.ts` into scaffold config, replacing its empty `fmt: {}`, keeping everything else (lint, plugins, imports). Always merge `fmt` and `css`; `resolve` only for vanilla ts and react ts.
- astro: `fmt` into vite.config.ts. `css` under `vite` in astro.config.mjs. Skip `resolve` (Astro reads tsconfig paths):
  ```js
  export default defineConfig({
  	vite: {
  		css: {
  			transformer: 'lightningcss',
  			lightningcss: { drafts: { customMedia: true } },
  		},
  	},
  });
  ```
- vanilla js (no config yet):
  ```sh
  cp "$SKILL_DIR"/overlay/plain-vite/vite.config.js vite.config.js
  cp "$SKILL_DIR"/overlay/plain-vite/oxfmtrc.json .oxfmtrc.json
  pnpm add -D oxlint oxfmt
  ```

3b. `@/` alias (TS variants + astro): add to `compilerOptions` in the table's file (create `compilerOptions` if missing, e.g. astro):
`"paths": { "@/*": ["./src/*"] }`

3c. CSS: `mkdir -p <css-dir> && cp "$SKILL_DIR"/overlay/css/*.css <css-dir>/`, then import index.css before any other stylesheet where the table says. Import: `import './css/index.css';`; astro: `import '@/styles/index.css';`.

3d. .gitignore: append each line of `overlay/gitignore` not already present.

3e. package.json scripts (add, keep scaffold's own):
script | Vite+ | vanilla js
--- | --- | ---
lint | vp lint | oxlint
lint:fix | vp lint --fix | oxlint --fix
format | vp fmt | oxfmt
check | vp check | oxfmt --check && oxlint

3f. astro only, type check on build (TS vanilla/react builds already do): `pnpm add -D @astrojs/check typescript@^6`, set `"build": "astro check && astro build"`. Keep TS 6: `astro check` refuses TS 7.

## 4. Verify
`pnpm install && pnpm format && pnpm build && pnpm run check`
On failure fix cause, rerun whole line. Never report success while a step fails. Don't `git init` or commit; user does that.

## 5. Report
Confirm first:
- format config has `useTabs: true`, `singleQuote: true`, `sortPackageJson: false` (`fmt` in vite config, or .oxfmtrc.json)
- Lightning CSS set (astro: astro.config.mjs)
- `@/*` in tsconfig paths (TS variants + astro)
- 3 stylesheets in css dir, index.css imported first
- lint, lint:fix, format, check scripts exist
- verify line passed
Tell user what was created and next steps: `cd <name>`, `pnpm dev`.

## Extras
Only if asked (e.g. "react with Tailwind"): finish + verify base first, add extra per its official docs, rerun verify.
Tailwind: `@import 'tailwindcss';` first in index.css; delete reset.css and its import (Preflight replaces it). global.css stays in `@layer base` so utilities override it.

## Rules
- Configure only what differs from tool defaults.
- Versions come from scaffold or `pnpm add`. No pins unless a step says so.
- CSS via Lightning CSS only. No PostCSS, Autoprefixer, browserslist.
