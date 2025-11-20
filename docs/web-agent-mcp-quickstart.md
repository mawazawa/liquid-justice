# Web Agent MCP Setup - Quick Start

**Status**: ✅ Configuration Ready  
**Date**: 2025-11-19

---

## ✅ What's Been Set Up

1. **`.mcp.json`** - MCP server configuration file
2. **`.env.web-agent.example`** - Environment variables template
3. **`scripts/setup-web-agent-mcp.sh`** - Setup script
4. **`scripts/test-mcp-connections.js`** - Connection test script

---

## 🚀 Quick Setup Steps

### Step 1: Run Setup Script

```bash
cd /Users/mathieuwauters/Desktop/code/liquid-justice
./scripts/setup-web-agent-mcp.sh
```

### Step 2: Configure Environment Variables

Edit `.env.web-agent` (or set in web agent UI):

```bash
# Neo4j (Required)
NEO4J_URI=neo4j+s://3884f0bc.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_actual_password
NEO4J_DATABASE=neo4j

# Linear (Required)
LINEAR_API_KEY=your_linear_api_key

# GitHub (Optional - can use MCP or direct API)
GITHUB_TOKEN=your_github_token

# Supabase (Optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_key
SUPABASE_SERVICE_KEY=your_service_key
```

### Step 3: Test Connections

```bash
node scripts/test-mcp-connections.js
```

### Step 4: Configure in Web Agent

1. **Copy `.mcp.json`** to your web agent project
2. **Set environment variables** in web agent configuration UI
3. **Test access** from within web agent

---

## 📋 MCP Servers Configured

| Service | MCP URL | Transport | Status |
|---------|---------|-----------|--------|
| **Linear** | `https://mcp.linear.app/mcp` | HTTP | ✅ Ready |
| **Neo4j** | Environment vars OR MCP | HTTP/Direct | ✅ Ready |
| **GitHub** | `https://mcp.github.com/mcp` | HTTP | ✅ Ready |
| **Supabase** | `https://mcp.supabase.com/mcp` | HTTP | ✅ Ready |

---

## 🧪 Testing

### Test from Command Line

```bash
# Test MCP server connectivity
node scripts/test-mcp-connections.js

# Check environment variables
./scripts/setup-web-agent-mcp.sh
```

### Test from Web Agent

Once configured in web agent, try:

```
Query Linear for all issues in JusticeOS project
```

```
Query Neo4j knowledge graph for all components
```

```
List all open pull requests in the repository
```

```
Show me all tables in Supabase database
```

---

## 🔧 Troubleshooting

### Issue: MCP Server Not Accessible

**Solution**:
- Verify server URL is correct
- Check network permissions in sandbox
- Ensure environment variables are set

### Issue: Neo4j Connection Fails

**Solution**:
- Verify `NEO4J_URI` format (neo4j+s:// or bolt://)
- Check credentials are correct
- Test connection: `node -e "console.log(process.env.NEO4J_URI)"`

### Issue: Linear API Errors

**Solution**:
- Verify `LINEAR_API_KEY` is valid
- Check API key has necessary permissions
- Ensure MCP server URL is correct

---

## 📝 Files Created

- ✅ `.mcp.json` - MCP server configuration
- ✅ `.env.web-agent.example` - Environment variables template
- ✅ `scripts/setup-web-agent-mcp.sh` - Setup script
- ✅ `scripts/test-mcp-connections.js` - Test script
- ✅ `docs/claude-code-web-agents-mcp-setup.md` - Full documentation
- ✅ `docs/web-agent-mcp-quickstart.md` - This file

---

## 🎯 Next Steps

1. ✅ Configuration files created
2. ⏳ Set actual credentials in `.env.web-agent`
3. ⏳ Copy `.mcp.json` to web agent project
4. ⏳ Configure environment variables in web agent UI
5. ⏳ Test connections from web agent

---

**Status**: Ready for Web Agent Configuration  
**Last Updated**: 2025-11-19

