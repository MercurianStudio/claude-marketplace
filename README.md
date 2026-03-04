# Mercurian Studio Claude Marketplace

Build with Claude contribution-ready marketplace for Claude Code.

## Included Contribution

- Type: Agent plugin
- Plugin: `agents-specialized-domains`
- Agent: `non-technical-builder-guide`
- Category: `specialized-domains`

## What This Agent Does

`non-technical-builder-guide` is a practical support agent for people without a software engineering background.

- Explains technical concepts (APIs, tokens, credentials, integrations) in plain language
- Starts with research-first guidance before recommending custom code
- Asks focused clarification questions before making changes
- Defaults to safe, read-only investigation unless changes are explicitly confirmed
- Emphasizes security, privacy, and least-privilege handling of secrets
- Provides step-by-step execution guidance with clear milestones

## Install

```bash
/plugin marketplace add MercurianStudio/claude-marketplace
/plugin install agents-specialized-domains@mercurianstudio-marketplace
```

## Build with Claude Alignment

This repo now matches the core requirements from <https://buildwithclaude.com/contribute> and the public contribution guide:

- Plugin path convention: `plugins/agents-<category>/...`
- Agent frontmatter includes `name`, `description`, and valid `category`
- Agent opening line starts with `You are a...`
- Marketplace manifest includes schema, owner metadata, plugin metadata, and source paths
- Plugin manifest includes `author.url`, `repository`, `license`, and `keywords`
- Validation command available via `npm test`

## Validate Before Submission

```bash
npm test
```

## Structure

```text
.claude-plugin/
  marketplace.json
plugins/
  agents-specialized-domains/
    .claude-plugin/
      plugin.json
    agents/
      non-technical-builder-guide.md
scripts/
  validate-buildwithclaude-readiness.js
```

## Submission Checklist

1. Fork and clone `davepoon/buildwithclaude`
2. Copy plugin contents into `plugins/agents-specialized-domains/` (or open a PR adding your agent under the correct category plugin)
3. Run `npm test` in the target repo
4. Open PR with examples and testing notes

## License

MIT
