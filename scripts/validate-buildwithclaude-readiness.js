#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const VALID_AGENT_CATEGORIES = new Set([
  'development-architecture',
  'language-specialists',
  'infrastructure-operations',
  'quality-security',
  'data-ai',
  'specialized-domains',
  'crypto-trading',
  'blockchain-web3',
  'business-finance',
  'design-experience',
  'sales-marketing'
]);

const VALID_PLUGIN_CATEGORIES = new Set([
  'agents',
  'commands',
  'hooks',
  'skills',
  'utilities',
  'mcp-servers'
]);

const errors = [];
const warnings = [];

function fileExists(targetPath) {
  return fs.existsSync(targetPath);
}

function readJsonFile(targetPath, label) {
  if (!fileExists(targetPath)) {
    errors.push(`Missing required file: ${targetPath}`);
    return null;
  }

  try {
    const raw = fs.readFileSync(targetPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    errors.push(`${label} is not valid JSON: ${error.message}`);
    return null;
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function ensure(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

function parseFrontmatterFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    errors.push(`${filePath}: missing valid frontmatter block`);
    return null;
  }

  const frontmatterRaw = match[1];
  const body = match[2] || '';
  const data = {};

  for (const line of frontmatterRaw.split('\n')) {
    if (!line.trim()) {
      continue;
    }

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      errors.push(`${filePath}: invalid frontmatter line "${line}"`);
      continue;
    }

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    data[key] = value;
  }

  return { data, body };
}

function validateMarketplaceJson(marketplace, filePath) {
  if (!marketplace) {
    return;
  }

  ensure(isNonEmptyString(marketplace.name), `${filePath}: missing or invalid "name"`);
  ensure(isNonEmptyString(marketplace.version), `${filePath}: missing or invalid "version"`);
  ensure(typeof marketplace.owner === 'object' && marketplace.owner !== null, `${filePath}: missing "owner" object`);
  ensure(typeof marketplace.metadata === 'object' && marketplace.metadata !== null, `${filePath}: missing "metadata" object`);
  ensure(Array.isArray(marketplace.plugins), `${filePath}: missing "plugins" array`);

  if (marketplace.owner) {
    ensure(isNonEmptyString(marketplace.owner.name), `${filePath}: missing "owner.name"`);
    ensure(isNonEmptyString(marketplace.owner.email), `${filePath}: missing "owner.email"`);
  }

  if (marketplace.metadata) {
    ensure(isNonEmptyString(marketplace.metadata.description), `${filePath}: missing "metadata.description"`);
    ensure(isNonEmptyString(marketplace.metadata.repository), `${filePath}: missing "metadata.repository"`);
    ensure(isNonEmptyString(marketplace.metadata.license), `${filePath}: missing "metadata.license"`);
  }

  if (!Array.isArray(marketplace.plugins)) {
    return;
  }

  for (const [index, plugin] of marketplace.plugins.entries()) {
    const base = `${filePath}: plugins[${index}]`;
    ensure(isNonEmptyString(plugin.name), `${base}: missing "name"`);
    ensure(isNonEmptyString(plugin.version), `${base}: missing "version"`);
    ensure(isNonEmptyString(plugin.description), `${base}: missing "description"`);
    ensure(isNonEmptyString(plugin.source), `${base}: missing "source"`);

    if (plugin.category && !VALID_PLUGIN_CATEGORIES.has(plugin.category)) {
      warnings.push(`${base}: category "${plugin.category}" is uncommon; expected one of ${Array.from(VALID_PLUGIN_CATEGORIES).join(', ')}`);
    }

    if (isNonEmptyString(plugin.source)) {
      const sourcePath = path.resolve(plugin.source);
      ensure(fileExists(sourcePath), `${base}: source path does not exist (${plugin.source})`);
    }
  }
}

function validatePluginManifest(pluginDir) {
  const pluginJsonPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');
  const plugin = readJsonFile(pluginJsonPath, pluginJsonPath);

  if (!plugin) {
    return;
  }

  const expectedName = path.basename(pluginDir);

  ensure(isNonEmptyString(plugin.name), `${pluginJsonPath}: missing "name"`);
  ensure(plugin.name === expectedName, `${pluginJsonPath}: "name" must match directory name (${expectedName})`);
  ensure(isNonEmptyString(plugin.version), `${pluginJsonPath}: missing "version"`);
  ensure(isNonEmptyString(plugin.description), `${pluginJsonPath}: missing "description"`);
  ensure(typeof plugin.author === 'object' && plugin.author !== null, `${pluginJsonPath}: missing "author" object`);
  ensure(isNonEmptyString(plugin.repository), `${pluginJsonPath}: missing "repository"`);
  ensure(isNonEmptyString(plugin.license), `${pluginJsonPath}: missing "license"`);
  ensure(Array.isArray(plugin.keywords), `${pluginJsonPath}: missing "keywords" array`);

  if (plugin.author) {
    ensure(isNonEmptyString(plugin.author.name), `${pluginJsonPath}: missing "author.name"`);
    ensure(isNonEmptyString(plugin.author.url), `${pluginJsonPath}: missing "author.url"`);
  }

  const agentsDir = path.join(pluginDir, 'agents');
  if (!fileExists(agentsDir)) {
    warnings.push(`${pluginDir}: no agents directory present (valid if this plugin only contains other component types)`);
    return;
  }

  const agentFiles = fs.readdirSync(agentsDir)
    .filter((entry) => entry.endsWith('.md'))
    .map((entry) => path.join(agentsDir, entry));

  ensure(agentFiles.length > 0, `${pluginDir}: agents directory is empty`);

  for (const agentFile of agentFiles) {
    validateAgentFile(agentFile);
  }
}

function validateAgentFile(agentFilePath) {
  const parsed = parseFrontmatterFile(agentFilePath);
  if (!parsed) {
    return;
  }

  const { data, body } = parsed;
  const filename = path.basename(agentFilePath, '.md');

  ensure(isNonEmptyString(data.name), `${agentFilePath}: missing frontmatter "name"`);
  ensure(data.name === filename, `${agentFilePath}: frontmatter "name" must match filename (${filename})`);
  ensure(isNonEmptyString(data.description), `${agentFilePath}: missing frontmatter "description"`);

  if (isNonEmptyString(data.description) && data.description.length > 500) {
    errors.push(`${agentFilePath}: frontmatter "description" exceeds 500 characters`);
  }

  ensure(isNonEmptyString(data.category), `${agentFilePath}: missing frontmatter "category"`);
  if (isNonEmptyString(data.category) && !VALID_AGENT_CATEGORIES.has(data.category)) {
    errors.push(
      `${agentFilePath}: invalid category "${data.category}". Valid categories: ${Array.from(VALID_AGENT_CATEGORIES).join(', ')}`
    );
  }

  const firstContentLine = body
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  if (!firstContentLine || !/^You are (a|an)\b/.test(firstContentLine)) {
    errors.push(`${agentFilePath}: opening statement must start with "You are a..."`);
  }
}

function main() {
  const marketplacePath = path.join('.claude-plugin', 'marketplace.json');
  const rootMarketplacePath = 'marketplace.json';

  const claudeMarketplace = readJsonFile(marketplacePath, marketplacePath);
  const rootMarketplace = readJsonFile(rootMarketplacePath, rootMarketplacePath);

  validateMarketplaceJson(claudeMarketplace, marketplacePath);
  validateMarketplaceJson(rootMarketplace, rootMarketplacePath);

  if (claudeMarketplace && rootMarketplace) {
    const a = JSON.stringify(claudeMarketplace);
    const b = JSON.stringify(rootMarketplace);
    if (a !== b) {
      warnings.push('marketplace.json and .claude-plugin/marketplace.json differ; keep them synchronized');
    }
  }

  const pluginsDir = 'plugins';
  ensure(fileExists(pluginsDir), 'Missing plugins directory');

  if (fileExists(pluginsDir)) {
    const pluginDirs = fs.readdirSync(pluginsDir)
      .map((entry) => path.join(pluginsDir, entry))
      .filter((entry) => fs.statSync(entry).isDirectory());

    if (pluginDirs.length === 0) {
      errors.push('No plugin directories found in plugins/');
    }

    for (const pluginDir of pluginDirs) {
      validatePluginManifest(pluginDir);
    }
  }

  if (errors.length > 0) {
    console.error('Validation failed with errors:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }

    if (warnings.length > 0) {
      console.error('\nWarnings:');
      for (const warning of warnings) {
        console.error(`- ${warning}`);
      }
    }

    process.exit(1);
  }

  console.log('Build with Claude readiness validation passed.');

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }
}

main();
