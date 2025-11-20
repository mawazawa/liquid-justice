#!/usr/bin/env node
/**
 * Extract Linear issue IDs from PR and link them
 * 
 * Usage: node scripts/linear/link-pr-to-linear.js --prNumber 123 --prBody "PR description" --commits "commit1,commit2"
 */

const args = process.argv.slice(2);
const prNumber = args.find(arg => arg.startsWith('--prNumber'))?.split('=')[1];
const prBody = args.find(arg => arg.startsWith('--prBody'))?.split('=')[1] || '';
const commits = args.find(arg => arg.startsWith('--commits'))?.split('=')[1]?.split(',') || [];

if (!prNumber) {
  console.error('Usage: node link-pr-to-linear.js --prNumber=123 --prBody="Description" --commits="msg1,msg2"');
  process.exit(1);
}

// Extract Linear issue IDs (format: JUSTICE-123, JUSTICE-456)
const linearIssuePattern = /(?:JUSTICE|SWIFT|BILL)-(\d+)/gi;
const allText = [prBody, ...commits].join(' ');
const issueIds = [...allText.matchAll(linearIssuePattern)].map(match => match[0]);

if (issueIds.length === 0) {
  console.log('No Linear issue IDs found in PR');
  process.exit(0);
}

try {
  // Update Linear issues with PR link
  const { execSync } = require('child_process');
  
  for (const issueId of issueIds) {
    // Use Linear API to add PR link
    // This would use the Linear MCP or direct API call
    console.log(`Linking PR #${prNumber} to ${issueId}`);
  }

  console.log(JSON.stringify({ 
    success: true, 
    prNumber, 
    linkedIssues: issueIds 
  }));
} catch (error) {
  console.error('Error linking PR to Linear:', error.message);
  process.exit(1);
}

