// Agentic Coding Query Templates for Knowledge Graph
// Based on AGR (Adaptive Graph Retrieval) pattern
// Date: 2025-11-19

// ============================================================================
// QUERY 1: Get Comprehensive Component Context (Multi-hop retrieval)
// Use Case: Agent needs full context before modifying code
// ============================================================================
MATCH (c:Component {name: $componentName})-[*1..3]->(related)
OPTIONAL MATCH (c)-[:USES]->(hook:Hook)
OPTIONAL MATCH (c)-[:USES_TOKEN]->(token:DesignToken)
OPTIONAL MATCH (c)<-[:AFFECTED]-(r:Refactoring)
OPTIONAL MATCH (r)-[:DOCUMENTED_IN]->(issue:LinearIssue)
RETURN c, 
       collect(DISTINCT related) as relatedItems,
       collect(DISTINCT hook) as hooks,
       collect(DISTINCT token) as tokens,
       collect(DISTINCT r) as refactorings,
       collect(DISTINCT issue) as relatedIssues

// ============================================================================
// QUERY 2: Impact Analysis for Refactoring (Breaking Change Detection)
// Use Case: Before refactoring, find all affected code
// ============================================================================
MATCH (target:Hook {name: $hookName})
OPTIONAL MATCH (target)<-[:USES]-(component:Component)
OPTIONAL MATCH (target)<-[:IMPLEMENTS]-(func:Function)
OPTIONAL MATCH (func)<-[:CALLS]-(caller:Function)
OPTIONAL MATCH (target)<-[:AFFECTED]-(refactoring:Refactoring)
RETURN target,
       collect(DISTINCT component) as usingComponents,
       collect(DISTINCT func) as implementations,
       collect(DISTINCT caller) as callers,
       collect(DISTINCT refactoring) as previousRefactorings,
       count(DISTINCT component) + count(DISTINCT caller) as impactScore

// ============================================================================
// QUERY 3: Find Similar Code Patterns (Code Reuse Discovery)
// Use Case: Agent needs to find similar implementations for reference
// ============================================================================
MATCH (target:Component {name: $componentName})
MATCH (similar:Component)
WHERE similar.type = target.type
  AND similar <> target
  AND similar.status = 'production-ready'
OPTIONAL MATCH (target)-[:USES]->(targetHook:Hook)
OPTIONAL MATCH (similar)-[:USES]->(similarHook:Hook)
WITH target, similar, 
     collect(DISTINCT targetHook.name) as targetHooks,
     collect(DISTINCT similarHook.name) as similarHooks
WHERE size([h IN targetHooks WHERE h IN similarHooks]) > 0
RETURN similar.name, similar.file, 
       size([h IN targetHooks WHERE h IN similarHooks]) as commonHooks,
       similarHooks
ORDER BY commonHooks DESC
LIMIT 5

// ============================================================================
// QUERY 4: Dependency Chain Analysis (Full Dependency Graph)
// Use Case: Understand complete dependency chain for debugging
// ============================================================================
MATCH path = (root:Component {name: $componentName})-[*1..5]->(dep)
WHERE dep:Component OR dep:Hook OR dep:DesignToken OR dep:Function
RETURN path, 
       length(path) as depth,
       [n IN nodes(path) | n.name] as dependencyChain
ORDER BY depth
LIMIT 50

// ============================================================================
// QUERY 5: Historical Context Retrieval (Code Evolution)
// Use Case: Understand why code was changed and what issues it solved
// ============================================================================
MATCH (target:Component {name: $componentName})
OPTIONAL MATCH (target)<-[:AFFECTED]-(r:Refactoring)
OPTIONAL MATCH (r)-[:DOCUMENTED_IN]->(issue:LinearIssue)
OPTIONAL MATCH (r)-[:AFFECTED]->(related)
RETURN target,
       collect(DISTINCT {
         refactoring: r.name,
         commit: r.commit,
         date: r.date,
         issue: issue.id,
         issueTitle: issue.title,
         relatedChanges: collect(DISTINCT related.name)
       }) as history
ORDER BY r.date DESC

// ============================================================================
// QUERY 6: Design System Usage Analysis (Cross-Project Impact)
// Use Case: See how design system is used across projects
// ============================================================================
MATCH (ds:DesignSystem {name: 'Liquid Justice Design System'})
OPTIONAL MATCH (ds)-[:USED_BY]->(project:Project)
OPTIONAL MATCH (ds)-[:HAS_REFACTORING]->(refactoring:Refactoring)
OPTIONAL MATCH (refactoring)-[:AFFECTED]->(item)
RETURN ds,
       collect(DISTINCT project.name) as projects,
       count(DISTINCT refactoring) as totalRefactorings,
       collect(DISTINCT item.name) as affectedItems,
       count(DISTINCT item) as totalAffected

// ============================================================================
// QUERY 7: Bug Fix Context (AGR Pattern - Multi-hop with confidence)
// Use Case: Debug bug by following semantic relationships
// ============================================================================
// Step 1: Identify seed node (bug location)
MATCH (bug:Bug {file: $bugFile, line: $bugLine})
MATCH (bug)-[:OCCURS_IN]->(func:Function)

// Step 2: k=1: Direct calls and imports
OPTIONAL MATCH (func)-[:CALLS|IMPORTS]->(direct)

// Step 3: k=2: Dependencies and tests
OPTIONAL MATCH (direct)-[:CALLS|REFERENCES*]->(indirect)
OPTIONAL MATCH (test:Test)-[:TESTS]->(func)

// Step 4: k=3: Historical context
OPTIONAL MATCH (func)<-[:MODIFIES]-(commit:Commit)
OPTIONAL MATCH (commit)-[:RELATES_TO]->(issue:LinearIssue)

RETURN func,
       collect(DISTINCT direct) as directDependencies,
       collect(DISTINCT indirect) as indirectDependencies,
       collect(DISTINCT test) as tests,
       collect(DISTINCT commit) as relatedCommits,
       collect(DISTINCT issue) as relatedIssues

// ============================================================================
// QUERY 8: Code Quality Metrics (Complexity & Dependency Analysis)
// Use Case: Identify high-complexity code that needs refactoring
// ============================================================================
MATCH (f:Function)
OPTIONAL MATCH (f)-[:CALLS]->(callee:Function)
OPTIONAL MATCH (f)<-[:CALLS]-(caller:Function)
OPTIONAL MATCH (f)-[:IN_FILE]->(file:File)
WITH f, 
     count(DISTINCT callee) as outDegree, 
     count(DISTINCT caller) as inDegree,
     file
SET f.complexity = outDegree + inDegree,
    f.coupling = inDegree
RETURN f.name, 
       f.file,
       f.complexity,
       f.coupling,
       (f.complexity + f.coupling) as totalComplexity
ORDER BY totalComplexity DESC
LIMIT 20

// ============================================================================
// QUERY 9: Find Unused Code (Dead Code Detection)
// Use Case: Identify code that can be safely removed
// ============================================================================
MATCH (func:Function)
WHERE NOT (func)<-[:CALLS]-()
  AND NOT (func)-[:EXPORTS]->()
  AND func.status <> 'deprecated'
OPTIONAL MATCH (func)-[:IN_FILE]->(file:File)
RETURN func.name, func.file, func.lineStart, func.lineEnd,
       'Potential dead code' as status
ORDER BY file, func.lineStart

// ============================================================================
// QUERY 10: Refactoring Recommendations (Based on Patterns)
// Use Case: Suggest refactoring opportunities
// ============================================================================
MATCH (c:Component)
WHERE c.complexity > 10
  OR (c)-[:USES]->(:Hook {status: 'deprecated'})
  OR NOT (c)-[:USES]->(:DesignToken)
OPTIONAL MATCH (c)-[:USES]->(hook:Hook)
OPTIONAL MATCH (c)-[:USES_TOKEN]->(token:DesignToken)
RETURN c.name, c.file, c.complexity,
       collect(DISTINCT hook.name) as hooks,
       collect(DISTINCT token.name) as tokens,
       CASE
         WHEN c.complexity > 10 THEN 'High complexity - consider splitting'
         WHEN size([h IN collect(hook) WHERE h.status = 'deprecated']) > 0 
           THEN 'Uses deprecated hooks - needs update'
         WHEN size(collect(token)) = 0 
           THEN 'Not using design tokens - needs standardization'
         ELSE 'Review recommended'
       END as recommendation

// ============================================================================
// QUERY 11: Cross-Project Dependency Analysis
// Use Case: Understand impact of design system changes across projects
// ============================================================================
MATCH (ds:DesignSystem {name: 'Liquid Justice Design System'})
MATCH (ds)-[:USED_BY]->(project:Project)
OPTIONAL MATCH (ds)-[:HAS_REFACTORING]->(r:Refactoring)
OPTIONAL MATCH (r)-[:AFFECTED]->(item)
WITH project, r, collect(DISTINCT item.name) as affectedItems
RETURN project.name,
       count(DISTINCT r) as refactorings,
       collect(DISTINCT affectedItems) as allAffectedItems,
       'Monitor for breaking changes' as action

// ============================================================================
// QUERY 12: Agentic Code Generation Context
// Use Case: Get all context needed for generating new code
// ============================================================================
MATCH (target:Component {name: $targetName})
OPTIONAL MATCH (target)-[:USES]->(hook:Hook {status: 'production-ready'})
OPTIONAL MATCH (target)-[:USES_TOKEN]->(token:DesignToken)
OPTIONAL MATCH (similar:Component)-[:USES]->(hook)
WHERE similar <> target AND similar.status = 'production-ready'
OPTIONAL MATCH (target)<-[:AFFECTED]-(r:Refactoring)
OPTIONAL MATCH (r)-[:DOCUMENTED_IN]->(issue:LinearIssue)
RETURN target,
       collect(DISTINCT hook) as availableHooks,
       collect(DISTINCT token) as availableTokens,
       collect(DISTINCT similar) as similarComponents,
       collect(DISTINCT {
         refactoring: r.name,
         issue: issue.id,
         lessons: r.changes
       }) as historicalLessons

