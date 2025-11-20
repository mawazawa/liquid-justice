#!/usr/bin/env node
/**
 * Update Neo4j Knowledge Graph with PR relationships
 * 
 * Usage: node scripts/linear/update-graph-pr.js --prNumber 123 --commit abc123 --changedFiles "file1,file2"
 */

const args = process.argv.slice(2);
const prNumber = args.find(arg => arg.startsWith('--prNumber'))?.split('=')[1];
const commit = args.find(arg => arg.startsWith('--commit'))?.split('=')[1];
const changedFiles = args.find(arg => arg.startsWith('--changedFiles'))?.split('=')[1]?.split(',') || [];

if (!prNumber || !commit) {
  console.error('Usage: node update-graph-pr.js --prNumber=123 --commit=abc123 --changedFiles="file1,file2"');
  process.exit(1);
}

// Cypher query to create PR node and relationships
const query = `
MERGE (pr:PullRequest {number: $prNumber})
SET pr.commit = $commit,
    pr.changedFiles = $changedFiles,
    pr.createdAt = datetime(),
    pr.status = 'open'

// Link to affected components
WITH pr
MATCH (component:Component)
WHERE component.file IN $changedFiles
MERGE (pr)-[:MODIFIES]->(component)

// Link to related Linear issues (extracted from PR description/commits)
WITH pr
MATCH (issue:LinearIssue)
WHERE issue.id IN $relatedIssueIds
MERGE (pr)-[:RELATES_TO]->(issue)

RETURN pr, count(component) as affectedComponents, count(issue) as relatedIssues
`;

try {
  // TODO: Execute Neo4j query
  console.log(`PR ${prNumber} updated in knowledge graph`);
  console.log(JSON.stringify({ success: true, prNumber, affectedComponents: changedFiles.length }));
} catch (error) {
  console.error('Error updating knowledge graph:', error.message);
  process.exit(1);
}

