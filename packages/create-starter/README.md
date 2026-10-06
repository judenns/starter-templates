# @judenns/create-starter

Scaffold a new frontend project from [judenns/starter-templates](https://github.com/judenns/starter-templates).

## Usage

```bash
# Interactive
pnpm create @judenns/starter

# Direct
pnpm create @judenns/starter react my-app
pnpm create @judenns/starter vanilla my-app
```

Then:

```bash
cd my-app
pnpm install
pnpm dev
```

## Templates

| Name      | Stack               |
| --------- | ------------------- |
| `vanilla` | Vite 8 + JavaScript |
| `react`   | Vite 8 + React 19   |

Every template includes:

- **Biome** for JS/JSON linting and formatting, **Prettier** for HTML/CSS
- **PostCSS** with `postcss-preset-env` (nesting, custom media, autoprefixing) and `cssnano` for
  production
- Shared reset + global CSS
- `@` alias for `src/`
- Browser targets: Baseline Widely Available (Chrome/Edge 111, Firefox 114, Safari 16.4)

Templates are downloaded from the repo's template branches at run time, so you always get the
latest version without updating this CLI.

## Requirements

- Node.js ≥ 22.12
- pnpm (recommended), npm, or yarn

## License

MIT
