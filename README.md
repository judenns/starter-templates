# Starter

An [Agent Skill](https://agentskills.io) that sets up a new TypeScript project for Vanilla, React or Astro. It runs the framework's official create command, then adds my defaults on top:

- **Vite+** for linting and formatting (Oxlint + Oxfmt via `vp`): tabs, single quotes, type-aware lint
- **CSS:** a reset and global styles, with Lightning CSS for nesting, `@custom-media`, prefixes and minifying
- **`@/` alias** for `src/`
- the same scripts in every project, plus a type check before each build

## Install

Clone the repo, then link it into your agent's skills folder. The folder must be named `starter`.

```bash
git clone https://github.com/judenns/starter-templates.git ~/Work/starter-templates
```

| Agent                                           | Link                                                            |
| ----------------------------------------------- | --------------------------------------------------------------- |
| Claude Code, OpenCode                           | `ln -s ~/Work/starter-templates ~/.claude/skills/starter`       |
| Codex, OpenCode, other Agent Skills tools       | `ln -s ~/Work/starter-templates ~/.agents/skills/starter`       |

OpenCode reads both folders, so link only one of them. Otherwise it finds two skills with the same name. Run `git pull` in the repo to update the skill.

**Agents without skill support:** point the agent at the file, for example "Follow `~/Work/starter-templates/SKILL.md` to create a React project called my-app."

Requires Node.js ≥ 22.12 and [pnpm](https://pnpm.io/installation).

## Use

Ask in plain words, or call the skill directly where your agent supports it:

```text
/starter react my-app
Create an Astro site called blog
Start a vanilla TypeScript project named playground, with Tailwind
```

| Template  | Created with                                    |
| --------- | ----------------------------------------------- |
| `vanilla` | `create-vite` (`vanilla-ts`) through Vite+      |
| `react`   | `create-vite` (`react-ts`) through Vite+        |
| `astro`   | `create-astro` (`minimal`) through Vite+        |

The agent checks that the project installs, builds and passes lint and format, then makes the first commit.

## In the Generated Project

| Command          | What it does                             |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Start the dev server                     |
| `pnpm format`    | Format all files                         |
| `pnpm lint:fix`  | Fix lint problems automatically          |
| `pnpm run check` | Check format + lint (run before pushing) |
| `pnpm build`     | Type check and build into `dist/`        |
| `pnpm preview`   | Preview the production build             |

- **`@/` alias:** `import Button from '@/components/Button'` points to `src/`.
- **CSS:** write nesting and `@custom-media` freely. Add a stylesheet with `@import './x.css';` in `index.css`.
- **Editor:** install the [Vite Plus Extension Pack](https://marketplace.visualstudio.com/items?itemName=VoidZero.vite-plus-extension-pack) and follow the [Vite+ IDE guide](https://viteplus.dev/guide/ide-integration) for format on save.
- **Deploy:** run `pnpm build` and upload `dist/` to any static host.

## License

MIT
