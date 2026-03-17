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
  ensure(Array.isArray(marketplace.agents), `${filePath}: missing "agents" array`);

  if (marketplace.owner) {
    ensure(isNonEmptyString(marketplace.owner.name), `${filePath}: missing "owner.name"`);
    ensure(isNonEmptyString(marketplace.owner.email), `${filePath}: missing "owner.email"`);
  }

  if (marketplace.metadata) {
    ensure(isNonEmptyString(marketplace.metadata.description), `${filePath}: missing "metadata.description"`);
    ensure(isNonEmptyString(marketplace.metadata.repository), `${filePath}: missing "metadata.repository"`);
    ensure(isNonEmptyString(marketplace.metadata.license), `${filePath}: missing "metadata.license"`);
  }

  if (!Array.isArray(marketplace.agents)) {
    return;
  }

  for (const [index, agent] of marketplace.agents.entries()) {
    const base = `${filePath}: agents[${index}]`;
    ensure(isNonEmptyString(agent.name), `${base}: missing "name"`);
    ensure(isNonEmptyString(agent.version), `${base}: missing "version"`);
    ensure(isNonEmptyString(agent.description), `${base}: missing "description"`);
    ensure(isNonEmptyString(agent.source), `${base}: missing "source"`);

    if (agent.category && !VALID_AGENT_CATEGORIES.has(agent.category)) {
      warnings.push(`${base}: category "${agent.category}" is uncommon; expected one of ${Array.from(VALID_AGENT_CATEGORIES).join(', ')}`);
    }

    if (isNonEmptyString(agent.source)) {
      const sourcePath = path.resolve(agent.source);
      ensure(fileExists(sourcePath), `${base}: source path does not exist (${agent.source})`);
    }
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
  const marketplacePath = 'marketplace.json';
  const marketplace = readJsonFile(marketplacePath, marketplacePath);
  validateMarketplaceJson(marketplace, marketplacePath);

  const agentsDir = 'agents';
  ensure(fileExists(agentsDir), 'Missing agents directory');

  if (fileExists(agentsDir)) {
    const agentFiles = fs.readdirSync(agentsDir)
      .filter((entry) => entry.endsWith('.md'))
      .map((entry) => path.join(agentsDir, entry));

    ensure(agentFiles.length > 0, 'No agent files found in agents/');

    for (const agentFile of agentFiles) {
      validateAgentFile(agentFile);
    }

    // Verify marketplace agents match files on disk
    if (marketplace && Array.isArray(marketplace.agents)) {
      const agentFileNames = new Set(
        agentFiles.map((f) => path.basename(f, '.md'))
      );
      for (const agent of marketplace.agents) {
        if (isNonEmptyString(agent.name) && !agentFileNames.has(agent.name)) {
          errors.push(`marketplace.json lists agent "${agent.name}" but no matching file exists in agents/`);
        }
      }
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

  console.log('Subagent validation passed.');

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }
}

main();
