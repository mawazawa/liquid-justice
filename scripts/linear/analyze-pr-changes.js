#!/usr/bin/env node
/**
 * Analyze PR changes for impact assessment
 * 
 * Usage: node scripts/linear/analyze-pr-changes.js --prNumber 123 --base abc123 --head def456
 * 
 * Returns: JSON with changed files, components, breaking changes, complexity
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2);
const prNumber = args.find(arg => arg.startsWith('--prNumber'))?.split('=')[1];
const base = args.find(arg => arg.startsWith('--base'))?.split('=')[1];
const head = args.find(arg => arg.startsWith('--head'))?.split('=')[1];

if (!prNumber || !base || !head) {
  console.error('Usage: node analyze-pr-changes.js --prNumber=123 --base=abc123 --head=def456');
  process.exit(1);
}

try {
  // Get changed files
  const changedFiles = execSync(`git diff --name-only ${base}..${head}`, { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);

  // Get commit messages
  const commitMessages = execSync(`git log --pretty=format:"%s" ${base}..${head}`, { encoding: 'utf-8' })
    .trim()
    .split('\n');

  // Extract components from changed files
  const components = changedFiles
    .filter(file => file.includes('components/') || file.includes('lib/'))
    .map(file => {
      const match = file.match(/(?:components|lib)\/([^/]+)/);
      return match ? match[1].replace(/\.(tsx?|jsx?)$/, '') : null;
    })
    .filter(Boolean);

  // Detect breaking changes
  const hasBreakingChanges = 
    changedFiles.some(file => file.includes('index.ts')) || // Public API changes
    commitMessages.some(msg => /breaking|BREAKING/i.test(msg)) ||
    changedFiles.some(file => file.includes('types/') || file.includes('.d.ts'));

  // Detect features vs bug fixes
  const hasNewFeatures = commitMessages.some(msg => /feat|feature|add/i.test(msg));
  const hasBugFixes = commitMessages.some(msg => /fix|bug|resolve/i.test(msg));

  // Check design system impact
  const affectsDesignSystem = changedFiles.some(file => 
    file.includes('tokens.ts') || 
    file.includes('components/ui/') ||
    file.includes('design-system')
  );

  // Calculate complexity (simple heuristic)
  const totalChanges = execSync(`git diff --shortstat ${base}..${head}`, { encoding: 'utf-8' });
  const complexity = hasBreakingChanges ? 'complex' : 
                    changedFiles.length > 10 ? 'medium' : 'simple';

  const result = {
    changedFiles,
    components,
    commitMessages,
    hasBreakingChanges,
    hasNewFeatures,
    hasBugFixes,
    affectsDesignSystem,
    complexity,
    totalFiles: changedFiles.length
  };

  // Output as GitHub Actions output
  console.log(`::set-output name=changedFiles::${JSON.stringify(changedFiles)}`);
  console.log(`::set-output name=components::${JSON.stringify(components)}`);
  console.log(`::set-output name=hasBreakingChanges::${hasBreakingChanges}`);
  console.log(`::set-output name=hasNewFeatures::${hasNewFeatures}`);
  console.log(`::set-output name=hasBugFixes::${hasBugFixes}`);
  console.log(`::set-output name=affectsDesignSystem::${affectsDesignSystem}`);
  console.log(`::set-output name=complexity::${complexity}`);
  console.log(`::set-output name=result::${JSON.stringify(result)}`);

  // Also output JSON for parsing
  console.log(JSON.stringify(result));
} catch (error) {
  console.error('Error analyzing PR changes:', error.message);
  process.exit(1);
}

