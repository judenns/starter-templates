# Starter Templates

TypeScript starters for Vanilla, React or Astro — linting, formatting, modern CSS and a production
build ready to go.

## Quick Start

Requires Node.js ≥ 22.12 and [pnpm](https://pnpm.io/installation).

```bash
pnpm create @judenns/starter    # pick a template, a toolchain and a name
cd my-app
pnpm install
pnpm dev
```

| Template  | Stack                          |
| --------- | ------------------------------ |
| `vanilla` | Vite 8 + TypeScript            |
| `react`   | Vite 8 + React 19 + TypeScript |
| `astro`   | Astro 7 + TypeScript           |

| Toolchain   | Lint + format                                        |
| ----------- | ---------------------------------------------------- |
| `biome`     | Biome + Prettier — the safe default                  |
| `vite-plus` | Vite+ (Oxlint + Oxfmt) — doesn't format `.astro` yet |

## Commands

| Command          | What it does                             |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Start the dev server                     |
| `pnpm format`    | Format all files                         |
| `pnpm lint:fix`  | Fix lint problems automatically          |
| `pnpm run check` | Check format + lint (run before pushing) |
| `pnpm build`     | Type check and build into `dist/`        |
| `pnpm preview`   | Preview the production build             |

To deploy, run `pnpm build` and upload `dist/` to any static host.

## Editor Setup

Turn on format on save so you rarely need the commands above.

- **`biome`:** install the [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
  and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  extensions, then add `.vscode/settings.json`:

  ```json
  {
  	"editor.formatOnSave": true,
  	"editor.defaultFormatter": "esbenp.prettier-vscode",
  	"[javascript][javascriptreact][typescript][typescriptreact][json][jsonc]": {
  		"editor.defaultFormatter": "biomejs.biome"
  	},
  	"editor.codeActionsOnSave": {
  		"source.organizeImports.biome": "explicit",
  		"source.fixAll.biome": "explicit"
  	}
  }
  ```

- **`vite-plus`:** install the
  [Vite Plus Extension Pack](https://marketplace.visualstudio.com/items?itemName=VoidZero.vite-plus-extension-pack)
  and follow the [Vite+ IDE guide](https://viteplus.dev/guide/ide-integration).

## Good to Know

- **`@/` alias:** `import Button from '@/components/Button'` points to `src/`.
- **CSS:** write nesting and `@custom-media` freely; prefixes and minifying are automatic.
  Add a stylesheet with `@import './x.css';` in `index.css`.
- **Env variables:** put `VITE_API_URL=…` in `.env.local` and read `import.meta.env.VITE_API_URL`.
- **Browsers:** Chrome/Edge 111+, Firefox 114+, Safari 16.4+.

## License

MIT
