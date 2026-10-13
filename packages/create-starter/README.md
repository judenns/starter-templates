# @judenns/create-starter

Scaffold a new frontend project from [judenns/starter-templates](https://github.com/judenns/starter-templates).

## Usage

```bash
# Interactive: pick a template and a toolchain
pnpm create @judenns/starter

# Direct
pnpm create @judenns/starter react my-app --toolchain biome
pnpm create @judenns/starter astro my-site -t vite-plus
```

Then:

```bash
cd my-app
pnpm install
pnpm dev
```

## Templates

| Name      | Stack                        |
| --------- | ---------------------------- |
| `vanilla` | Vite + TypeScript            |
| `react`   | Vite + React 19 + TypeScript |
| `astro`   | Astro + TypeScript           |

## Toolchains

| Name        | Lint                      | Format                                         |
| ----------- | ------------------------- | ---------------------------------------------- |
| `biome`     | Biome                     | Biome (JS/TS/JSON) + Prettier (HTML/CSS/Astro) |
| `vite-plus` | Oxlint, type-aware (`vp`) | Oxfmt (`vp`) — doesn't format `.astro` yet     |

Every project has the same scripts whichever toolchain you pick: `lint`, `lint:fix`, `format`,
`check`.

Every template includes:

- **TypeScript** with an `@/` alias for `src/` (from `tsconfig.json` paths)
- **Lightning CSS** (built into Vite): nesting, custom media, prefixes and minification — no
  PostCSS setup
- Shared reset + global CSS
- Browser targets: Baseline Widely Available (Chrome/Edge 111, Firefox 114, Safari 16.4)

The template list and the templates themselves are fetched from the repo at run time, so you
always get the latest version without updating this CLI.

## Requirements

- Node.js ≥ 22.12
- pnpm

## License

MIT
