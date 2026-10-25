---
name: starter
description: Scaffold a new frontend project (vanilla, React or Astro, in JavaScript or TypeScript) with the official create command, then apply a lint/format config, CSS reset, `@/` alias and Lightning CSS on top. Use when asked to start, create, scaffold or set up a new web project, app or site.
license: MIT
compatibility: Needs a shell, Node.js 22.23.4+ or 24.11+, pnpm and network access.
argument-hint: '[vanilla|react|astro] [js|ts] [project-name]'
allowed-tools: Bash(pnpm *) Bash(node -v) Read Edit Write
---

Scaffold with the official create command, then copy CSS + config from `overlay/` (relative to this file's folder). Scaffold supplies all project files.
Permissions: one shell command per call (no `&&`, pipes, heredocs, variables). The skill folder is outside the project: never ls/cp/cat it; copy an overlay file by reading it and writing it to the target. Change project files with file edits.

## 1. Inputs
template (vanilla | react | astro) and name (project dir) required: ask if missing. lang ts | js, default ts; astro ignores it. Dir exists: stop. Needs `node -v` 22.23.4+ or 24.11+ and pnpm.

## 2. Scaffold
```sh
# vanilla ts
pnpm create vite-plus vite --no-interactive --no-agent --no-editor --no-hooks --no-git -- <name> --template vanilla-ts
# react ts
pnpm create vite-plus vite --no-interactive --no-agent --no-editor --no-hooks --no-git -- <name> --template react-ts
# react js
pnpm create vite-plus vite --no-interactive --no-agent --no-editor --no-hooks --no-git -- <name> --template react
# vanilla js (plain Vite)
pnpm create vite <name> --template vanilla --no-interactive --no-immediate
# astro (plain: Vite+ breaks it)
pnpm create astro <name> --template minimal --no-install --no-git --yes --no-ai --skip-houston
```
Then `cd <name>`; plain variants (vanilla js, astro): `pnpm install`.
Other frameworks: see "Other frameworks" below.

## 3. Apply
All variants:
- CSS: copy `overlay/css/reset.css`, `global.css`, `index.css` into the css dir, import index.css before any other stylesheet (see variant).
- .gitignore: append each line of `overlay/gitignore` not already present.
- package.json: add scripts, keep the scaffold's own:
  script | Vite+ | plain
  --- | --- | ---
  lint | vp lint | oxlint
  lint:fix | vp lint --fix | oxlint --fix
  format | vp fmt | oxfmt
  check | vp check | oxfmt --check && oxlint

vanilla ts / react ts / react js (Vite+):
- Merge `overlay/vite-plus/vite.config.ts` into the scaffold's vite.config: `fmt` replaces its empty `fmt: {}`, add `css`, keep everything else. `resolve` only for TS.
- TS: add `"paths": { "@/*": ["./src/*"] }` to compilerOptions in tsconfig.json (vanilla) or tsconfig.app.json (react).
- css dir `src/css`. Import `import './css/index.css';` as first line of src/main.ts (vanilla) or above `import './index.css';` in src/main.tsx|jsx (react).

vanilla js:
- Copy `overlay/vanilla-js/vite.config.js` to `vite.config.js`, `overlay/vanilla-js/oxfmtrc.json` to `.oxfmtrc.json`.
- `pnpm add -D oxlint oxfmt`
- css dir `src/css`. Import `import './css/index.css';` as first line of src/main.js.

astro:
- Copy `overlay/astro/astro.config.mjs` over `astro.config.mjs` (scaffold's is empty), `overlay/astro/oxfmtrc.json` to `.oxfmtrc.json`.
- `pnpm add -D oxlint oxfmt @astrojs/compiler-rs @astrojs/check typescript@^6` (compiler-rs: oxfmt formats .astro with it. TS 6: `astro check` refuses 7).
- Set script `"build": "astro check && astro build"`.
- tsconfig.json: add `"compilerOptions": { "paths": { "@/*": ["./src/*"] } }`.
- css dir `src/styles`. Import `import '@/styles/index.css';` in src/pages/index.astro frontmatter.

## 4. Verify
`pnpm install && pnpm format && pnpm build && pnpm run check` (run as separate commands). On failure fix cause, rerun all. Never report success while a step fails. Don't `git init` or commit.

## 5. Report
Confirm: format config (tabs, single quotes, sortPackageJson false), Lightning CSS, `@/*` paths (TS + astro), 3 stylesheets with index.css imported first, the 4 scripts, verify passed. Next steps: `cd <name>`, `pnpm dev`.

## Other frameworks
Before scaffolding, read the framework's official docs (Context7 if available, else its docs site) for: create command + non-interactive flags, where CSS/Vite config goes, built-in path alias, type check script.
- Scaffold via `pnpm create vite-plus <shorthand|create-pkg> --no-interactive --no-agent --no-editor --no-hooks --no-git -- <name> <template options>` (shorthands: `pnpm create vite-plus --list`). Vite templates (vue-ts, svelte-ts, solid-ts, ...) use the `vite` shorthand and follow the react ts row.
- Priority: official docs/conventions > compatibility > this overlay. Never force overlay setup. Apply an item only where docs confirm it fits; unsure: skip it, tell the user.
- Keep framework conventions: its own alias (`~`, `#lib`, existing `@`) instead of adding `@/`; its own config file for CSS/Vite options; global CSS where docs say (root layout, `css: []`, linked stylesheet, ...).
- Template ships Tailwind: follow Extras (drop reset.css, keep global.css), import index.css after the Tailwind stylesheet.
- Existing check/typecheck script: combine instead of replacing (e.g. `vp check && svelte-check ...`). Generated types needed first: run the generator before `vp check` (e.g. `react-router typegen && vp check && tsc`).
- Generated files (e.g. TanStack `src/routeTree.gen.ts`): add to `fmt.ignorePatterns`.
- Non-Vite frameworks (Next): Vite+ config only drives fmt/lint; enable Lightning CSS only via a documented option, else skip (Next+Turbopack already uses it).
- `ERR_PNPM_IGNORED_BUILDS` on install (e.g. Nuxt, esbuild): add the named packages under `allowBuilds:` in pnpm-workspace.yaml (`<pkg>: true`), rerun.
- Same verify line and report checklist; mark items skipped on purpose and why.

## Extras
Only if asked (e.g. "react with Tailwind"): finish + verify base first, add extra per its official docs, rerun verify.
Tailwind: `@import 'tailwindcss';` first in index.css; delete reset.css and its import (Preflight replaces it). global.css stays in `@layer base` so utilities override it.

## Rules
- Configure only what differs from tool defaults.
- Versions come from scaffold or `pnpm add`. No pins unless a step says so.
- CSS via Lightning CSS only. No PostCSS, Autoprefixer, browserslist.
