---
name: starter
description: Scaffold a new frontend project (vanilla, React or Astro, in JavaScript or TypeScript) with the official create command, then apply a Vite+ lint/format config, CSS reset, `@/` alias and Lightning CSS on top. Use when asked to start, create, scaffold or set up a new web project, app or site.
license: MIT
compatibility: Needs a shell, Node.js 22.23.4+ or 24.11+, pnpm and network access.
argument-hint: '[vanilla|react|astro] [js|ts] [project-name]'
---

# Starter

Create the project with the framework's official create command, then apply this skill's `overlay/` on top. The scaffold supplies every project file; the overlay only adds configuration. Lint and format always use **Vite+** (Oxlint + Oxfmt via `vp`).

`SKILL_DIR` below means the absolute path of the folder containing this `SKILL.md`. Paths like `overlay/…` are relative to it. Run project commands from the new project's directory.

## 1. Inputs

You need:

- **template**: `vanilla`, `react` or `astro`
- **lang**: `ts` or `js`, optional — defaults to `ts`
- **name**: the project directory, relative to the current directory

Take them from the request. If the template or name is missing, ask the user; don't guess. Stop if the directory already exists. Accept any of these shapes: `react my-app`, `react ts my-app`, `react js my-app`, `astro ts blog`, `vanilla playground`, and so on.

Astro has no `js`/`ts` create option — its `minimal` template is plain JavaScript but ships a `tsconfig.json` and accepts TypeScript in `.astro` and `.ts` files, so the same command serves both.

Check `node -v` (22.23.4+ on Node 22, or 24.11+) and `pnpm -v` (installed).

## 2. Scaffold

Run the command for the template from the current directory, then `cd <name>`. It also installs dependencies and formats the code.

| Template      | Command                                                                                                                                                                                              |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vanilla` ts  | `pnpm create vite-plus vite --no-interactive --no-agent --no-editor --no-hooks --no-git -- <name> --template vanilla-ts`                                                                             |
| `vanilla` js  | `pnpm create vite-plus vite --no-interactive --no-agent --no-editor --no-hooks --no-git -- <name> --template vanilla`                                                                                |
| `react` ts    | `pnpm create vite-plus vite --no-interactive --no-agent --no-editor --no-hooks --no-git -- <name> --template react-ts`                                                                               |
| `react` js    | `pnpm create vite-plus vite --no-interactive --no-agent --no-editor --no-hooks --no-git -- <name> --template react`                                                                                  |
| `astro`       | `pnpm create vite-plus create-astro --no-interactive --no-agent --no-editor --no-hooks --no-git -- <name> --template minimal --no-install --no-git --yes --no-ai --skip-houston` |

The `--no-*` flags before `--` are Vite+ options; the options after `--` are passed unchanged to the official `create-*` tool. `--no-install` stops `create-astro` from running its own install so Vite+ can do it with pnpm. Another framework that `vp create` supports (`pnpm create vite-plus --list`) works the same way: scaffold it, then apply the overlay where it fits.

## 3. Apply the overlay

Edit the scaffold's files in place. Never replace a file wholesale, and leave its demo content alone.

**a. Vite config.** Read `overlay/vite.config.ts`. Merge its `fmt`, `resolve` and `css` keys into the scaffold's config. Keep everything the scaffold already has (`lint`, `plugins`, imports from `vite-plus`). Replace the scaffold's empty `fmt: {}`.

The scaffold's config is usually `vite.config.ts`, but `react js` uses `vite.config.js`. Merge into whichever exists.

- `fmt` and `css`: always.
- `resolve`: only for `vanilla ts` and `react ts`. The JS templates have no tsconfig, and Astro reads tsconfig paths itself.
- Astro: `fmt` goes into `vite.config.ts`; `css` goes under `vite` in `astro.config.mjs`.

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

**b. `@/` alias.** Only when the project has a `tsconfig` (skip for `vanilla js` and `react js`). Add this to `compilerOptions` in `tsconfig.app.json` if it exists, otherwise in `tsconfig.json` (Astro's has no `compilerOptions` yet, so create it):

```json
"paths": { "@/*": ["./src/*"] }
```

**c. CSS.** Copy the stylesheets into the template's CSS dir (`src/css` for vanilla and react, `src/styles` for astro):

```sh
mkdir -p <css-dir> && cp "$SKILL_DIR"/overlay/css/*.css <css-dir>/
```

Import `index.css` before any other stylesheet:

- Vanilla: top of `src/main.ts` (or `src/main.js`): `import './css/index.css';`
- React: in `src/main.tsx` (or `src/main.jsx`), just above `import './index.css';`: `import './css/index.css';`
- Astro: in the frontmatter of `src/pages/index.astro`: `import '@/styles/index.css';`

**d. `.gitignore`.** Append each line of `overlay/gitignore` that the project's `.gitignore` doesn't already have.

**e. Scripts.** Add these to `scripts` in `package.json` and keep the scaffold's own:

```json
"lint": "vp lint",
"lint:fix": "vp lint --fix",
"format": "vp fmt",
"check": "vp check"
```

**f. Astro only: type check on build.** Vanilla and React builds already type check where TypeScript is present (`tsc … && vp build`). For Astro:

```sh
pnpm add -D @astrojs/check typescript@^6
```

Then set `"build": "astro check && astro build"`. Keep TypeScript on 6: `astro check` refuses TypeScript 7, and create-vite also pins 6.

## 4. Verify

```sh
pnpm install && pnpm format && pnpm build && pnpm run check
```

If a step fails, fix the cause and run the whole line again until everything passes. Never report success while a step fails.

Then commit:

```sh
git init && git add -A && git commit -m "Initial commit"
```

## 5. Report

Before reporting, confirm each item:

- [ ] `vite.config.ts` (or `.js`) has `fmt` with `useTabs: true`, `singleQuote: true`, `sortPackageJson: false`
- [ ] Lightning CSS is set in the Vite config (Astro: in `astro.config.mjs`)
- [ ] `@/*` is in the tsconfig `paths` — unless `vanilla js` or `react js`
- [ ] `reset.css`, `global.css` and `index.css` are in the CSS dir, and `index.css` is imported first
- [ ] the `lint`, `lint:fix`, `format` and `check` scripts exist
- [ ] the verify line passed and the commit exists

Then tell the user what was created and the next steps: `cd <name>` and `pnpm dev`.

## Extras

If the user asks for more than the base (e.g. "react with Tailwind"), finish and verify the base first. Then add the extra by following its official docs, and run the verify line again.

## Rules

- Configure only what differs from a tool's defaults.
- Versions come from the scaffold or `pnpm add`. Don't pin a version unless a step above says to.
- CSS goes through Lightning CSS. Don't add PostCSS, Autoprefixer or browserslist.
