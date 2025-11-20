# Claude OAuth Token Setup for CloudMax Subscription

**Purpose**: Use your CloudMax subscription instead of paying for API usage in GitHub Actions.

---

## How to Get Your OAuth Token

### Method 1: Extract from Credentials File (Recommended)

1. **Authenticate with Claude Code** (if not already done):
   ```bash
   claude auth login
   ```
   This will open a browser for OAuth authentication.

2. **Extract the OAuth Token**:
   ```bash
   # On macOS/Linux
   cat ~/.claude/.credentials.json | jq -r '.claudeAiOauth.accessToken'
   
   # Or manually view the file
   cat ~/.claude/.credentials.json
   ```

3. **The token format** will be: `sk-ant-oat01-...` (starts with `sk-ant-oat`)

### Method 2: Use Claude Setup Token Command

```bash
# Generate a setup token (if available in your version)
claude setup-token
```

This may output a token you can use directly.

### Method 3: Check Current Authentication

```bash
# Check if you're authenticated
claude auth status

# If authenticated with OAuth, the token is in:
# ~/.claude/.credentials.json
```

---

## Token Location

The OAuth token is stored in:
- **macOS/Linux**: `~/.claude/.credentials.json`
- **Windows**: `%USERPROFILE%\.claude\.credentials.json`

**File Structure**:
```json
{
  "claudeAiOauth": {
    "accessToken": "sk-ant-oat01-...",
    "subscriptionType": "max",
    "expiresAt": "..."
  }
}
```

---

## Add to GitHub Secrets

1. Go to your repository: **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `CLAUDE_CODE_OAUTH_TOKEN`
4. Value: Paste your OAuth token (starts with `sk-ant-oat01-...`)
5. Click **Add secret**

---

## Update GitHub Actions Workflow

Instead of using `ANTHROPIC_API_KEY`, use `claude_code_oauth_token`:

```yaml
- name: Analyze issue with AI
  uses: anthropics/claude-code-action@beta
  with:
    # Use OAuth token instead of API key
    claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
    # ... other inputs
```

Or if using the Anthropic API directly:

```yaml
env:
  CLAUDE_CODE_OAUTH_TOKEN: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
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

OAuth tokens should auto-refresh, but if you get errors:

```bash
# Re-authenticate
claude auth login

# Extract new token
cat ~/.claude/.credentials.json | jq -r '.claudeAiOauth.accessToken'
```

### GitHub Actions Failing?

1. Verify secret name matches: `CLAUDE_CODE_OAUTH_TOKEN`
2. Check token is correctly set in repository secrets
3. Ensure workflow uses `claude_code_oauth_token` input (not `anthropic_api_key`)

---

## Security Notes

⚠️ **Never commit tokens to code**  
⚠️ **Use GitHub Secrets only**  
⚠️ **Rotate tokens if exposed**  
⚠️ **OAuth tokens are tied to your subscription**  

---

## References

- [Claude Code GitHub Actions Docs](https://docs.anthropic.com/en/docs/claude-code/github-actions)
- [Claude Code Setup](https://docs.anthropic.com/en/docs/claude-code/setup)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

**Last Updated**: 2025-11-19

