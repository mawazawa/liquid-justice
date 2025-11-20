#!/bin/bash
# Setup script for Claude Code Web Agent MCP Configuration
# This script helps configure MCP servers for web agents

set -e

echo "🚀 Setting up Claude Code Web Agent MCP Configuration"
echo ""

# Check if .mcp.json exists
if [ ! -f ".mcp.json" ]; then
    echo "❌ .mcp.json not found. Creating it..."
    # The file should already be created, but just in case
    echo "✅ .mcp.json should exist. If not, create it manually."
fi

# Check for environment variables file
if [ ! -f ".env.web-agent" ]; then
    echo "📝 Creating .env.web-agent from template..."
    if [ -f ".env.web-agent.example" ]; then
        cp .env.web-agent.example .env.web-agent
        echo "✅ Created .env.web-agent"
        echo "⚠️  Please edit .env.web-agent and add your actual credentials"
    else
        echo "❌ .env.web-agent.example not found"
    fi
else
    echo "✅ .env.web-agent already exists"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Edit .env.web-agent with your actual credentials"
echo "2. In Claude Code Web Agent setup, add these environment variables:"
echo ""
echo "   NEO4J_URI=neo4j+s://3884f0bc.databases.neo4j.io"
echo "   NEO4J_USERNAME=neo4j"
echo "   NEO4J_PASSWORD=<your_password>"
echo "   NEO4J_DATABASE=neo4j"
echo "   LINEAR_API_KEY=<your_linear_key>"
echo "   GITHUB_TOKEN=<your_github_token>"
echo "   SUPABASE_URL=<your_supabase_url>"
echo "   SUPABASE_KEY=<your_supabase_key>"
echo "   SUPABASE_SERVICE_KEY=<your_service_key>"
echo ""
echo "3. Copy .mcp.json to your web agent project"
echo "4. Test the connection in your web agent"
echo ""
echo "✅ Setup complete!"

