# Mercurian Studio Claude Marketplace

Subagent marketplace for Claude Code.

## Included Subagent

- **non-technical-builder-guide** — Patient technical guide for non-technical users building apps, integrating products, and navigating technical concepts.

## What This Agent Does

`non-technical-builder-guide` is a practical support agent for people without a software engineering background.

- Explains technical concepts (APIs, tokens, credentials, integrations) in plain language
- Starts with research-first guidance before recommending custom code
- Asks focused clarification questions before making changes
- Defaults to safe, read-only investigation unless changes are explicitly confirmed
- Emphasizes security, privacy, and least-privilege handling of secrets
- Provides step-by-step execution guidance with clear milestones

## Install

Copy the agent file into your Claude Code agents directory:

```bash
cp agents/non-technical-builder-guide.md ~/.claude/agents/non-technical-builder-guide.md
```

Then use it as a subagent via the Agent tool with `subagent_type: "non-technical-builder-guide"`.

## Validate

```bash
npm test
```

## Structure

```text
agents/
  non-technical-builder-guide.md
marketplace.json
scripts/
  validate-buildwithclaude-readiness.js
```

## Adding a New Subagent

1. Create a new `.md` file in `agents/` with frontmatter (`name`, `description`, `category`)
2. Add an entry to `marketplace.json` under `agents`
3. Run `npm test` to validate

## License

MIT
