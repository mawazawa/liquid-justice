# Linear Automation & Triage Strategy

**Date**: 2025-11-19  
**Status**: Strategy Documented, Implementation Plan  
**Integrates with**: Knowledge Graph Strategy (JUSTICE-301)

---

## Executive Summary

Automated Linear triage and GitHub Actions integration to eliminate manual issue management overhead. Leverages AI analysis, knowledge graph context, and automated workflows to achieve:

- **Zero manual triage** for standard issues
- **Instant issue classification** (bug/feature/enhancement)
- **Automatic priority assignment** based on impact analysis
- **Smart team/assignee routing** using expertise graph
- **Breaking change detection** via dependency analysis
- **Bidirectional sync** between GitHub and Linear

---

## Current State

### Existing Automation ✅
- **Linear Sync Script**: `scripts/linear/update_issue.sh`
- **GitHub Action**: Posts PR/commit metadata to Linear issues
- **Status**: Operational but limited to metadata sync

### Missing Capabilities ❌
- Automated issue triage
- AI-powered classification
- Priority assignment
- Team/assignee routing
- Breaking change detection
- Knowledge graph integration

---

## Research Findings

### Best Practices (2025)

1. **Linear Triage Intelligence** (Sept 2025)
   - Auto-apply triage suggestions
   - Configurable rules per property
   - Confidence-based automation

2. **AI-Powered Classification**
   - GPT-4 analysis of issue descriptions
   - Multi-label classification
   - Similarity matching to existing issues

3. **Knowledge Graph Integration**
   - Team expertise mapping
   - Component ownership
   - Historical issue patterns

4. **GitHub Actions Patterns**
   - Issue opened → Analyze → Triage → Create Linear
   - PR opened → Impact analysis → Label → Link to Linear
   - Commit pushed → Extract issue IDs → Update Linear

---

## Implementation Plan

### Phase 1: Automated Issue Triage (Week 1)

#### 1.1 AI Issue Analysis
**Workflow**: `.github/workflows/linear-triage.yml`

**Capabilities**:
- Analyze issue title + description with Claude
- Classify: bug/feature/enhancement/question/docs
- Assign priority: 0-4 (Urgent/High/Normal/Low)
- Estimate complexity: simple/medium/complex
- Suggest labels based on content

**Implementation**:
```yaml
- name: Analyze issue with AI
  uses: actions/github-script@v7
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  # Claude analyzes issue and returns structured JSON
```

#### 1.2 Knowledge Graph Context
**Query Neo4j for**:
- Similar issues (duplicate detection)
- Related components (from title/description)
- Team expertise (who worked on similar issues)
- Historical patterns (how similar issues were resolved)

**Cypher Query**:
```cypher
// Find similar issues and team expertise
MATCH (issue:LinearIssue)
WHERE issue.title CONTAINS $keyword
  OR issue.description CONTAINS $keyword
MATCH (issue)-[:ASSIGNED_TO]->(team:Team)
MATCH (team)-[:HAS_EXPERTISE_IN]->(component:Component)
RETURN issue, team, component, 
       gds.similarity.cosine(issue.embedding, $newIssueEmbedding) as similarity
ORDER BY similarity DESC
LIMIT 5
```

#### 1.3 Auto-Labeling
**Labels Applied**:
- Type: `bug`, `feature`, `enhancement`, `question`, `documentation`
- Priority: `priority:urgent`, `priority:high`, `priority:normal`, `priority:low`
- Component: `component:BentoGrid`, `component:use-swipe-gesture`
- Team: `team:frontend`, `team:design-system`
- Status: `needs-triage` (removed after auto-triage)

#### 1.4 Linear Issue Creation
**Auto-create Linear issue with**:
- Title and description from GitHub
- Suggested team (from knowledge graph)
- Suggested assignee (from expertise graph)
- Priority (from AI analysis)
- Labels (from classification + graph context)
- Link back to GitHub issue

### Phase 2: PR Impact Analysis (Week 2)

#### 2.1 Change Analysis
**Detect**:
- Changed files and components
- Breaking changes (API changes, type changes)
- New features vs bug fixes
- Design system impact
- Test coverage changes

#### 2.2 Dependency Impact
**Query Knowledge Graph**:
```cypher
// Find all components affected by PR changes
MATCH (changed:Component {name: $componentName})
MATCH (changed)<-[:USES|CALLS|IMPORTS*]-(dependent)
RETURN dependent, 
       count(dependent) as impactScore,
       collect(DISTINCT labels(dependent)) as affectedTypes
```

#### 2.3 Auto-Labeling PRs
**Labels**:
- `breaking-change` (if API changes detected)
- `high-impact` (if >5 components affected)
- `design-system` (if design tokens/components changed)
- `needs-review` (if impact score > threshold)
- `feature`, `bug-fix`, `refactor` (from change analysis)

#### 2.4 Link to Linear Issues
**Extract Linear issue IDs from**:
- PR description (`JUSTICE-123`)
- Commit messages (`fix: resolves JUSTICE-123`)
- Branch names (`justice-123-feature-name`)

**Update Linear issues**:
- Add PR link
- Update status (In Progress)
- Add PR metadata comment

### Phase 3: Knowledge Graph Integration (Week 3)

#### 3.1 Issue → Graph Sync
**On Issue Created**:
```cypher
// Create issue node and relationships
CREATE (issue:LinearIssue {
  id: $linearId,
  githubNumber: $githubNumber,
  title: $title,
  type: $type,
  priority: $priority,
  createdAt: datetime()
})

// Link to components mentioned
MATCH (component:Component)
WHERE $description CONTAINS component.name
CREATE (issue)-[:RELATES_TO]->(component)

// Link to team
MATCH (team:Team {name: $teamName})
CREATE (issue)-[:ASSIGNED_TO]->(team)
```

#### 3.2 PR → Graph Sync
**On PR Created**:
```cypher
// Create PR node
CREATE (pr:PullRequest {
  number: $prNumber,
  commit: $commitSha,
  title: $title,
  changedFiles: $changedFiles
})

// Link to affected components
MATCH (component:Component)
WHERE component.file IN $changedFiles
CREATE (pr)-[:MODIFIES]->(component)

// Link to related issues
MATCH (issue:LinearIssue {id: $issueId})
CREATE (pr)-[:RELATES_TO]->(issue)
```

#### 3.3 Expertise Graph Updates
**Track team expertise**:
```cypher
// Update team expertise when issue resolved
MATCH (issue:LinearIssue {id: $issueId})-[:ASSIGNED_TO]->(team:Team)
MATCH (issue)-[:RELATES_TO]->(component:Component)
MERGE (team)-[exp:HAS_EXPERTISE_IN]->(component)
ON CREATE SET exp.count = 1, exp.lastWorked = datetime()
ON MATCH SET exp.count = exp.count + 1, exp.lastWorked = datetime()
```

### Phase 4: Advanced Automation (Week 4)

#### 4.1 Duplicate Detection
**Query**:
```cypher
// Find similar issues using embeddings
MATCH (new:LinearIssue {id: $newId})
MATCH (existing:LinearIssue)
WHERE existing.id <> new.id
  AND existing.status <> 'Done'
WITH new, existing,
     gds.similarity.cosine(new.embedding, existing.embedding) as similarity
WHERE similarity > 0.85
RETURN existing, similarity
ORDER BY similarity DESC
```

**Action**: Link as duplicate, suggest closing

#### 4.2 Auto-Assignment
**Based on**:
- Team expertise (from graph)
- Current workload (from active issues)
- Component ownership (from graph)
- Historical success rate

**Query**:
```cypher
// Find best assignee for issue
MATCH (issue:LinearIssue {id: $issueId})-[:RELATES_TO]->(component:Component)
MATCH (team:Team)-[exp:HAS_EXPERTISE_IN]->(component)
MATCH (team)-[:HAS_MEMBER]->(member:Person)
OPTIONAL MATCH (member)<-[:ASSIGNED_TO]-(active:LinearIssue)
WHERE active.status IN ['Triage', 'In Progress', 'In Review']
WITH member, 
     avg(exp.count) as expertise,
     count(active) as workload,
     (expertise / (workload + 1)) as score
RETURN member, score
ORDER BY score DESC
LIMIT 1
```

#### 4.3 Priority Escalation
**Rules**:
- Issue open >7 days → Escalate priority
- Multiple comments → Escalate
- Related to critical component → High priority
- Breaking change → Urgent priority

#### 4.4 Status Automation
**Transitions**:
- PR merged → Linear issue → Done
- PR closed → Linear issue → Canceled
- Issue labeled `wontfix` → Canceled
- All PRs merged → Issue → Done

---

## GitHub Actions Workflows

### Workflow 1: Issue Triage
**File**: `.github/workflows/linear-triage.yml`

**Triggers**:
- `issues.opened`
- `issues.edited`

**Steps**:
1. Analyze with Claude AI
2. Query knowledge graph for context
3. Apply labels
4. Create Linear issue
5. Update knowledge graph

### Workflow 2: PR Analysis
**File**: `.github/workflows/linear-triage.yml` (same file, different job)

**Triggers**:
- `pull_request.opened`
- `pull_request.edited`
- `pull_request.synchronize`

**Steps**:
1. Analyze PR changes
2. Query impact analysis
3. Apply PR labels
4. Link to Linear issues
5. Update knowledge graph

### Workflow 3: Linear Sync (Existing)
**File**: `.github/workflows/linear-sync.yml` (already exists)

**Enhancements**:
- Add knowledge graph updates
- Add impact analysis
- Add breaking change detection

---

## Scripts to Create

### 1. `scripts/linear/query-graph-context.js`
**Purpose**: Query Neo4j for issue context

**Input**: Issue title, description
**Output**: Similar issues, related components, team expertise

### 2. `scripts/linear/analyze-pr-changes.js`
**Purpose**: Analyze PR changes for impact

**Input**: PR number, base SHA, head SHA
**Output**: Changed files, components, breaking changes, complexity

### 3. `scripts/linear/query-impact-analysis.js`
**Purpose**: Query Neo4j for dependency impact

**Input**: Changed files, components
**Output**: Affected components, impact score, requires review

### 4. `scripts/linear/update-graph-issue.js`
**Purpose**: Update Neo4j with new issue

**Input**: GitHub issue number, Linear issue ID, metadata
**Output**: Creates nodes and relationships in Neo4j

### 5. `scripts/linear/update-graph-pr.js`
**Purpose**: Update Neo4j with PR relationships

**Input**: PR number, commit SHA, changed files
**Output**: Creates PR node and links to components/issues

### 6. `scripts/linear/link-pr-to-linear.js`
**Purpose**: Extract and link Linear issue IDs from PR

**Input**: PR number, PR body, commit messages
**Output**: Links PR to Linear issues, updates Linear with PR link

---

## Knowledge Graph Schema Extensions

### New Node Types
```cypher
// Person (team members)
CREATE (person:Person {
  name: 'Mathieu Wauters',
  email: 'mathieu@example.com',
  githubUsername: 'mawazawa'
})

// Team
CREATE (team:Team {
  name: 'JusticeOS™',
  id: '634ed991-7204-4dbb-9564-44c47a0cd3dd'
})

// PullRequest
CREATE (pr:PullRequest {
  number: 123,
  commit: 'abc123',
  title: 'Fix bug in BentoGrid',
  status: 'open'
})
```

### New Relationship Types
```cypher
// Team expertise
(Team)-[:HAS_EXPERTISE_IN]->(Component)

// Team membership
(Team)-[:HAS_MEMBER]->(Person)

// Issue assignment
(LinearIssue)-[:ASSIGNED_TO]->(Team)
(LinearIssue)-[:ASSIGNED_TO]->(Person)

// PR relationships
(PullRequest)-[:MODIFIES]->(Component)
(PullRequest)-[:RELATES_TO]->(LinearIssue)
(PullRequest)-[:CREATED_BY]->(Person)

// Issue relationships
(LinearIssue)-[:RELATES_TO]->(Component)
(LinearIssue)-[:DUPLICATE_OF]->(LinearIssue)
(LinearIssue)-[:BLOCKS]->(LinearIssue)
(LinearIssue)-[:BLOCKED_BY]->(LinearIssue)
```

---

## Success Metrics

| Metric | Baseline | Target | Method |
|--------|----------|--------|--------|
| Manual Triage Time | 15 min/issue | 0 min | 100% automation |
| Classification Accuracy | 60% | 90% | AI + Graph context |
| Priority Accuracy | 50% | 85% | Impact analysis |
| Assignment Accuracy | 40% | 80% | Expertise graph |
| Duplicate Detection | 20% | 85% | Embedding similarity |
| Breaking Change Detection | 30% | 90% | Dependency analysis |

---

## Integration with Knowledge Graph Strategy

### Synergies

1. **Issue Context Retrieval**
   - Use graph to find similar issues
   - Use graph to identify affected components
   - Use graph to suggest assignees

2. **PR Impact Analysis**
   - Use graph for dependency traversal
   - Use graph for breaking change detection
   - Use graph for code quality metrics

3. **Team Expertise**
   - Build expertise graph from issue history
   - Use for smart assignment
   - Use for workload balancing

4. **Historical Patterns**
   - Learn from past issue resolutions
   - Predict issue complexity
   - Suggest solutions from similar issues

---

## Next Steps

### Immediate (This Week)
1. ✅ Document strategy (this file)
2. ⏳ Create `.github/workflows/linear-triage.yml`
3. ⏳ Create `scripts/linear/query-graph-context.js`
4. ⏳ Create `scripts/linear/analyze-pr-changes.js`
5. ⏳ Test with sample issues

### Short-term (Next 2 Weeks)
1. Implement AI analysis integration
2. Build knowledge graph queries
3. Create update scripts
4. Test end-to-end workflows
5. Measure accuracy metrics

### Long-term (Next Month)
1. Advanced duplicate detection
2. Auto-assignment optimization
3. Priority escalation rules
4. Status automation
5. Multi-repo support

---

## Configuration

### Required Secrets
```yaml
LINEAR_API_KEY: # Linear workspace API key
ANTHROPIC_API_KEY: # Claude API key for analysis
NEO4J_URI: # Neo4j connection string
NEO4J_USERNAME: # Neo4j username
NEO4J_PASSWORD: # Neo4j password
```

### Linear Workspace Setup
1. Enable API access
2. Create team IDs mapping
3. Configure label structure
4. Set up webhooks (optional)

---

## References

1. **Linear Triage Intelligence**: Auto-apply suggestions (Sept 2025)
2. **Linear Copilot**: AI-powered issue analysis
3. **GitHub Actions**: Issue labeling patterns
4. **Knowledge Graph Strategy**: JUSTICE-301

---

**Status**: Ready for implementation  
**Owner**: AI Agent + Mathieu  
**Last Updated**: 2025-11-19

