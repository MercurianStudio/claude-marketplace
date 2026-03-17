# Contributing

Thanks for contributing to this marketplace.

## Scope

This repository contains subagent definitions for Claude Code.

Primary paths:

- `agents/*.md`
- `marketplace.json`

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
- Add a matching entry in `marketplace.json` under `agents`.
- Do not commit secrets, API keys, or credentials.

## Pull Requests

1. Create a branch:
   - `add-<agent-name>` for new agents
   - `update-<agent-name>` for updates
2. Make your changes.
3. Run `npm test`.
4. Open a PR with:
   - Summary of changes
   - Agent category
   - Validation results
   - Example prompts

## Questions

Open an issue in this repository or contact the maintainer listed in `SECURITY.md`.
