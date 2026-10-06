# Starter Templates

Ready-to-code frontend starters (Vanilla JS or React) with linting, formatting, modern CSS, and a
production build already set up. Create a project, run `pnpm dev`, start writing code.

## Quick Start

**Requires:** Node.js ≥ 22.12 and [pnpm](https://pnpm.io/installation).

```bash
pnpm create @judenns/starter              # pick a template interactively
# or
pnpm create @judenns/starter react my-app
pnpm create @judenns/starter vanilla my-app

cd my-app
pnpm install
pnpm dev                                  # open the URL it prints
```

Alternative without the CLI: `npx degit judenns/starter-templates#react-js my-app`

| Template | Stack               | Branch       |
| -------- | ------------------- | ------------ |
| Vanilla  | Vite 8 + JavaScript | `vanilla-js` |
| React    | Vite 8 + React 19   | `react-js`   |

---

## Using a Generated Project

### Commands

| Command          | What it does                                           |
| ---------------- | ------------------------------------------------------ |
| `pnpm dev`       | Start the dev server with instant reload               |
| `pnpm build`     | Build an optimized production version into `dist/`     |
| `pnpm preview`   | Serve `dist/` locally to check the production build    |
| `pnpm lint`      | Find code problems in `src/` (Biome)                   |
| `pnpm lint:fix`  | Fix the problems that can be fixed automatically       |
| `pnpm format`    | Format JS/JSON (Biome) and HTML/CSS (Prettier)         |
| `pnpm run ci`    | Lint + format check that fails on any issue (for CI)   |
| `pnpm clean`     | Delete `dist/`                                         |
| `pnpm reinstall` | Delete `node_modules`, lockfile and `dist/`, reinstall |

### Files

```
my-app/
├── index.html            # Entry page — Vite starts here
├── src/
│   ├── main.jsx          # React entry (Vanilla: js/main.js) — imports the CSS
│   ├── components/       # React components (React only)
│   └── css/
│       ├── index.css     # Your main stylesheet — imports reset + global
│       ├── reset.css     # Removes inconsistent browser default styles
│       └── global.css    # Base styles: body, focus outlines, .sr-only, font snippet
├── public/               # Copied as-is (favicon, robots.txt…), served from "/"
├── vite.config.js        # Dev server + build settings
├── postcss.config.js     # CSS processing
├── biome.json            # Lint + JS/JSON format rules
├── .prettierrc.json      # HTML/CSS format rules
└── package.json          # Scripts, dependencies, supported browsers ("browserslist")
```

### The Tools, Explained

#### Vite — dev server and bundler

Runs your code in the browser while you work (`pnpm dev`) and bundles it for production
(`pnpm build`). What `vite.config.js` sets up:

- **`@` alias for `src/`** — write `import Button from '@/components/Button'` instead of
  `'../../components/Button'`.
- **Browser target** — Baseline Widely Available (Chrome/Edge 111, Firefox 114, Safari 16.4).
  Newer JS syntax is converted for those browsers automatically.
- **No production source maps** — your original source code isn't shipped in `dist/`.
- **Vite's CSS minifier is off** — cssnano (below) minifies CSS instead.
- **React only:** `@vitejs/plugin-react` adds JSX and Fast Refresh (edit a component, its state
  is kept).

#### PostCSS — CSS processing

Every CSS file goes through these plugins (`postcss.config.js`):

| Plugin               | When         | What it does for you                                                     |
| -------------------- | ------------ | ------------------------------------------------------------------------ |
| `postcss-preset-env` | dev + build  | Converts modern CSS for the target browsers and adds `-webkit-` prefixes |
| `cssnano`            | `build` only | Minifies the final CSS                                                   |

So you can write modern CSS like this, and it works in every supported browser:

```css
@custom-media --mobile (width < 768px);

.card {
	user-select: none; /* -webkit- prefix added for you */

	& .title {
		/* nesting */
		font-size: 1.5rem;
	}

	@media (--mobile) {
		/* reusable media query */
		padding: 1rem;
	}
}
```

`@import './other.css';` works too — Vite inlines it into one file.

#### Browserslist — which browsers you support

The `browserslist` field in `package.json` tells the CSS tools which browsers to support:

```json
"browserslist": ["baseline widely available on 2026-01-01"]
```

It matches Vite's JS target exactly, so your JS and CSS support the same browsers. Run
`pnpm dlx browserslist` to see the full list.

#### Biome — linter + JS formatter

Catches bugs and bad patterns in JS/JSX (`pnpm lint`) and formats JS/JSON (`pnpm format`). Rules
are in `biome.json`. Install the
[Biome editor extension](https://biomejs.dev/guides/editors/first-party-extensions/) to see issues
as you type and format on save.

#### Prettier — HTML/CSS formatter

Formats HTML and CSS (`pnpm format`), which Biome doesn't cover here. Rules are in
`.prettierrc.json`.

**Shared code style:** tabs · 100-character lines · single quotes · semicolons.

#### Shared CSS

- **`reset.css`** — removes inconsistent browser defaults (margins, list bullets, `box-sizing`,
  images overflowing their container…).
- **`global.css`** — base body text, visible keyboard focus outlines, a `.sr-only` class (hidden
  on screen but still read by screen readers), and a commented-out `@font-face` snippet.

### Common Tasks

| I want to…             | Do this                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------- |
| Add a stylesheet       | Create `src/css/x.css`, add `@import './x.css';` to `src/css/index.css`            |
| Use a custom font      | Put the `.woff2` in `public/fonts/`, uncomment `@font-face` in `global.css`        |
| Change browser support | Change `browserslist` in `package.json` **and** `build.target` in `vite.config.js` |
| Use env variables      | Add `VITE_API_URL=…` to `.env.local`, read it with `import.meta.env.VITE_API_URL`  |
| Deploy                 | Run `pnpm build`, upload the `dist/` folder to any static host                     |

---

## Maintaining This Repo

### How It Works

1. Templates live in `templates/` and share code from `packages/` plus the root configs.
2. On every push to `main`, GitHub Actions:
   - **verify** — lints and builds every template in the monorepo.
   - **publish** (one job per template) — runs `scripts/create-project.js` to turn the template
     into a standalone project (shared CSS copied in, Vite base config inlined, catalog versions
     resolved), installs/builds/lints a copy of it, then pushes it to the template's branch.
3. `pnpm create @judenns/starter` downloads that branch at run time.

If any step fails, nothing is published. Template changes reach users on the next push — no CLI
release needed.

### Structure

```
├── packages/
│   ├── create-starter/   # The CLI (npm: @judenns/create-starter)
│   ├── shared-css/       # reset.css + global.css, copied into each template
│   └── vite-config/      # createBaseConfig(), inlined into each template's vite.config.js
├── templates/
│   ├── vanilla-js/       # → branch: vanilla-js
│   └── react-js/         # → branch: react-js
├── scripts/
│   └── create-project.js # Builds a standalone project from a template
├── pnpm-workspace.yaml   # Workspace + shared dependency versions ("catalog")
└── .github/workflows/    # Verify + publish on push
```

### Commands

```bash
pnpm install                          # Install everything
pnpm dev                              # Run all templates
pnpm build                            # Build all templates
pnpm lint                             # Lint with Biome
pnpm format                           # Format with Biome + Prettier
pnpm run ci                           # CI check (`pnpm ci` is a pnpm built-in, not this script)
pnpm create-project vanilla-js my-app # Preview exactly what users get
```

### Updating Dependencies

- **Shared versions** (vite, postcss, cssnano…) live in the `catalog` in `pnpm-workspace.yaml`.
  Templates reference them with `"catalog:"`.
- **Keep ranges at the major level** (`^8.0.0`, not `^8.3.3`). pnpm 11+ refuses packages published
  less than 24 hours ago, so a range starting at a brand-new release breaks installs for a day.
- **New Vite major?** Update the date in `browserslist` (root `package.json`) to match Vite's new
  `baseline-widely-available` target (listed in Vite's migration guide).

### Add a New Template

1. `cp -r templates/vanilla-js templates/new-template`
2. Update `package.json` name and deps (use `"catalog:"` for shared versions)
3. Keep its `biome.json` as a nested config: `{ "root": false, "extends": "//" }`
4. Add it to the matrix in `.github/workflows/publish-templates.yml`
5. Push → the branch is created automatically

### Publish the CLI

Template branches update automatically, but the `@judenns/create-starter` npm package does not.
Publish it manually when `packages/create-starter/` changes:

```bash
# 1. Bump "version" in packages/create-starter/package.json, then commit
# 2. Publish from the repo root (the root package.json is private on purpose)
npm publish ./packages/create-starter --access public   # add --otp=<code> if 2FA is on
npm view @judenns/create-starter version                 # verify
```

## License

MIT
