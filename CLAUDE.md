# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A monorepo providing reusable frontend starter templates. Scaffold via `pnpm create @judenns/starter` or `degit`.

**Templates:** `vanilla` (Vite + TS), `react` (Vite + React 19 + TS), `astro` (Astro + TS)
**Toolchains:** `biome` (Biome + Prettier), `vite-plus` (Vite+: Oxlint + Oxfmt via `vp`)

Every template × toolchain combination is published as its own branch: `<template>-<toolchain>`.

## Essential Commands

```bash
# Development
pnpm install              # Install all dependencies
pnpm dev                  # Run dev servers for all templates in parallel
pnpm build                # Type check + build all templates
pnpm typecheck            # Type check all templates

# Linting & Formatting (the monorepo itself uses the biome toolchain)
pnpm lint                 # Lint with Biome
pnpm lint:fix             # Auto-fix lint issues
pnpm format               # Format with Biome (JS/TS/JSON) + Prettier (HTML/CSS/Astro)
pnpm run check            # CI check: Biome + Prettier

# Create standalone project (for testing)
pnpm create-project <template> <toolchain> <output-dir>
```

## Architecture

```
templates.json           # Single list of templates + toolchains (CLI, CI matrix, create-project)

packages/
├── create-starter/      # @judenns/create-starter CLI (fetches templates.json at run time)
└── shared-css/          # @starter/shared-css - reset.css, global.css

templates/               # Framework + TS only, no lint/format config
├── vanilla/
├── react/
└── astro/

toolchains/              # Lint/format layer applied on top of a template
├── biome/               # files/ (biome.json, .prettierrc.json) + package.patch.json
│   └── astro/           # Extra layer for biome × astro (prettier-plugin-astro)
└── vite-plus/           # files/ (pnpm-workspace.yaml) + package.patch.json + vite.config.ts

scripts/
└── create-project.js    # template + toolchain layers + shared CSS → standalone project
```

**Key patterns:**

- Templates use `workspace:*` for @starter packages and `catalog:` for shared versions (`pnpm-workspace.yaml`)
- A toolchain layer is `toolchains/<toolchain>/` then `toolchains/<toolchain>/<template>/` (if it exists): `files/` is copied into the project, `package.patch.json` is deep-merged into `package.json`
- Both toolchains expose the same scripts: `lint`, `lint:fix`, `format`, `check`
- `vite-plus` is applied with code in `create-project.js`: `vite …` scripts become `vp …`, and `toolchains/vite-plus/vite.config.ts` (fmt/lint config) is merged into the template's `vite.config.ts` (or copied as-is when the template has none, e.g. Astro). Template `vite.config.ts` must have exactly one `from 'vite';` and one `export default defineConfig({`
- `@/` alias comes from tsconfig `paths` (Vite: `resolve.tsconfigPaths: true`)
- Adding to `templates.json` adds the template/toolchain to the CLI, the CI matrix and `create-project`
- GitHub Action verifies the monorepo, then generates, installs, builds and checks every combination before publishing its branch
- Root `biome.json` extends `toolchains/biome/files/biome.json`; it must force-ignore (`!!`) that file, or Biome reports a nested root config. Root Prettier config is `toolchains/biome/astro/files/.prettierrc.json` (via `package.json` `"prettier"`)
- CSS goes through Vite's built-in Lightning CSS (`css.transformer: 'lightningcss'`, `drafts.customMedia`): no PostCSS, no browserslist — JS and CSS both use Vite's default `baseline-widely-available` target
- Configure only what differs from a tool's defaults (e.g. `toolchains/vite-plus/vite.config.ts` sets just style + type-aware lint); Biome `$schema` points at `node_modules` so it never needs a version bump
- Keep dependency ranges at major level (`^8.0.0`): pnpm 12's `minimumReleaseAge` (24h) rejects ranges whose floor is a just-published version
- TypeScript stays on 6.x: `@astrojs/check` peer-depends on `^5 || ^6` (create-vite also pins 6.x)

## Code Style

- **Indentation:** Tabs
- **Line width:** 100
- **Quotes:** Single
- **Semicolons:** Always
- Biome handles JS/TS/JSX/TSX/JSON; Prettier handles HTML/CSS/Astro

## Adding a New Template

1. Create `templates/<name>/` with `package.json` (incl. `typecheck` script, `build` that type checks), `tsconfig.json`, `src/`
2. Use `@starter/shared-css` as a workspace dependency, import it from the template's CSS entry
3. Add it to `templates.json` with its `cssDir`
4. If a toolchain needs extras for it, add `toolchains/<toolchain>/<name>/`
5. Verify every combination: `pnpm create-project <name> <toolchain> <dir>`, then `pnpm install && pnpm build && pnpm run check` in it

## Releasing

1. Merge to `main` → CI regenerates and publishes every `<template>-<toolchain>` branch. Template changes need no CLI release.
2. Only if `packages/create-starter/` changed: bump its version, then from the repo root
   `npm publish ./packages/create-starter --access public` (add `--otp=<code>` with 2FA).
3. **Never delete or rename a template branch the same day as a CLI release.** pnpm 12 skips packages younger than 24h, so `pnpm create @judenns/starter` keeps running the _previous_ CLI for a day — its branches must still exist. Remove old branches after 24h.

## Updating Dependencies

- Shared versions live in the `catalog` of `pnpm-workspace.yaml`; Vite+ versions in `toolchains/vite-plus/package.patch.json` **and** `toolchains/vite-plus/files/pnpm-workspace.yaml` (keep in sync)
- Configure only what differs from a tool's defaults

## User-Facing Docs

`README.md` is for people using a generated project only (quick start, commands, editor setup). Keep maintainer details here, not in the README.
