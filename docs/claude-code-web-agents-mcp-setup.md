# Claude Code Web Agents: MCP Access Guide

**Date**: 2025-11-19  
**Purpose**: Configure web agents to access Linear, Neo4j, GitHub, and Supabase via MCP

---

## Key Findings

### ✅ What Web Agents CAN Access

1. **Remote MCP Servers** (HTTP/SSE transport)
   - Linear MCP: `https://mcp.linear.app/mcp`
   - GitHub MCP: Remote HTTP servers
   - Supabase MCP: Remote HTTP servers
   - Neo4j MCP: Remote HTTP servers

2. **Environment Variables**
   - Can be configured in web agent setup
   - Accessible to MCP servers running in web environment
   - Secure credential storage

3. **External APIs**
   - With network permissions configured
   - Through sandbox network isolation controls

### ❌ What Web Agents CANNOT Access

1. **Local stdio MCP Servers**
   - These run on your local machine
   - Web agents are in cloud sandboxes
   - Solution: Use remote HTTP/SSE MCP servers instead

2. **Local MCP Memory**
   - Your local `~/.cursor/mcp.json` configuration
   - Local file system access
   - Solution: Configure MCP servers in web agent environment

---

## Configuration Methods

### Method 1: Environment Variables (Recommended for Neo4j)

Web agents can access Neo4j directly via environment variables:

```bash
# In web agent setup/configuration
NEO4J_URI=neo4j+s://3884f0bc.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=neo4j
```

**How to Set**:
1. In Claude Code web agent setup
2. Go to environment configuration
3. Add these variables
4. Web agent can now connect to Neo4j directly

### Method 2: Remote MCP Servers (Recommended for Linear, GitHub, Supabase)

#### Linear MCP Setup

**Official Linear MCP Server**:
```bash
# Add to web agent MCP configuration
claude mcp add --transport http --scope project linear https://mcp.linear.app/mcp
```

**Configuration**:
```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["mcp-remote", "https://mcp.linear.app/mcp"],
      "env": {
        "LINEAR_API_KEY": "your_linear_api_key"
      }
    }
  }
}
```

**In Web Agent**:
- Linear MCP server is accessible via HTTP
- Web agent can query Linear issues, create tasks, update status
- Real-time access to Linear data

#### GitHub MCP Setup

**Option 1: GitHub MCP via HTTP**
```bash
# Add GitHub MCP server
claude mcp add --transport http --scope project github https://mcp.github.com/mcp
```

**Option 2: Use GitHub API directly**
```bash
# Set environment variables
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your_org
GITHUB_REPO=your_repo
```

**Configuration**:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["mcp-remote", "https://mcp.github.com/mcp"],
      "env": {
        "GITHUB_TOKEN": "your_github_token"
      }
    }
  }
}
```

#### Supabase MCP Setup

**Option 1: Composio Supabase MCP** (Recommended)
```bash
# Install via Composio
npx @composio/mcp@latest setup "supabase" "your-config-id" --client
```

**Option 2: Direct Supabase MCP**
```bash
# Add Supabase MCP server
claude mcp add --transport http --scope project supabase https://mcp.supabase.com/mcp
```

**Configuration**:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["mcp-remote", "https://mcp.supabase.com/mcp"],
      "env": {
        "SUPABASE_URL": "your_supabase_url",
        "SUPABASE_KEY": "your_supabase_key",
        "SUPABASE_SERVICE_KEY": "your_service_key"
      }
    }
  }
}
```

#### Neo4j MCP Setup

**Option 1: Direct Connection (Environment Variables)**
```bash
# Set in web agent environment
NEO4J_URI=neo4j+s://3884f0bc.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=neo4j
```

**Option 2: Neo4j MCP Server (Remote HTTP)**
```bash
# If you have a remote Neo4j MCP server
claude mcp add --transport http --scope project neo4j https://your-neo4j-mcp-server.com/mcp
```

**Configuration**:
```json
{
  "mcpServers": {
    "neo4j": {
      "command": "npx",
      "args": ["mcp-remote", "https://your-neo4j-mcp-server.com/mcp"],
      "env": {
        "NEO4J_URI": "neo4j+s://3884f0bc.databases.neo4j.io",
        "NEO4J_USERNAME": "neo4j",
        "NEO4J_PASSWORD": "your_password",
        "NEO4J_DATABASE": "neo4j"
      }
    }
  }
}
```

---

## Web Agent Configuration

### Setting Up Environment Variables

**In Claude Code Web Agent**:

1. **Access Web Agent Settings**
   - Go to web agent configuration
   - Navigate to "Environment Variables" section

2. **Add Variables**
   ```
   NEO4J_URI=neo4j+s://3884f0bc.databases.neo4j.io
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=your_password
   NEO4J_DATABASE=neo4j
   
   LINEAR_API_KEY=your_linear_api_key
   
   GITHUB_TOKEN=your_github_token
   
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   SUPABASE_SERVICE_KEY=your_service_key
   ```

3. **Configure Network Permissions**
   - Allow access to:
     - `mcp.linear.app`
     - `api.github.com`
     - `your-supabase-project.supabase.co`
     - `3884f0bc.databases.neo4j.io` (Neo4j)

### Setting Up MCP Servers

**In Web Agent MCP Configuration**:

1. **Create `.mcp.json` in Web Agent Project**
   ```json
   {
     "mcpServers": {
       "linear": {
         "command": "npx",
         "args": ["mcp-remote", "https://mcp.linear.app/mcp"],
         "env": {
           "LINEAR_API_KEY": "${LINEAR_API_KEY}"
         }
       },
       "github": {
         "command": "npx",
         "args": ["mcp-remote", "https://mcp.github.com/mcp"],
         "env": {
           "GITHUB_TOKEN": "${GITHUB_TOKEN}"
         }
       },
       "supabase": {
         "command": "npx",
         "args": ["mcp-remote", "https://mcp.supabase.com/mcp"],
         "env": {
           "SUPABASE_URL": "${SUPABASE_URL}",
           "SUPABASE_KEY": "${SUPABASE_KEY}",
           "SUPABASE_SERVICE_KEY": "${SUPABASE_SERVICE_KEY}"
         }
       }
     }
   }
   ```

2. **Environment Variable Expansion**
   - Use `${VARIABLE_NAME}` syntax
   - Variables are expanded from web agent environment

---

## Complete Setup Example

### Step 1: Configure Web Agent Environment

```bash
# In web agent setup
export NEO4J_URI="neo4j+s://3884f0bc.databases.neo4j.io"
export NEO4J_USERNAME="neo4j"
export NEO4J_PASSWORD="your_password"
export NEO4J_DATABASE="neo4j"

export LINEAR_API_KEY="your_linear_api_key"
export GITHUB_TOKEN="your_github_token"
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_KEY="your_supabase_key"
export SUPABASE_SERVICE_KEY="your_service_key"
```

### Step 2: Add MCP Servers

```bash
# Add Linear MCP
claude mcp add --transport http --scope project linear https://mcp.linear.app/mcp

# Add GitHub MCP (if available)
claude mcp add --transport http --scope project github https://mcp.github.com/mcp

# Add Supabase MCP
claude mcp add --transport http --scope project supabase https://mcp.supabase.com/mcp
```

### Step 3: Test Access

**Test Linear**:
```
Query Linear for all issues in JusticeOS project
```

**Test Neo4j**:
```javascript
// In web agent
const neo4j = require('neo4j-driver');
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);
const session = driver.session();
const result = await session.run('MATCH (n) RETURN count(n) as count');
console.log(result.records[0].get('count'));
```

**Test GitHub**:
```
List all open pull requests in the repository
```

**Test Supabase**:
```
Show me all tables in the Supabase database
```

---

## Security Considerations

### ✅ Best Practices

1. **Use Environment Variables**
   - Never hardcode credentials
   - Use web agent's secure environment variable storage

2. **Network Isolation**
   - Configure allowed domains in sandbox
   - Only allow necessary API endpoints

3. **Scope MCP Servers**
   - Use `--scope project` for shared access
   - Use `--scope local` for personal access only

4. **Rotate Credentials**
   - Regularly rotate API keys
   - Use service accounts with minimal permissions

### ⚠️ Limitations

1. **Local MCP Servers**
   - Cannot access local stdio MCP servers
   - Must use remote HTTP/SSE servers

2. **Local File System**
   - Cannot access local `~/.cursor/mcp.json`
   - Must configure in web agent environment

3. **Memory MCP**
   - Cannot access local MCP memory
   - Use Neo4j or other remote storage instead

---

## Troubleshooting

### Issue: MCP Server Not Accessible

**Solution**:
- Verify server uses HTTP/SSE transport (not stdio)
- Check network permissions in sandbox
- Verify environment variables are set

### Issue: Neo4j Connection Fails

**Solution**:
- Verify `NEO4J_URI` format (bolt:// or neo4j+s://)
- Check credentials are correct
- Ensure network access to Neo4j instance

### Issue: Linear API Errors

**Solution**:
- Verify `LINEAR_API_KEY` is valid
- Check API key has necessary permissions
- Ensure MCP server URL is correct

---

## Summary

### ✅ What Works

- **Linear**: ✅ Remote MCP server (`https://mcp.linear.app/mcp`)
- **Neo4j**: ✅ Environment variables OR remote MCP server
- **GitHub**: ✅ Remote MCP server OR direct API with token
- **Supabase**: ✅ Remote MCP server (Composio or direct)

### ❌ What Doesn't Work

- **Local stdio MCP servers**: ❌ (web agents are in cloud)
- **Local MCP memory**: ❌ (local machine only)
- **Local file system**: ❌ (sandboxed)

### 🎯 Recommended Approach

1. **Neo4j**: Use environment variables (direct connection)
2. **Linear**: Use official MCP server (`https://mcp.linear.app/mcp`)
3. **GitHub**: Use GitHub MCP server or direct API
4. **Supabase**: Use Composio Supabase MCP or direct MCP server

---

**Status**: Ready for Implementation  
**Last Updated**: 2025-11-19

