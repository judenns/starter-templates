# Starter Templates

Monorepo with shared configs for frontend templates.

## Quick Start

```bash
# Clone template
npx degit user/starter-templates#vanilla-js my-app
npx degit user/starter-templates#react-js my-app

# Then
cd my-app && pnpm install && pnpm dev
```

## Templates

| Template | Branch | Stack |
|----------|--------|-------|
| Vanilla JS | `vanilla-js` | Vite + JS |
| React JS | `react-js` | Vite + React |

## Shared Configs

All configs auto-sync to template branches on push to main.

| Config | File | Purpose |
|--------|------|---------|
| Linting | `biome.json` | JS/TS/JSON lint + format |
| Formatting | `.prettierrc.json` | HTML/CSS formatting |
| PostCSS | `postcss.config.js` | Nesting, autoprefixer, cssnano |
| Vite | `packages/vite-config/` | Build config with path alias |
| CSS | `packages/shared-css/` | Reset + global styles |

**Settings**: Tabs · 100 width · Single quotes · Semicolons

## Structure

```
├── packages/
│   ├── shared-css/       # Shared styles
│   └── vite-config/      # Base Vite config
├── templates/
│   ├── vanilla-js/       # → Branch: vanilla-js
│   └── react-js/         # → Branch: react-js
└── .github/workflows/    # Auto-publish on push
```

## Development

```bash
pnpm install              # Install deps
pnpm dev                  # Run all templates
pnpm create-project vanilla-js my-app  # Create standalone
```

## Add New Template

1. `cp -r templates/vanilla-js templates/new-template`
2. Update `package.json` name and deps
3. Add to `.github/workflows/publish-templates.yml` matrix
4. Push → auto-creates branch
