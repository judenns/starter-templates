# Starter Templates

Monorepo chứa các frontend templates với shared configs.

## Quick Start - Tạo project mới

```bash
# Vanilla JS
npx degit your-username/starter-templates#vanilla-js my-project

# React JS
npx degit your-username/starter-templates#react-js my-project

# Sau đó
cd my-project
pnpm install
pnpm dev
```

> Thay `your-username` bằng GitHub username của bạn.

### Local Development (trong monorepo)

```bash
# Tạo standalone project từ template
pnpm create-project vanilla-js my-project
pnpm create-project react-js my-project
```

## Available Templates

| Template | Branch | Command |
|----------|--------|---------|
| Vanilla JS | `vanilla-js` | `npx degit user/starter-templates#vanilla-js my-app` |
| React JS | `react-js` | `npx degit user/starter-templates#react-js my-app` |

## Cách hoạt động

```
starter-templates/
├── packages/
│   ├── shared-css/       # CSS dùng chung (reset, global)
│   └── vite-config/      # Base Vite config
│
├── templates/
│   ├── vanilla-js/       # → Branch: vanilla-js
│   └── react-js/         # → Branch: react-js
│
└── .github/workflows/    # Auto-publish khi push
```

- **Shared configs**: `biome.json`, `postcss.config.js`, `.prettierrc.json` ở root
- **Templates extend** từ shared configs
- **GitHub Actions** tự động build standalone versions và publish lên branches riêng

## Development

### Làm việc trong monorepo

```bash
# Install dependencies
pnpm install

# Chạy tất cả templates
pnpm dev

# Chạy 1 template cụ thể
cd templates/vanilla-js && pnpm dev
```

### Sửa shared config

1. Sửa file ở root (biome.json, postcss.config.js, etc.)
2. Push lên main
3. GitHub Actions tự động update tất cả template branches

### Thêm template mới

1. Copy folder từ template có sẵn:
   ```bash
   cp -r templates/vanilla-js templates/astro
   ```

2. Update `package.json`:
   - Đổi name: `@starter/astro`
   - Thêm dependencies framework-specific

3. Update `.github/workflows/publish-templates.yml`:
   ```yaml
   matrix:
     template: [vanilla-js, react-js, astro]  # Thêm vào đây
   ```

4. Push → GitHub Actions tự động tạo branch `astro`

## Tech Stack

- **Build**: Vite 7
- **Linting**: Biome 2
- **CSS**: PostCSS (nesting, custom media queries, autoprefixer)
- **Formatting**: Biome (JS/TS) + Prettier (HTML/CSS)
