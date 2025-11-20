# Quick Start: Claude OAuth Token Setup

## ✅ Your OAuth Token is Ready!

Your OAuth token has been extracted and is ready to use. Here's how to set it up:

---

## Step 1: Add Token to GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. **Name**: `CLAUDE_CODE_OAUTH_TOKEN`
5. **Value**: Paste your OAuth token (starts with `sk-ant-oat01-...`)
6. Click **Add secret**

---

## Step 2: Verify Workflow Configuration

The workflow (`.github/workflows/linear-triage.yml`) is already configured to use the OAuth token:

```yaml
env:
  # Uses OAuth token (preferred) or falls back to API key
  ANTHROPIC_API_KEY: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN || secrets.ANTHROPIC_API_KEY }}
```

This means:
- ✅ If `CLAUDE_CODE_OAUTH_TOKEN` is set → Uses your CloudMax subscription
- ✅ If not set → Falls back to `ANTHROPIC_API_KEY` (if configured)

---

## Step 3: Extract Token Again (If Needed)

If you need to extract the token again:

```bash
# Method 1: Use the helper script
./scripts/get-claude-oauth-token.sh

# Method 2: Manual extraction
cat ~/.claude/.credentials.json | jq -r '.claudeAiOauth.accessToken'
```

---

## Benefits

✅ **No API charges** - Uses your CloudMax subscription  
✅ **No separate billing** - Charges go to your subscription  
✅ **Same functionality** - Works exactly like API key  
✅ **Automatic refresh** - OAuth tokens auto-refresh when needed  

---

## Troubleshooting

### Token Not Working?

1. **Check token format**: Should start with `sk-ant-oat01-`
2. **Verify subscription**: Ensure you have an active CloudMax subscription
3. **Re-authenticate**: Run `claude auth login` again
4. **Check expiration**: OAuth tokens expire, but should auto-refresh

### Token Expired?

```bash
# Re-authenticate
claude auth login

# Extract new token
./scripts/get-claude-oauth-token.sh
```

---

## Security Notes

⚠️ **Never commit tokens to code**  
⚠️ **Use GitHub Secrets only**  
⚠️ **Rotate tokens if exposed**  
⚠️ **OAuth tokens are tied to your subscription**  

---

**Last Updated**: 2025-11-19

