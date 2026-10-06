# Starter Templates

Monorepo with shared configs for frontend templates.

## Quick Start

```bash
# Interactive (recommended)
pnpm create @judenns/starter

# Or direct
pnpm create @judenns/starter react my-app
pnpm create @judenns/starter vanilla my-app

# Or degit
npx degit judenns/starter-templates#react-js my-app
```

## Templates

| Template   | Branch       | Stack               |
| ---------- | ------------ | ------------------- |
| Vanilla JS | `vanilla-js` | Vite 8 + JS         |
| React JS   | `react-js`   | Vite 8 + React 19.3 |

**Requires**: Node.js ≥ 22.12 · pnpm ≥ 10

## Shared Configs

All configs auto-sync to template branches on push to main. The workflow lints and builds everything first,
and only publishes if every template (monorepo and standalone) builds.

| Config     | File                    | Purpose                        |
| ---------- | ----------------------- | ------------------------------ |
| Linting    | `biome.json`            | Biome 2.5 - JS/TS/JSON lint    |
| Formatting | `.prettierrc.json`      | Prettier 3.9 - HTML/CSS        |
| PostCSS    | `postcss.config.js`     | Nesting, autoprefixer, cssnano |
| Vite       | `packages/vite-config/` | Path alias, no prod sourcemaps |
| CSS        | `packages/shared-css/`  | Reset + global styles          |

**Settings**: Tabs · 100 width · Single quotes · Semicolons

## Structure

```
├── packages/
│   ├── create-starter/   # CLI (npm: @judenns/create-starter)
│   ├── shared-css/       # Shared styles
│   └── vite-config/      # Base Vite config
├── templates/
│   ├── vanilla-js/       # → Branch: vanilla-js
│   └── react-js/         # → Branch: react-js
└── .github/workflows/    # Verify + auto-publish on push
```

## Development

```bash
pnpm install              # Install deps
pnpm dev                  # Run all templates
pnpm build                # Build all templates
pnpm lint                 # Lint with Biome
pnpm format               # Format with Biome + Prettier
pnpm run ci               # CI check (`pnpm ci` is a pnpm built-in)
pnpm create-project vanilla-js my-app  # Dev only, users use: pnpm create @judenns/starter
```

## Add New Template

1. `cp -r templates/vanilla-js templates/new-template`
2. Update `package.json` name and deps (shared versions live in the `pnpm-workspace.yaml` catalog)
3. Keep the template's `biome.json` as a nested config: `{ "root": false, "extends": "//" }`
4. Add to `.github/workflows/publish-templates.yml` matrix
5. Push → auto-creates branch

## Publish the CLI

Template branches update automatically, but the `@judenns/create-starter` npm package does not.
Publish it manually when `packages/create-starter/` changes:

```bash
# 1. Bump "version" in packages/create-starter/package.json, then commit
# 2. Publish from the repo root (the root package.json is private on purpose)
npm publish ./packages/create-starter --access public   # add --otp=<code> if 2FA is on
npm view @judenns/create-starter version                 # verify
```

## License

MIT License
