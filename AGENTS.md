# AGENTS.md

Notes for agents working **on this repo**. To create a project, follow `SKILL.md`.

## What This Is

An [Agent Skill](https://agentskills.io/specification) named `starter`. The repo root is the skill folder. It gets linked into an agent's skills directory as `starter` (`~/.claude/skills/starter` or `~/.agents/skills/starter`).

The skill runs the official create command through Vite+ (`pnpm create vite-plus …`), then applies `overlay/` on top. The exception is `vanilla js`, which uses plain Vite (`pnpm create vite`) with `oxlint` and `oxfmt` added directly. The scaffold supplies every project file, so this repo ships configuration only.

```
SKILL.md              # The workflow the agent follows. Frontmatter `name` must stay `starter`
overlay/
├── vite.config.ts    # Blocks merged into the scaffold's Vite+ config (fmt, resolve, css)
├── plain-vite/       # vanilla js only: vite.config.js and oxfmtrc.json, copied as-is
├── css/              # reset.css, global.css, index.css (imports both)
└── gitignore         # Lines appended to the project's .gitignore (no dot, so it doesn't apply here)
commands/starter.md   # /starter command for OpenCode
README.md             # Minimal: install and use
```

## Rules

- Keep `SKILL.md` agent-neutral: plain shell commands and file edits, no tool names specific to one agent. Frontmatter uses the Agent Skills fields (`name`, `description`, `license`, `compatibility`, `allowed-tools`). `allowed-tools` pre-approves the `pnpm`, `mkdir` and `cp` commands the skill runs, so agents that honour it (Claude Code) don't prompt for each one while the skill is active. Extra fields such as `argument-hint` are fine, since other agents ignore them.
- Keep `SKILL.md` under 500 lines. Put long material in a file it references by relative path.
- Configure only what differs from a tool's defaults. If the scaffold already sets something (`vp` scripts, type-aware lint, the Vite+ catalog and overrides), don't repeat it in the overlay.
- Don't hand-pin versions. The one exception is `typescript@^6` for Astro: `astro check` refuses TypeScript 7, and create-vite also pins 6. Remove the pin once `astro check` supports 7, or once Astro replaces it.
- CSS goes through Vite's built-in Lightning CSS (`css.transformer: 'lightningcss'`, `drafts.customMedia`). No PostCSS and no browserslist.
- Code style for the files we ship: tabs, line width 100, single quotes, semicolons.

## Adding a Template

Add its `pnpm create vite-plus <template> … -- <options>` command to section 2 of `SKILL.md` and a row to the variant table in section 3. Add any step specific to it to section 3.

## Verifying a Change

Run the skill for every variant in a temporary directory: `vanilla ts`, `vanilla js`, `react ts`, `react js` and `astro`. Each one must pass `pnpm install && pnpm format && pnpm build && pnpm run check`, with the reset CSS in the build output and an `@/` import resolving (TS variants and Astro). Upstream scaffolds change over time, so re-run this after changing the skill and whenever a create command's output changes.
