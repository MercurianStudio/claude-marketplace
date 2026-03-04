# Contributing

Thanks for contributing to this marketplace.

## Scope

This repository is structured to be compatible with Build with Claude contribution requirements for agent plugins.

Primary paths:

- `plugins/agents-specialized-domains/agents/*.md`
- `plugins/agents-specialized-domains/.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`

## Requirements

- Node.js 20+
- npm

## Local Validation

Run all checks before opening a pull request:

```bash
npm test
```

## Contribution Rules

- Keep agent filenames lowercase with hyphens.
- Agent `name` frontmatter must match filename.
- Use a valid agent `category`.
- Start agent body with `You are a...`.
- Keep trigger descriptions clear and specific.
- Do not commit secrets, API keys, or credentials.

## Pull Requests

1. Create a branch:
   - `add-<component-name>` for new contributions
   - `update-<component-name>` for updates
2. Make your changes.
3. Run `npm test`.
4. Open a PR with:
   - Summary of changes
   - Type/category
   - Validation results
   - Example prompts (if agent changes)

## Questions

Open an issue in this repository or contact the maintainer listed in `SECURITY.md`.
