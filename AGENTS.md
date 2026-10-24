# AGENTS.md

Notes for agents working **on this repo**. To create a project, follow `SKILL.md`.

## What This Is

An [Agent Skill](https://agentskills.io/specification) named `starter`. The repo root is the skill folder. It gets linked into an agent's skills directory as `starter` (`~/.claude/skills/starter` or `~/.agents/skills/starter`).

The skill runs the official create command through Vite+ (`pnpm create vite-plus …`), then applies `overlay/` on top. The scaffold supplies every project file, so this repo ships configuration only.

```
SKILL.md              # The workflow the agent follows. Frontmatter `name` must stay `starter`
overlay/
├── vite.config.ts    # Blocks merged into the scaffold's config (fmt, resolve, css)
├── css/              # reset.css, global.css, index.css (imports both)
└── gitignore         # Lines appended to the project's .gitignore (no dot, so it doesn't apply here)
README.md             # For people installing and using the skill
```

## Rules

- Keep `SKILL.md` agent-neutral: plain shell commands and file edits, no tool names specific to one agent. Frontmatter uses the Agent Skills fields (`name`, `description`, `license`, `compatibility`). Extra fields such as `argument-hint` are fine, since other agents ignore them.
- Keep `SKILL.md` under 500 lines. Put long material in a file it references by relative path.
- Configure only what differs from a tool's defaults. If the scaffold already sets something (`vp` scripts, type-aware lint, the Vite+ catalog and overrides), don't repeat it in the overlay.
- Don't hand-pin versions. The one exception is `typescript@^6` for Astro: `astro check` refuses TypeScript 7, and create-vite also pins 6. Remove the pin once `astro check` supports 7, or once Astro replaces it.
- CSS goes through Vite's built-in Lightning CSS (`css.transformer: 'lightningcss'`, `drafts.customMedia`). No PostCSS and no browserslist.
- Code style for the files we ship: tabs, line width 100, single quotes, semicolons.

## Adding a Template

Add a row to the Scaffold table in `SKILL.md`, with its `pnpm create vite-plus <template> … -- <options>` command and CSS dir. Then add any step that's specific to it (where Vite config goes, where to import the CSS) to section 3.

## Verifying a Change

Run the skill for every template in a temporary directory: `vanilla` + `js` and `ts`, `react` + `js` and `ts`, and `astro`. Each one must pass `pnpm install && pnpm format && pnpm build && pnpm run check`, with the reset CSS in the build output and an `@/` import resolving (where a tsconfig exists). Upstream scaffolds change over time, so re-run this after changing the skill and whenever a create command's output changes.
