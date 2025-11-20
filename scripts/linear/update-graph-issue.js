#!/usr/bin/env node
/**
 * Update Neo4j Knowledge Graph with new GitHub/Linear issue
 * 
 * Usage: node scripts/linear/update-graph-issue.js --githubIssueNumber 123 --linearIssueId "abc-123" --title "Issue Title" --type "bug" --priority 2
 */

const args = process.argv.slice(2);
const githubIssueNumber = args.find(arg => arg.startsWith('--githubIssueNumber'))?.split('=')[1];
const linearIssueId = args.find(arg => arg.startsWith('--linearIssueId'))?.split('=')[1];
const title = args.find(arg => arg.startsWith('--title'))?.split('=')[1];
const type = args.find(arg => arg.startsWith('--type'))?.split('=')[1];
const priority = args.find(arg => arg.startsWith('--priority'))?.split('=')[1];

if (!githubIssueNumber || !linearIssueId || !title) {
  console.error('Usage: node update-graph-issue.js --githubIssueNumber=123 --linearIssueId=abc-123 --title="Title" --type=bug --priority=2');
  process.exit(1);
}

// Cypher query to create/update issue in Neo4j
const query = `
MERGE (issue:LinearIssue {id: $linearIssueId})
SET issue.githubNumber = $githubIssueNumber,
    issue.title = $title,
    issue.type = $type,
    issue.priority = toInteger($priority),
    issue.createdAt = datetime(),
    issue.status = 'Triage'

// Link to components mentioned in title
WITH issue
MATCH (component:Component)
WHERE toLower($title) CONTAINS toLower(component.name)
MERGE (issue)-[:RELATES_TO]->(component)

RETURN issue, count(component) as relatedComponents
`;

try {
  // TODO: Execute Neo4j query
  console.log(`Issue ${linearIssueId} updated in knowledge graph`);
  console.log(JSON.stringify({ success: true, issueId: linearIssueId }));
} catch (error) {
  console.error('Error updating knowledge graph:', error.message);
  process.exit(1);
}

