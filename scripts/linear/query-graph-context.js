#!/usr/bin/env node
/**
 * Query Neo4j Knowledge Graph for issue context
 * 
 * Usage: node scripts/linear/query-graph-context.js "Issue Title" "Issue Description"
 * 
 * Returns: JSON with similar issues, related components, team expertise
 */

const { execSync } = require('child_process');
const title = process.argv[2] || '';
const description = process.argv[3] || '';

// Extract keywords from title and description
const keywords = [...title.split(' '), ...description.split(' ')]
  .filter(word => word.length > 3)
  .map(word => word.toLowerCase())
  .slice(0, 10);

// Cypher query to find similar issues and related components
const query = `
// Find similar issues
MATCH (issue:LinearIssue)
WHERE any(keyword IN $keywords WHERE 
  toLower(issue.title) CONTAINS keyword 
  OR toLower(issue.description) CONTAINS keyword
)
WITH issue, count(*) as matchScore
ORDER BY matchScore DESC
LIMIT 5

// Find related components mentioned in issue
MATCH (component:Component)
WHERE any(keyword IN $keywords WHERE 
  toLower(component.name) CONTAINS keyword
)

// Find team expertise for related components
OPTIONAL MATCH (team:Team)-[:HAS_EXPERTISE_IN]->(component)

RETURN {
  similarIssues: collect(DISTINCT {
    id: issue.id,
    title: issue.title,
    status: issue.status,
    matchScore: matchScore
  }),
  relatedComponents: collect(DISTINCT {
    name: component.name,
    file: component.file,
    status: component.status
  }),
  suggestedTeams: collect(DISTINCT {
    name: team.name,
    id: team.id,
    expertise: count(component)
  })
} as result
`;

try {
  // Execute Neo4j query via cypher-shell or HTTP API
  // For now, return structured output that can be parsed
  const result = {
    similarIssues: [],
    relatedComponents: [],
    suggestedTeams: [],
    labelIds: [],
    suggestedTeamId: null,
    suggestedAssigneeId: null
  };

  // TODO: Implement actual Neo4j query execution
  // This is a placeholder structure
  
  console.log(JSON.stringify(result));
} catch (error) {
  console.error('Error querying knowledge graph:', error.message);
  process.exit(1);
}

