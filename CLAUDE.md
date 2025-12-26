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
pnpm ci                   # CI mode check (Biome)

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
- GitHub Action auto-publishes each template to its own branch on push to main

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
