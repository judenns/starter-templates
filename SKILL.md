---
name: starter
description: Scaffold a new frontend project (vanilla, React or Astro, in JavaScript or TypeScript) with the official create command, then apply a lint/format config, CSS reset, `@/` alias and Lightning CSS on top. Use when asked to start, create, scaffold or set up a new web project, app or site.
license: MIT
compatibility: Needs a shell, Node.js 22.23.4+ or 24.11+, pnpm and network access.
argument-hint: '[vanilla|react|astro] [js|ts] [project-name]'
allowed-tools: Bash(pnpm:*) Bash(mkdir:*) Bash(cp:*)
---

# Starter

Scaffold with the official create command, then apply this skill's `overlay/` on top. The scaffold supplies every project file; the overlay only adds configuration.

`SKILL_DIR` means the absolute path of the folder containing this file. `overlay/…` paths are relative to it.

## 1. Inputs

- **template**: `vanilla`, `react` or `astro`. Required.
- **lang**: `ts` or `js`. Optional, defaults to `ts`. Astro ignores it: one command serves both.
- **name**: the project directory, relative to the current directory. Required.

Read them from the request (`react my-app`, `vanilla js playground`, …). If template or name is missing, ask; don't guess. Stop if the directory already exists.

Check `node -v` (22.23.4+, or 24.11+) and that `pnpm -v` works.

## 2. Scaffold

Run the command for the variant, then `cd <name>`. All variants use Vite+ (Oxlint + Oxfmt via `vp`) except `vanilla js`, which uses plain Vite with `oxlint` and `oxfmt` installed directly.

```sh
# vanilla ts
pnpm create vite-plus vite --no-interactive --no-agent --no-editor --no-hooks --no-git -- <name> --template vanilla-ts

# react ts / react js
pnpm create vite-plus vite --no-interactive --no-agent --no-editor --no-hooks --no-git -- <name> --template react-ts
pnpm create vite-plus vite --no-interactive --no-agent --no-editor --no-hooks --no-git -- <name> --template react

# astro
pnpm create vite-plus create-astro --no-interactive --no-agent --no-editor --no-hooks --no-git -- <name> --template minimal --no-install --no-git --yes --no-ai --skip-houston

# vanilla js (plain Vite)
pnpm create vite <name> --template vanilla --no-interactive --no-immediate
```

Vite+ installs dependencies itself. For `vanilla js`, run `pnpm install` after `cd`.

Another framework from `pnpm create vite-plus --list` works the same way: scaffold it, then apply the overlay where it fits.

## 3. Apply the overlay

Edit the scaffold's files in place. Never replace a file wholesale, and leave its demo content alone.

| Variant      | Vite config                           | `@/` paths in       | CSS dir      | Import `index.css` in                         |
| ------------ | ------------------------------------- | ------------------- | ------------ | --------------------------------------------- |
| `vanilla ts` | `vite.config.ts`                      | `tsconfig.json`     | `src/css`    | `src/main.ts`, first line                     |
| `vanilla js` | copy (see a)                          | —                   | `src/css`    | `src/main.js`, first line                     |
| `react ts`   | `vite.config.ts`                      | `tsconfig.app.json` | `src/css`    | `src/main.tsx`, above `import './index.css';` |
| `react js`   | `vite.config.js`                      | —                   | `src/css`    | `src/main.jsx`, above `import './index.css';` |
| `astro`      | `vite.config.ts` + `astro.config.mjs` | `tsconfig.json`     | `src/styles` | `src/pages/index.astro`, frontmatter          |

**a. Vite config.**

- **Vite+ variants:** merge the keys from `overlay/vite.config.ts` into the scaffold's config, replacing its empty `fmt: {}` and keeping everything else (`lint`, `plugins`, imports). Merge `fmt` and `css` always; `resolve` only for `vanilla ts` and `react ts`.
- **Astro:** `fmt` goes into `vite.config.ts`. `css` goes under `vite` in `astro.config.mjs`. Skip `resolve`: Astro reads tsconfig paths itself.

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

- **`vanilla js`:** it has no config yet. Copy the plain-Vite files and add the tools:

  ```sh
  cp "$SKILL_DIR"/overlay/plain-vite/vite.config.js vite.config.js
  cp "$SKILL_DIR"/overlay/plain-vite/oxfmtrc.json .oxfmtrc.json
  pnpm add -D oxlint oxfmt
  ```

**b. `@/` alias** (TS variants and Astro). Add to `compilerOptions` in the file from the table, creating `compilerOptions` if it's missing (Astro):

```json
"paths": { "@/*": ["./src/*"] }
```

**c. CSS.** Copy the stylesheets, then import `index.css` before any other stylesheet, where the table says:

```sh
mkdir -p <css-dir> && cp "$SKILL_DIR"/overlay/css/*.css <css-dir>/
```

The import is `import './css/index.css';`, except Astro: `import '@/styles/index.css';`.

**d. `.gitignore`.** Append each line of `overlay/gitignore` that the project's `.gitignore` doesn't already have.

**e. Scripts.** Add to `scripts` in `package.json`, keeping the scaffold's own:

| Script     | Vite+ variants  | `vanilla js`              |
| ---------- | --------------- | ------------------------- |
| `lint`     | `vp lint`       | `oxlint`                  |
| `lint:fix` | `vp lint --fix` | `oxlint --fix`            |
| `format`   | `vp fmt`        | `oxfmt`                   |
| `check`    | `vp check`      | `oxfmt --check && oxlint` |

**f. Astro only: type check on build.** TS builds of vanilla and React already type check.

```sh
pnpm add -D @astrojs/check typescript@^6
```

Then set `"build": "astro check && astro build"`. Keep TypeScript on 6: `astro check` refuses TypeScript 7.

## 4. Verify

```sh
pnpm install && pnpm format && pnpm build && pnpm run check
```

If a step fails, fix the cause and rerun the whole line. Never report success while a step fails.

Don't run `git init` or commit: the user sets up the repository.

## 5. Report

Confirm before reporting:

- [ ] format config has `useTabs: true`, `singleQuote: true`, `sortPackageJson: false` (`fmt` in the Vite config, or `.oxfmtrc.json`)
- [ ] Lightning CSS is set (Astro: in `astro.config.mjs`)
- [ ] `@/*` is in the tsconfig `paths` (TS variants and Astro)
- [ ] the three stylesheets are in the CSS dir and `index.css` is imported first
- [ ] `lint`, `lint:fix`, `format` and `check` scripts exist
- [ ] the verify line passed

Tell the user what was created and the next steps: `cd <name>` and `pnpm dev`.

## Extras

If the user asks for more (e.g. "react with Tailwind"), finish and verify the base first, then add the extra from its official docs and rerun the verify line.

## Rules

- Configure only what differs from a tool's defaults.
- Versions come from the scaffold or `pnpm add`. Don't pin one unless a step says to.
- CSS goes through Lightning CSS. No PostCSS, Autoprefixer or browserslist.
