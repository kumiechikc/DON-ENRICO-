# Setup

## Prerequisites

- **Node 18+** and **Python 3.x**
- **Claude Code** with plugins enabled (run `/plugin` once to enable)

## 1. Install dependencies

```bash
npm install
```

This installs Playwright (used by the design audit script).

## 2. Install the taste plugin (inside Claude Code)

```
/plugin install frontend-design@anthropics/claude-code
```

## 3. Configure API keys

### 21st.dev Magic MCP (component generation)

The 21st.dev Magic MCP is already configured in `.mcp.json` but needs an API key to work.

1. Get an API key at https://21st.dev/mcp
2. Set it via one of these methods:

**Option A — Environment variable (recommended):**
```bash
export API_KEY_21ST="your-key-here"
```

**Option B — `.claude/settings.local.json` (gitignored):**
```json
{
  "env": {
    "API_KEY_21ST": "your-key-here"
  }
}
```

### shadcn-ui MCP (optional GitHub token)

Works without authentication (60 req/hr). A GitHub Personal Access Token raises this
to 5,000 req/hr. To add one, edit `.mcp.json` and append `--github-api-key ghp_your_token`
to the `shadcn-ui` server's args array.

## 4. Approve the MCP servers

Open Claude Code in this directory. It reads `.mcp.json` and prompts you to approve the
project MCP servers. `.claude/settings.json` already sets `enableAllProjectMcpServers: true`,
so they load on start. Verify with `/mcp`.

**MCP servers included:**

| Server | Package | Purpose |
|--------|---------|---------|
| `playwright` | `@playwright/mcp` | Browser automation, screenshots, interaction testing |
| `chrome-devtools` | `chrome-devtools-mcp` | Deep DevTools debugging, performance profiling |
| `shadcn` | `shadcn@latest mcp` | Official shadcn/ui component search and install |
| `shadcn-ui` | `@jpisnice/shadcn-ui-mcp-server` | Extended shadcn browsing (blocks, themes, tweakcn) |
| `21st` | `@21st-dev/magic` | AI-powered React component generation (needs API key) |

## 5. Verify it works

```
> /design-plan portfolio site for a photographer, editorial and minimal
> Build the hero, then screenshot it at 375px and 1440px and fix anything that breaks.
> /design-review http://localhost:3000
```

You should see Claude pull tokens from `ui-ux-pro-max`, open a browser, screenshot, and
return ranked findings.

## Standalone audit (no Claude needed)

```bash
npm run audit -- --url http://localhost:3000
npm run audit -- --file ./index.html
```

Outputs `audit-output/report.md` + per-viewport screenshots. Exit code is non-zero when
there are high-severity findings (useful for CI — see `.github/workflows/design-review.yml`).

## Cloud environment notes

If running in a cloud environment (e.g., Claude Code Remote):
- Chromium is pre-installed at `/opt/pw-browsers/chromium`
- Set `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers` if Playwright can't find it
- No need to run `npx playwright install chromium`

---

## Optional add-ons

### Figma Dev Mode MCP
Requires the Figma desktop app. Enable Dev Mode, toggle the MCP server on, then add to
`.mcp.json`:

```json
"figma": { "url": "http://127.0.0.1:3845/mcp" }
```

Guide: https://help.figma.com/hc/en-us/articles/39888612464151

## Troubleshooting

- **`/mcp` shows a server failed** — run its command manually to see the error, e.g.
  `npx -y @playwright/mcp@latest`. Usually a Node version or network/proxy issue.
- **Audit can't find Chromium** — run `npx playwright install chromium`, or set
  `PW_EXECUTABLE_PATH` to your Chromium binary.
- **21st MCP shows auth error** — check that `API_KEY_21ST` is set. Get a new key
  at https://21st.dev/mcp if your old one was reset.
- **shadcn-ui rate limited** — add a GitHub Personal Access Token via `--github-api-key`.
