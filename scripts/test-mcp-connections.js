#!/usr/bin/env node
/**
 * Test MCP Connections for Web Agents
 * 
 * This script tests connectivity to MCP servers and validates configuration
 */

import https from 'https';
import http from 'http';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: 5000 }, (res) => {
      resolve({ success: true, status: res.statusCode });
    });
    
    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function testMcpServers() {
  log('\n🧪 Testing MCP Server Connections\n', 'blue');
  
  const servers = [
    {
      name: 'Linear MCP',
      url: 'https://mcp.linear.app/mcp',
      required: true,
    },
    {
      name: 'Neo4j MCP',
      url: 'https://mcp.neo4j.com/mcp',
      required: false,
      note: 'Neo4j can also use direct connection via environment variables',
    },
    {
      name: 'GitHub MCP',
      url: 'https://mcp.github.com/mcp',
      required: false,
      note: 'GitHub can also use direct API with GITHUB_TOKEN',
    },
    {
      name: 'Supabase MCP',
      url: 'https://mcp.supabase.com/mcp',
      required: false,
    },
  ];
  
  const results = [];
  
  for (const server of servers) {
    log(`Testing ${server.name}...`, 'yellow');
    const result = await testUrl(server.url);
    
    if (result.success) {
      log(`  ✅ ${server.name}: Accessible (Status: ${result.status})`, 'green');
      results.push({ name: server.name, status: 'success', url: server.url });
    } else {
      log(`  ⚠️  ${server.name}: ${result.error}`, 'red');
      if (server.note) {
        log(`     Note: ${server.note}`, 'yellow');
      }
      results.push({ name: server.name, status: 'failed', error: result.error, url: server.url });
    }
  }
  
  log('\n📊 Test Results Summary\n', 'blue');
  
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  log(`✅ Successful: ${successful}`, 'green');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  
  log('\n💡 Recommendations:\n', 'blue');
  
  if (results.find(r => r.name === 'Linear MCP' && r.status === 'success')) {
    log('✅ Linear MCP is accessible - ready to use', 'green');
  } else {
    log('⚠️  Linear MCP may require authentication or different URL', 'yellow');
  }
  
  log('✅ Neo4j: Use environment variables for direct connection (recommended)', 'green');
  log('✅ GitHub: Use GITHUB_TOKEN environment variable for direct API access', 'green');
  log('✅ Supabase: Use Composio MCP or direct connection', 'green');
  
  log('\n📝 Next Steps:\n', 'blue');
  log('1. Verify .mcp.json configuration is correct', 'yellow');
  log('2. Set environment variables in web agent setup', 'yellow');
  log('3. Test connections from within web agent', 'yellow');
  
  return results;
}

// Check environment variables
function checkEnvVars() {
  log('\n🔍 Checking Environment Variables\n', 'blue');
  
  const requiredVars = {
    'NEO4J_URI': process.env.NEO4J_URI,
    'NEO4J_USERNAME': process.env.NEO4J_USERNAME,
    'NEO4J_PASSWORD': process.env.NEO4J_PASSWORD ? '***' : undefined,
    'LINEAR_API_KEY': process.env.LINEAR_API_KEY ? '***' : undefined,
    'GITHUB_TOKEN': process.env.GITHUB_TOKEN ? '***' : undefined,
  };
  
  const optionalVars = {
    'SUPABASE_URL': process.env.SUPABASE_URL,
    'SUPABASE_KEY': process.env.SUPABASE_KEY ? '***' : undefined,
    'SUPABASE_SERVICE_KEY': process.env.SUPABASE_SERVICE_KEY ? '***' : undefined,
  };
  
  log('Required Variables:', 'yellow');
  let allRequired = true;
  for (const [key, value] of Object.entries(requiredVars)) {
    if (value) {
      log(`  ✅ ${key}: Set`, 'green');
    } else {
      log(`  ❌ ${key}: Not set`, 'red');
      allRequired = false;
    }
  }
  
  log('\nOptional Variables:', 'yellow');
  for (const [key, value] of Object.entries(optionalVars)) {
    if (value) {
      log(`  ✅ ${key}: Set`, 'green');
    } else {
      log(`  ⚠️  ${key}: Not set (optional)`, 'yellow');
    }
  }
  
  if (!allRequired) {
    log('\n⚠️  Some required environment variables are missing', 'red');
    log('   Set them in .env.web-agent or web agent configuration', 'yellow');
  }
  
  return allRequired;
}

// Main execution
async function main() {
  log('🚀 Claude Code Web Agent MCP Connection Test\n', 'blue');
  
  const envOk = checkEnvVars();
  const results = await testMcpServers();
  
  log('\n✨ Test Complete!\n', 'blue');
  
  if (envOk && results.some(r => r.status === 'success')) {
    log('✅ Configuration looks good!', 'green');
    log('   You can proceed with web agent setup.', 'green');
  } else {
    log('⚠️  Some issues detected. Please review the output above.', 'yellow');
  }
}

main().catch(console.error);

