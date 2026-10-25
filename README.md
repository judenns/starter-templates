# Starter

An [Agent Skill](https://agentskills.io) that scaffolds a Vanilla, React or Astro project (JS or TS) with the official create command, then adds Oxlint + Oxfmt, a CSS reset, Lightning CSS and an `@/` alias.

## Install

Requires Node.js 22.23.4+ or 24.11+ and [pnpm](https://pnpm.io/installation).

```bash
git clone https://github.com/judenns/starter-templates.git ~/Work/starter-templates
ln -s ~/Work/starter-templates ~/.claude/skills/starter   # Claude Code
ln -s ~/Work/starter-templates ~/.agents/skills/starter   # Codex and other Agent Skills tools
```

Link only one for OpenCode, since it reads both folders. Run `git pull` in the repo to update the skill.

## Use

```text
/starter react my-app
/starter vanilla js playground
Create an Astro site called blog
```

Language defaults to `ts`. The agent verifies the project builds and passes lint and format. It leaves `git init` to you.

## License

MIT
