# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A monorepo providing reusable frontend starter templates. Scaffold via `pnpm create @judenns/starter` or `degit`.

**Current templates:** `vanilla-js`, `react-js` (Vite + React 19)

## Essential Commands

```bash
# Development
pnpm install              # Install all dependencies
pnpm dev                  # Run dev servers for all templates in parallel
pnpm build                # Build all templates

# Linting & Formatting
pnpm lint                 # Lint with Biome
pnpm lint:fix             # Auto-fix lint issues
pnpm format               # Format with Biome (JS/JSON) + Prettier (HTML/CSS)
pnpm run ci               # CI mode check (Biome) — `pnpm ci` is a pnpm built-in

# Create standalone project (for testing)
pnpm create-project <template-name> <output-dir>
```

## Architecture

```
packages/
├── create-starter/      # @judenns/create-starter CLI
├── shared-css/          # @starter/shared-css - reset.css, global.css
└── vite-config/         # @starter/vite-config - createBaseConfig()

templates/
├── vanilla-js/          # → publishes to branch: vanilla-js
└── react-js/            # → publishes to branch: react-js

scripts/
└── create-project.js    # Inlines configs, copies shared CSS, resolves versions
```

**Key patterns:**
- Templates use `workspace:*` for @starter packages
- pnpm catalog in `pnpm-workspace.yaml` for shared dependency versions
- Templates reference catalog versions via `catalog:` syntax
- GitHub Action verifies (lint + build, monorepo and standalone) then publishes each template to its own branch on push to main
- `create-project.js` generates the standalone `vite.config.js` by inlining `packages/vite-config/base.js` into the template's config — never hand-write it
- Browser targets: `browserslist` in root `package.json` (`baseline widely available on <date>`) must match Vite's `baseline-widely-available` `build.target`; update the date on a Vite major
- Keep dependency ranges at major level (`^8.0.0`): pnpm 12's `minimumReleaseAge` (24h) rejects ranges whose floor is a just-published version
- Template `biome.json` must stay nested: `{ "root": false, "extends": "//" }`

## Code Style

- **Indentation:** Tabs
- **Line width:** 100
- **Quotes:** Single
- **Semicolons:** Always
- Biome handles JS/TS/JSX/TSX/JSON; Prettier handles HTML/CSS

## Adding a New Template

1. Create `templates/<name>/` with `package.json`, `vite.config.js`, `index.html`, `src/`
2. Use `@starter/vite-config` and `@starter/shared-css` as workspace dependencies
3. Add template name to the workflow matrix in `.github/workflows/publish-templates.yml`

## Publishing the CLI

`@judenns/create-starter` is not auto-published. Bump its version, then from the repo root:
`npm publish ./packages/create-starter --access public`
