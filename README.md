# Starter Templates

TypeScript frontend starters — Vanilla, React or Astro — with linting, formatting, modern CSS and
a production build ready to go.

## Quick Start

**Requires:** Node.js ≥ 22.12 and [pnpm](https://pnpm.io/installation).

```bash
pnpm create @judenns/starter        # asks for template, toolchain and name
cd my-app
pnpm install
pnpm dev                            # open the URL it prints
```

Skip the questions: `pnpm create @judenns/starter react my-app --toolchain biome`

| Template  | Stack                          |
| --------- | ------------------------------ |
| `vanilla` | Vite 8 + TypeScript            |
| `react`   | Vite 8 + React 19 + TypeScript |
| `astro`   | Astro 7 + TypeScript           |

| Toolchain   | Lint                    | Format                                        |
| ----------- | ----------------------- | --------------------------------------------- |
| `biome`     | Biome                   | Biome (JS/TS/JSON), Prettier (HTML/CSS/Astro) |
| `vite-plus` | Oxlint, type-aware (vp) | Oxfmt (vp) — doesn't format `.astro` yet      |

Not sure? Pick `biome` — it's the most mature. Both use the same commands.

---

## Working in a Project

### 1. Set up your editor (once)

Format on save and inline lint errors make the rest automatic.

**`biome` toolchain** — install [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) (+
[Astro](https://marketplace.visualstudio.com/items?itemName=astro-build.astro-vscode) for Astro),
then add `.vscode/settings.json`:

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

**`vite-plus` toolchain** — install the
[Vite Plus Extension Pack](https://marketplace.visualstudio.com/items?itemName=VoidZero.vite-plus-extension-pack)
and add the settings from the [Vite+ IDE guide](https://viteplus.dev/guide/ide-integration).

### 2. Day to day

| Command          | What it does                                           |
| ---------------- | ------------------------------------------------------ |
| `pnpm dev`       | Dev server with instant reload                         |
| `pnpm lint:fix`  | Fix lint problems that can be fixed automatically      |
| `pnpm format`    | Format every file                                      |
| `pnpm typecheck` | Type check only                                        |
| `pnpm run check` | Fail on any format/lint issue — run before committing  |
| `pnpm build`     | Type check, then build into `dist/`                    |
| `pnpm preview`   | Serve `dist/` to check the production build            |
| `pnpm reinstall` | Delete `node_modules`, lockfile and `dist/`, reinstall |

### 3. Before you push

```bash
pnpm format && pnpm run check && pnpm build
```

Put `pnpm run check` and `pnpm build` in your CI too — they exit non-zero on any problem.

### 4. Deploy

`pnpm build`, then upload `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, GitHub
Pages…).

### What's Inside

```
my-app/
├── index.html          # Entry page (Vite templates)
├── src/
│   ├── main.ts         # Entry — React: main.tsx + components/, Astro: pages/ + layouts/
│   └── css/            # Astro: styles/ — index.css imports reset.css + global.css
├── public/             # Served as-is from "/"
├── vite.config.ts      # Vite settings (Astro: astro.config.ts)
├── tsconfig.json       # TypeScript + the "@/" alias
├── biome.json          # biome toolchain: lint + JS/TS/JSON format
├── .prettierrc.json    # biome toolchain: HTML/CSS/Astro format
└── pnpm-workspace.yaml # vite-plus toolchain: runs Vite through Vite+
```

- **`@/` alias** — `import Button from '@/components/Button'`. Defined in `tsconfig.json`.
- **TypeScript** — `pnpm build` fails on type errors. Astro uses `astro check`, which covers
  `.astro` files.
- **Modern CSS** — Vite's built-in [Lightning CSS](https://lightningcss.dev) handles nesting,
  `@custom-media`, `-webkit-` prefixes and minification. No PostCSS setup.
- **Browsers** — Baseline Widely Available (Chrome/Edge 111, Firefox 114, Safari 16.4).
- **Shared CSS** — `reset.css` (sane browser defaults) and `global.css` (body text, focus
  outlines, `.sr-only`, a commented `@font-face` snippet).
- **Code style** — tabs · 100-character lines · single quotes · semicolons.
- **`vite-plus` only** — lint/format rules live in the `lint` and `fmt` blocks of
  `vite.config.ts`.

### Common Tasks

| I want to…             | Do this                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| Add a stylesheet       | Create `x.css` next to `index.css`, add `@import './x.css';` to `index.css`                    |
| Use a custom font      | Put the `.woff2` in `public/fonts/`, uncomment `@font-face` in `global.css`                    |
| Use env variables      | Add `VITE_API_URL=…` to `.env.local`, read `import.meta.env.VITE_API_URL`                      |
| Change browser support | Set `build.target` (JS) and `css.lightningcss.targets` (CSS) in `vite.config.ts`               |
| Switch to Vite+        | New project with `-t vite-plus` and move `src/` over — or [convert in place](#convert-to-vite) |

#### Convert to Vite+

1. `pnpm --package=vite-plus dlx vp migrate` — moves Vite to Vite+ and Prettier to Oxfmt.
2. Set the scripts in `package.json`: `"lint": "vp lint"`, `"lint:fix": "vp lint --fix"`,
   `"format": "vp fmt"`, `"check": "vp check"`.
3. `pnpm remove @biomejs/biome` and delete `biome.json`.
4. `pnpm format`, review the diff, update your editor setup.

---

## Maintaining This Repo

### How It Works

A generated project = **template** (`templates/`) + **toolchain** (`toolchains/`) + shared CSS
(`packages/shared-css`). `templates.json` lists them; the CLI, CI and `create-project.js` all
read it.

```
├── templates.json            # Templates + toolchains
├── templates/                # vanilla, react, astro — framework + TS, no lint config
├── toolchains/
│   ├── biome/                # files/ + package.patch.json (+ astro/ extras)
│   └── vite-plus/            # files/ + package.patch.json + vite.config.ts (fmt/lint)
├── packages/
│   ├── create-starter/       # The CLI (npm: @judenns/create-starter)
│   └── shared-css/           # reset.css + global.css
├── scripts/create-project.js # template + toolchain → standalone project
└── .github/workflows/        # Verify + publish on push to main
```

A toolchain is applied in layers: `toolchains/<toolchain>/`, then
`toolchains/<toolchain>/<template>/` if it exists — `files/` is copied, `package.patch.json` is
merged into `package.json`. `vite-plus` also renames `vite …` scripts to `vp …` and merges its
`vite.config.ts` into the template's.

On every push to `main`, CI checks and builds the monorepo, then for each template × toolchain
generates the project, installs, builds, runs `check`, and publishes it to the
`<template>-<toolchain>` branch. Nothing publishes if a step fails.

### Develop

```bash
pnpm install
pnpm dev                                   # All templates at once
pnpm format && pnpm run check && pnpm build
```

The monorepo uses the `biome` toolchain. To test exactly what users get — and the `vite-plus`
combinations — generate a project outside the repo:

```bash
pnpm create-project react vite-plus /tmp/test-app
cd /tmp/test-app && pnpm install && pnpm build && pnpm run check
```

### Add a Template

1. Copy the closest `templates/<name>/`. Keep a `typecheck` script and a `build` that type
   checks first; import `@starter/shared-css` from its CSS entry.
2. Add it to `templates.json` with `cssDir` (folder of its CSS entry).
3. Extras for one toolchain go in `toolchains/<toolchain>/<name>/` (see `biome/astro/`).
4. Test every toolchain with `pnpm create-project` (above).
5. Merge to `main` — CI creates the branches, the CLI lists it. No CLI release needed.

### Release

1. Merge to `main` and wait for CI — template branches update automatically.
2. Only if `packages/create-starter/` changed: bump its `version`, commit, then from the repo root
   `npm publish ./packages/create-starter --access public` (add `--otp=<code>` with 2FA).

### Update Dependencies

- Shared versions are in the `catalog` of `pnpm-workspace.yaml`, used via `"catalog:"`.
- Keep ranges at the major level (`^8.0.0`): pnpm refuses packages younger than 24 hours.
- Vite+ versions are in `toolchains/vite-plus/package.patch.json` and
  `toolchains/vite-plus/files/pnpm-workspace.yaml` — keep both in sync.
- Configure only what differs from a tool's defaults; fewer options break less on upgrades.

## License

MIT
