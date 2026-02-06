# Mercurian Studio Plugin Marketplace

A Claude Code plugin marketplace by Mercurian Studio.

## Installation

```
/plugin marketplace add MercurianStudio/claude-marketplace
/plugin install non-technical-builder-guide@mercurianstudio-marketplace
```

## Available Plugins

| Plugin | Description |
|--------|-------------|
| `non-technical-builder-guide` | A patient technical guide for non-technical builders |

## Local Development

```
/plugin marketplace add ./claude-marketplace
/plugin install non-technical-builder-guide@mercurianstudio-marketplace
```

## Structure

```
.claude-plugin/
  marketplace.json        # Marketplace manifest
.github/
  workflows/ci.yml        # JSON linting and validation
plugins/
  non-technical-builder-guide/
    .claude-plugin/
      plugin.json         # Plugin manifest
    agents/               # Agent definitions
```

## License

MIT
