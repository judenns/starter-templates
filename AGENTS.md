Notes for agents working ON this repo. To create a project, follow SKILL.md.

Repo = Agent Skill (agentskills.io/specification) named `starter`; root is the skill folder, symlinked as `~/.claude/skills/starter` or `~/.agents/skills/starter`.
Skill runs `pnpm create vite-plus ...` then applies `overlay/`. Exceptions: vanilla js (`pnpm create vite`) and astro (`pnpm create astro`; Vite+ breaks it) skip Vite+, oxlint/oxfmt added directly. Scaffold supplies all project files; repo ships config only.

Layout:
- SKILL.md: workflow the agent follows. Frontmatter `name` must stay `starter`.
- overlay/vite-plus/vite.config.ts: blocks merged into scaffold's Vite+ config (fmt, resolve, css).
- overlay/vanilla-js/, overlay/astro/: copied as-is (oxfmtrc.json -> .oxfmtrc.json; astro.config.mjs replaces the scaffold's empty one).
- overlay/css/: reset.css, global.css, index.css (imports both into @layer base).
- overlay/gitignore: lines appended to project .gitignore (no dot so it doesn't apply here).
- commands/starter.md: /starter command for OpenCode.
- README.md: minimal, human-facing.

Rules:
- SKILL.md agent-neutral: plain shell + file edits, no agent-specific tool names. Frontmatter: Agent Skills fields (name, description, license, compatibility, allowed-tools). allowed-tools pre-approves everything the skill runs (pnpm, node -v, file read/edit/write). Overlay files are copied by read + write, never shell cp: the skill folder is outside the project, so shell access to it prompts. User ask rules (e.g. `Bash(pnpm add:*)`) override allowed-tools. Extra fields (argument-hint) fine.
- SKILL.md < 500 lines; long material goes in a file referenced by relative path.
- SKILL.md/AGENTS.md are for LLMs: terse, no decorative formatting.
- Configure only what differs from tool defaults. Don't repeat what the scaffold sets (vp scripts, type-aware lint, Vite+ catalog/overrides).
- No hand-pinned versions. Only exception: `typescript@^6` for Astro (`astro check` refuses TS 7; create-vite pins 6 too). Remove once astro check supports 7 or Astro replaces it.
- CSS via Vite's built-in Lightning CSS (`css.transformer: 'lightningcss'`, `drafts.customMedia`). No PostCSS, no browserslist.
- Shipped code style: tabs, width 100, single quotes, semicolons.

Adding a template: add its `pnpm create vite-plus <template> ... -- <options>` command to SKILL.md section 2, a row to the section 3 table, and any template-specific step to section 3.

Verifying a change: in a temp dir, run the skill for vanilla ts, vanilla js, react ts, react js, astro. Each must pass `pnpm install && pnpm format && pnpm build && pnpm run check`, reset CSS present in build output, `@/` import resolving (TS variants + astro). Upstream scaffolds drift: re-run after changing the skill and whenever a create command's output changes.
